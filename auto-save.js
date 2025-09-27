/**
 * AutoSave - Generic auto-save system for Bespoke applications
 *
 * Provides automatic data persistence with:
 * - Immediate localStorage saves
 * - Periodic server synchronization
 * - Configurable intervals and error handling
 * - Status reporting
 */

class AutoSave {
  constructor(options = {}) {
    this.options = {
      data: null,                    // The data object to track
      filename: 'solution.json',     // Server save filename
      localStorageKey: 'app:data',   // localStorage key
      saveInterval: 1000,            // Server save interval (ms)
      onStatusChange: null,          // Status callback function
      onDataChange: null,            // Data change callback
      onError: null,                 // Error callback
      retryAttempts: 3,              // Number of retry attempts
      retryDelay: 1000,              // Delay between retries (ms)
      ...options
    };

    this.dirty = false;
    this.lastSent = 0;
    this.intervalId = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      console.warn('AutoSave already initialized');
      return;
    }

    if (!this.options.data) {
      throw new Error('AutoSave: data object is required');
    }

    this.startAutoSave();
    this.isInitialized = true;
    this.updateStatus('Auto-save initialized');
  }

  startAutoSave() {
    this.intervalId = setInterval(async () => {
      await this.processAutoSave();
    }, this.options.saveInterval);
  }

  stopAutoSave() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async processAutoSave() {
    if (!this.options.data || !this.dirty) return;

    const now = Date.now();
    if (now - this.lastSent < this.options.saveInterval) return;

    try {
      await this.saveToServer();
      this.lastSent = now;
      this.dirty = false;
      this.updateStatus('Changes saved');
    } catch (e) {
      this.handleError('Save failed (will retry)', e);
    }
  }

  markDirty() {
    this.dirty = true;
    this.saveToLocalStorage();

    if (this.options.onDataChange) {
      this.options.onDataChange(this.options.data);
    }
  }

  saveToLocalStorage() {
    try {
      const success = IO.saveToLocalStorage(this.options.data, this.options.localStorageKey);
      if (!success) {
        this.handleError('Failed to save to localStorage');
      }
    } catch (e) {
      this.handleError('localStorage save error', e);
    }
  }

  async saveToServer() {
    let lastError;

    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        await IO.saveToServer(this.options.data, this.options.filename);
        return;
      } catch (e) {
        lastError = e;
        if (attempt < this.options.retryAttempts) {
          await this.delay(this.options.retDelay);
        }
      }
    }

    throw lastError;
  }

  async saveNow() {
    try {
      this.saveToLocalStorage();
      await this.saveToServer();
      this.dirty = false;
      this.lastSent = Date.now();
      this.updateStatus('Manual save completed');
    } catch (e) {
      this.handleError('Manual save failed', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = IO.loadFromLocalStorage(this.options.localStorageKey);
      if (data) {
        this.options.data = data;
        this.updateStatus('Loaded from localStorage');
        return data;
      }
    } catch (e) {
      this.handleError('Failed to load from localStorage', e);
    }
    return null;
  }

  updateStatus(message) {
    if (this.options.onStatusChange) {
      this.options.onStatusChange(message);
    }
  }

  handleError(message, error = null) {
    console.error('AutoSave:', message, error);
    this.updateStatus(message);

    if (this.options.onError) {
      this.options.onError(message, error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    this.stopAutoSave();
    this.isInitialized = false;
  }

  // Static method for easy initialization
  static init(options) {
    const autoSave = new AutoSave(options);
    autoSave.init();
    return autoSave;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoSave;
} else {
  window.AutoSave = AutoSave;
}
