/**
 * Generic data persistence functions for Bespoke applications
 *
 * Provides reusable functions for loading and saving data to:
 * - Local files (via fetch)
 * - localStorage
 * - Server endpoints
 */

// Generic data persistence functions
async function loadFromFile(path = 'data.json') {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

function saveToLocalStorage(data, key = 'app:data') {
  try {
    validateData(data);
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

function loadFromLocalStorage(key = 'app:data') {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

async function saveToServer(data, filename = 'data.json', endpoint = '/api/save') {
  try {
    validateData(data);
    const res = await fetch(`${endpoint}?file=${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return await res.text();
  } catch (e) {
    console.error('Failed to save to server:', e);
    throw e;
  }
}

function validateData(data) {
  if (data === null || data === undefined) {
    throw new Error('Data cannot be null or undefined');
  }
  return true;
}

// Export functions
window.IO = {
  loadFromFile,
  saveToLocalStorage,
  loadFromLocalStorage,
  saveToServer,
  validateData
};
