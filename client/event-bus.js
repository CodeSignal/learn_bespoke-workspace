export default class EventBus {
  constructor() {
    this._handlers = new Map();
    this._history = [];
  }

  on(eventType, handler) {
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, new Set());
    }
    this._handlers.get(eventType).add(handler);
  }

  off(eventType, handler) {
    const handlers = this._handlers.get(eventType);
    if (handlers) handlers.delete(handler);
  }

  emit(eventType, payload = {}) {
    const event = {
      type: eventType,
      ...payload,
      timestamp: Date.now()
    };

    this._history.push(event);

    const specific = this._handlers.get(eventType);
    if (specific) specific.forEach(h => h(event));

    const wildcard = this._handlers.get('*');
    if (wildcard) wildcard.forEach(h => h(event));
  }

  history() {
    return this._history.slice();
  }

  clear() {
    this._history = [];
  }
}
