export default class SimulationLoader {
  constructor({ containerEl, tabBarEl, eventBus, onActivate, onDeactivate }) {
    this._container = containerEl;
    this._tabBar = tabBarEl;
    this._eventBus = eventBus;
    this._onActivate = onActivate || (() => {});
    this._onDeactivate = onDeactivate || (() => {});

    this._simulations = [];
    this._activeId = null;
    this._mountedModules = new Map();
    this._mountedSlots = new Map();
    this._actionWrappers = new Map();

    this._logBuffer = [];
    this._logFlushTimer = null;
  }

  get activeId() {
    return this._activeId;
  }

  get simulations() {
    return this._simulations;
  }

  async loadConfig(configUrl) {
    const res = await fetch(configUrl);
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    const config = await res.json();
    this._simulations = config.simulations || [];

    const urlParams = new URLSearchParams(window.location.search);
    const simsFilter = urlParams.get('sims');
    if (simsFilter) {
      const allowed = simsFilter.split(',').map(s => s.trim());
      this._simulations = this._simulations.filter(s => allowed.includes(s.id));
    }

    this._renderTabs();
    await this._mountAll();

    if (this._simulations.length > 0) {
      await this.activate(this._simulations[0].id);
    }
  }

  async _mountAll() {
    this._container.innerHTML = '';

    const emptyEl = document.createElement('div');
    emptyEl.className = 'sim-empty';
    emptyEl.id = 'sim-empty';
    emptyEl.innerHTML = '<p>Select a simulation tab to begin.</p>';
    this._container.appendChild(emptyEl);

    const promises = this._simulations.map(sim => this._mountSim(sim));
    await Promise.all(promises);
  }

  async _mountSim(sim) {
    const basePath = `/simulations/${sim.id}`;

    const slot = document.createElement('div');
    slot.className = 'sim-slot';
    slot.dataset.simId = sim.id;
    slot.style.display = 'none';
    this._container.appendChild(slot);
    this._mountedSlots.set(sim.id, slot);

    try {
      const htmlRes = await fetch(`${basePath}/content.html`);
      if (!htmlRes.ok) throw new Error(`Failed to load content.html: ${htmlRes.status}`);
      slot.innerHTML = await htmlRes.text();

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = `${basePath}/simulation.css`;
      cssLink.dataset.simId = sim.id;
      document.head.appendChild(cssLink);

      const module = await import(/* @vite-ignore */ `${basePath}/simulation.js`);
      this._mountedModules.set(sim.id, module);

      const context = {
        config: { ...sim, basePath },
        emit: (eventType, payload = {}) => {
          this._pushLog({ simId: sim.id, dir: 'event', type: eventType, payload });
          this._eventBus.emit(eventType, { ...payload, simId: sim.id });
        }
      };

      if (typeof module.onAction === 'function') {
        const originalOnAction = module.onAction;
        this._actionWrappers.set(sim.id, (action) => {
          this._pushLog({ simId: sim.id, dir: 'action', type: action.type, payload: action.payload });
          originalOnAction(action);
        });
      }

      if (typeof module.init === 'function') {
        module.init(context);
      }
    } catch (err) {
      console.error(`Failed to mount simulation "${sim.id}":`, err);
      slot.innerHTML = `<div class="sim-empty"><p>Failed to load: ${err.message}</p></div>`;
    }
  }

  _renderTabs() {
    this._tabBar.innerHTML = '';

    for (const sim of this._simulations) {
      const btn = document.createElement('button');
      btn.className = 'sim-tab';
      btn.dataset.simId = sim.id;

      const label = document.createElement('span');
      label.className = 'sim-tab-label';
      label.textContent = sim.name;
      btn.appendChild(label);

      const badge = document.createElement('span');
      badge.className = 'sim-tab-badge';
      badge.dataset.simId = sim.id;
      badge.style.display = 'none';
      btn.appendChild(badge);

      btn.addEventListener('click', () => this.activate(sim.id));
      this._tabBar.appendChild(btn);
    }
  }

  _updateActiveTab() {
    const tabs = this._tabBar.querySelectorAll('.sim-tab');
    for (const tab of tabs) {
      tab.classList.toggle('active', tab.dataset.simId === this._activeId);
    }
  }

  async activate(simId) {
    if (this._activeId === simId) return;

    if (this._activeId) {
      const prevSlot = this._mountedSlots.get(this._activeId);
      if (prevSlot) prevSlot.style.display = 'none';
      this._onDeactivate(this._activeId);
    }

    this._activeId = simId;
    this._updateActiveTab();

    const emptyEl = document.getElementById('sim-empty');
    if (emptyEl) emptyEl.style.display = 'none';

    const slot = this._mountedSlots.get(simId);
    if (slot) {
      slot.style.display = '';
    }

    this._onActivate(simId);
  }

  dispatchAction(simId, action) {
    const wrapper = this._actionWrappers.get(simId);
    if (wrapper) {
      wrapper(action);
      return;
    }
    const module = this._mountedModules.get(simId);
    if (module && typeof module.onAction === 'function') {
      module.onAction(action);
    }
  }

  sendMessage(msg) {
    for (const [, module] of this._mountedModules) {
      if (typeof module.onMessage === 'function') {
        module.onMessage(msg);
      }
    }
  }

  _pushLog(entry) {
    this._logBuffer.push({ ...entry, ts: new Date().toISOString() });
    if (!this._logFlushTimer) {
      this._logFlushTimer = setTimeout(() => this._flushLogs(), 1000);
    }
  }

  _flushLogs() {
    const entries = this._logBuffer.splice(0);
    this._logFlushTimer = null;
    if (entries.length === 0) return;
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    }).catch(err => console.error('Failed to flush logs:', err));
  }
}
