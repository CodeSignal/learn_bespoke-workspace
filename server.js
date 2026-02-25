const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let WebSocket = null;
let isWebSocketAvailable = false;
try {
  WebSocket = require('ws');
  isWebSocketAvailable = true;
  console.log('WebSocket support enabled');
} catch (error) {
  console.log('WebSocket support disabled (ws package not installed)');
  console.log('Install with: npm install ws');
}

const DIST_DIR = path.join(__dirname, 'dist');
const SIMULATIONS_DIR = path.join(__dirname, 'simulations');
const isProduction = process.env.IS_PRODUCTION === 'true';
if (isProduction && !fs.existsSync(DIST_DIR)) {
  throw new Error(`Production mode enabled but dist directory does not exist: ${DIST_DIR}`);
}
const PORT = process.env.PORT || 3000;
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

const wsClients = new Set();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// --- Simulation proxy registry ---

let simUrlMap = new Map();

function loadSimulationConfig() {
  const configPath = path.join(SIMULATIONS_DIR, 'simulations.json');
  try {
    if (!fs.existsSync(configPath)) {
      console.log('No simulations.json found -- proxy disabled, serving from filesystem');
      return;
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw);
    simUrlMap = new Map();
    for (const sim of (config.simulations || [])) {
      if (sim.url) {
        simUrlMap.set(sim.id, sim.url);
        console.log(`  Proxy: /simulations/${sim.id}/* -> ${sim.url}`);
      }
    }
    if (simUrlMap.size === 0) {
      console.log('No simulation URLs configured -- serving from filesystem');
    }
  } catch (err) {
    console.error('Failed to load simulations.json:', err.message);
  }
}

function proxyRequest(req, res, targetUrl) {
  const parsed = new URL(targetUrl);

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.pathname + parsed.search,
    method: req.method,
    headers: { ...req.headers, host: parsed.host }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error -> ${targetUrl}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Simulation server unavailable' }));
    }
  });

  req.pipe(proxyReq);
}

function tryProxy(req, res, pathName) {
  if (!pathName.startsWith('/simulations/')) return false;

  const rest = pathName.slice('/simulations/'.length);
  const slashIdx = rest.indexOf('/');
  const simId = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
  const simPath = slashIdx === -1 ? '/' : rest.slice(slashIdx);

  const targetBase = simUrlMap.get(simId);
  if (!targetBase) return false;

  const targetUrl = targetBase.replace(/\/+$/, '') + simPath;
  proxyRequest(req, res, targetUrl);
  return true;
}

// --- Host API handlers ---

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function handleOrchestrateRequest(req, res) {
  try {
    const data = await readBody(req);
    const { event, history, scenario } = data;

    if (!event || !scenario) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'event and scenario are required' }));
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ actions: [] }));
      return;
    }

    const systemPrompt = `You are a scenario orchestrator for a workplace simulation platform. Your job is to decide what cross-application actions should be triggered when a user performs an action.

SCENARIO: ${scenario.description || 'No description provided.'}
${scenario.llmContext || ''}

AVAILABLE ACTIONS (by target simulation):
${JSON.stringify(scenario.actionSchemas || {}, null, 2)}

RULES:
- Only return actions that make sense for the scenario and the user's behavior.
- Return an empty actions array if no reaction is needed.
- Each action must have: target (simulation id), type (action type from schemas), payload (object with relevant data).
- Keep it realistic -- not every user action needs a reaction.
- Respond ONLY with valid JSON, no markdown.`;

    const userContent = `EVENT HISTORY (last ${(history || []).length} events):
${JSON.stringify((history || []).slice(-10), null, 2)}

NEW EVENT:
${JSON.stringify(event, null, 2)}

Based on this event and the scenario context, what actions (if any) should be dispatched to other simulations? Return JSON: { "actions": [...], "reasoning": "..." }`;

    const apiRes = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!apiRes.ok) {
      console.error('OpenAI orchestrate error:', apiRes.status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ actions: [] }));
      return;
    }

    const result = await apiRes.json();
    const raw = result.choices?.[0]?.message?.content || '{"actions":[]}';

    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = { actions: [] }; }

    const validActions = (parsed.actions || []).filter(a =>
      a.target && a.type && typeof a.target === 'string'
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ actions: validActions, reasoning: parsed.reasoning || '' }));
  } catch (error) {
    console.error('Orchestrate endpoint error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

async function handleGuardRequest(req, res) {
  try {
    const data = await readBody(req);
    const { question, event, scenarioDescription } = data;

    if (!question || !event) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'question and event are required' }));
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ allow: true }));
      return;
    }

    const systemPrompt = `You are a guard for a workplace simulation scenario engine. You will be given a scenario context, a user interaction event, and a yes/no question. Answer ONLY with JSON: { "allow": true } or { "allow": false }. No explanation needed.

SCENARIO: ${scenarioDescription || 'Workplace simulation.'}`;

    const userContent = `EVENT:
${JSON.stringify(event, null, 2)}

QUESTION: ${question}`;

    const apiRes = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        max_tokens: 20,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!apiRes.ok) {
      console.error('OpenAI guard error:', apiRes.status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ allow: true }));
      return;
    }

    const result = await apiRes.json();
    const raw = result.choices?.[0]?.message?.content || '{"allow":true}';
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { allow: true }; }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ allow: !!parsed.allow }));
  } catch (error) {
    console.error('Guard endpoint error:', error);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ allow: true }));
  }
}

function handlePostRequest(req, res, parsedUrl) {
  if (parsedUrl.pathname === '/api/guard') {
    handleGuardRequest(req, res);
    return;
  }

  if (parsedUrl.pathname === '/api/orchestrate') {
    handleOrchestrateRequest(req, res);
    return;
  }

  if (parsedUrl.pathname === '/message') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const message = data.message;

        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          return;
        }

        if (!isWebSocketAvailable) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'WebSocket functionality not available',
            details: 'Install the ws package with: npm install ws'
          }));
          return;
        }

        wsClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', message: message }));
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clientCount: wsClients.size }));

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

// --- HTTP server ---

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathName = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;

  if (tryProxy(req, res, parsedUrl.pathname)) return;

  if (req.method === 'POST') {
    handlePostRequest(req, res, parsedUrl);
    return;
  }

  // Serve local simulation files (simulations.json, scenarios/) that aren't proxied
  if (pathName.startsWith('/simulations/')) {
    const simPath = pathName.replace(/^\/simulations\//, '');
    const filePath = path.join(SIMULATIONS_DIR, simPath);

    const resolvedSimDir = path.resolve(SIMULATIONS_DIR);
    const resolvedFilePath = path.resolve(filePath);
    const relativePath = path.relative(resolvedSimDir, resolvedFilePath);

    if (relativePath.startsWith('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    serveFile(filePath, res);
    return;
  }

  if (isProduction) {
    let filePath = path.join(DIST_DIR, pathName.replace(/^\/+/, ''));

    const resolvedDistDir = path.resolve(DIST_DIR);
    const resolvedFilePath = path.resolve(filePath);
    const relativePath = path.relative(resolvedDistDir, resolvedFilePath);

    if (relativePath.startsWith('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    serveFile(filePath, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found (development mode - use Vite dev server `npm run start:dev`)');
  }
});

if (isWebSocketAvailable) {
  const wss = new WebSocket.Server({
    server,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
}

loadSimulationConfig();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (isProduction) {
    console.log(`Serving static files from: ${DIST_DIR}`);
  } else {
    console.log(`Development mode - static files served by Vite`);
  }
  if (simUrlMap.size > 0) {
    console.log(`Proxying ${simUrlMap.size} simulation(s)`);
  }
  if (isWebSocketAvailable) {
    console.log(`WebSocket server running on /ws`);
  }
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
