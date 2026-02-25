export default class TabNotifier {
  constructor(loader) {
    this._loader = loader;
    this._counts = new Map();
  }

  notify(simId) {
    if (simId === this._loader.activeId) return;

    const count = (this._counts.get(simId) || 0) + 1;
    this._counts.set(simId, count);
    this._updateBadge(simId, count);
  }

  clearBadge(simId) {
    this._counts.set(simId, 0);
    this._updateBadge(simId, 0);
  }

  _updateBadge(simId, count) {
    const badge = document.querySelector(`.sim-tab-badge[data-sim-id="${simId}"]`);
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = '';
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }
  }
}
