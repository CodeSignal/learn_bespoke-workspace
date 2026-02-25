import Modal from './design-system/components/modal/modal.js';
import SimulationLoader from './simulation-loader.js';
import EventBus from './event-bus.js';
import TabNotifier from './tab-notifier.js';
import ScenarioEngine from './scenario-engine.js';

let websocket = null;
let helpModal = null;
let loader = null;
let eventBus = null;
let notifier = null;
let scenarioEngine = null;

function initializeWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws`;

  try {
    websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.message) {
          if (loader) {
            loader.sendMessage(data);
          } else {
            alert(data.message);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        initializeWebSocket();
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }
}

async function initializeHelpModal() {
  try {
    const response = await fetch('./help-content.html');
    const helpContent = await response.text();

    helpModal = Modal.createHelpModal({
      title: 'Help / User Guide',
      content: helpContent
    });

    const helpButton = document.getElementById('btn-help');
    if (helpButton) {
      helpButton.addEventListener('click', () => helpModal.open());
    }
  } catch (error) {
    console.error('Failed to load help content:', error);
    helpModal = Modal.createHelpModal({
      title: 'Help / User Guide',
      content: '<p>Help content could not be loaded.</p>'
    });
    const helpButton = document.getElementById('btn-help');
    if (helpButton) {
      helpButton.addEventListener('click', () => helpModal.open());
    }
  }
}

async function initializeSimulations() {
  const containerEl = document.getElementById('sim-container');
  const tabBarEl = document.getElementById('sim-tab-bar');

  eventBus = new EventBus();

  loader = new SimulationLoader({
    containerEl,
    tabBarEl,
    eventBus,
    onActivate: (simId) => {
      console.log(`Simulation activated: ${simId}`);
      if (notifier) notifier.clearBadge(simId);
    },
    onDeactivate: (simId) => {
      console.log(`Simulation deactivated: ${simId}`);
    }
  });

  notifier = new TabNotifier(loader);
  scenarioEngine = new ScenarioEngine({ eventBus, loader, notifier });

  try {
    const configRes = await fetch('/simulations/simulations.json');
    const config = await configRes.json();

    await loader.loadConfig('/simulations/simulations.json');

    const urlParams = new URLSearchParams(window.location.search);
    const scenarioParam = urlParams.get('scenario') || config.scenario;
    if (scenarioParam) {
      await scenarioEngine.loadScenario(`/simulations/scenarios/${scenarioParam}.js`);
    }
  } catch (error) {
    console.error('Failed to load simulations config:', error);
    containerEl.innerHTML = `
      <div class="sim-empty">
        <p>No simulations configured. Place simulations.json in the simulations/ directory.</p>
      </div>
    `;
  }
}

async function initialize() {
  await initializeHelpModal();
  initializeWebSocket();
  await initializeSimulations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

export { eventBus, loader, notifier, scenarioEngine };
