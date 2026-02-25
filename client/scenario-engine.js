export default class ScenarioEngine {
  constructor({ eventBus, loader, notifier }) {
    this._eventBus = eventBus;
    this._loader = loader;
    this._notifier = notifier;
    this._scenario = null;
    this._firedTriggerIds = new Set();
  }

  async loadScenario(scenarioUrl) {
    try {
      const module = await import(/* @vite-ignore */ scenarioUrl);
      this._scenario = module.default || module;
      this._firedTriggerIds.clear();
      this._eventBus.on('*', (event) => this._handleEvent(event));
      console.log(`Scenario loaded: ${this._scenario.name}`);
    } catch (err) {
      console.error('Failed to load scenario:', err);
    }
  }

  setScenario(scenario) {
    this._scenario = scenario;
    this._firedTriggerIds.clear();
    this._eventBus.on('*', (event) => this._handleEvent(event));
    console.log(`Scenario set: ${this._scenario.name}`);
  }

  async _handleEvent(event) {
    if (!this._scenario) return;

    const tier1Handled = this._evaluateTriggers(event);
    if (tier1Handled) return;

    if (this._scenario.llmEnabled) {
      await this._evaluateLLM(event);
    }
  }

  _evaluateTriggers(event) {
    const triggers = this._scenario.triggers || [];
    let handled = false;

    for (const trigger of triggers) {
      if (trigger.on !== event.type) continue;

      const triggerId = trigger.id || `${trigger.on}:${JSON.stringify(trigger.match || {})}`;
      if (trigger.once && this._firedTriggerIds.has(triggerId)) continue;

      if (trigger.match && !this._matchPayload(event, trigger.match)) continue;

      handled = true;

      if (trigger.llmGuard) {
        this._evaluateGuard(trigger, triggerId, event);
      } else {
        if (trigger.once) this._firedTriggerIds.add(triggerId);
        this._scheduleActions(trigger.actions, trigger.delay);
      }
    }

    return handled;
  }

  async _evaluateGuard(trigger, triggerId, event) {
    try {
      const res = await fetch('/api/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trigger.llmGuard,
          event,
          scenarioDescription: this._scenario.description || ''
        })
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.allow) {
        if (trigger.once) this._firedTriggerIds.add(triggerId);
        this._scheduleActions(trigger.actions, trigger.delay);
      }
    } catch (err) {
      console.error('LLM guard check failed:', err);
    }
  }

  _scheduleActions(actions, delay) {
    if (delay > 0) {
      setTimeout(() => this._dispatchActions(actions), delay);
    } else {
      this._dispatchActions(actions);
    }
  }

  _matchPayload(event, match) {
    for (const [key, value] of Object.entries(match)) {
      if (typeof value === 'string' && value.startsWith('~')) {
        const pattern = value.slice(1).toLowerCase();
        if (!String(event[key] || '').toLowerCase().includes(pattern)) return false;
      } else {
        if (event[key] !== value) return false;
      }
    }
    return true;
  }

  _dispatchActions(actions) {
    if (!actions || !Array.isArray(actions)) return;

    for (const action of actions) {
      const { target, ...actionData } = action;
      this._loader.dispatchAction(target, actionData);

      if (target !== this._loader.activeId) {
        this._notifier.notify(target);
      }
    }
  }

  async _evaluateLLM(event) {
    try {
      const history = this._eventBus.history().slice(-20);
      const body = {
        event,
        history,
        scenario: {
          description: this._scenario.description || '',
          llmContext: this._scenario.llmContext || '',
          actionSchemas: this._scenario.actionSchemas || {}
        }
      };

      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.actions && Array.isArray(data.actions)) {
        const sourceSimId = event.simId;
        const actions = sourceSimId
          ? data.actions.filter(a => a.target !== sourceSimId)
          : data.actions;
        this._dispatchActions(actions);
      }
    } catch (err) {
      console.error('LLM orchestration failed:', err);
    }
  }
}
