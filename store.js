/* ==========================================================================
   STORE.JS — data access layer
   Right now everything is backed by localStorage (free, zero-server, works
   for one person testing on one machine/browser).

   IMPORTANT — swap-out point for later:
   When you have a real client and move to a real backend, you only need to
   rewrite the 5 functions below (getCollection / saveCollection / addItem /
   updateItem / removeItem) to call your API / n8n webhook / Google Sheet
   instead of localStorage. Nothing in app.js needs to change, because it
   only ever talks to these 5 functions.
   ========================================================================== */

const DB_PREFIX = "siteerp_";

function _read(name) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + name);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Storage read failed for", name, e);
    return null;
  }
}

function _write(name, data) {
  try {
    localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage write failed for", name, e);
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------------------------------------------------------------------------
// Public data-access API — everything in app.js goes through these
// ---------------------------------------------------------------------------
const Store = {
  getCollection(name, seed = []) {
    let data = _read(name);
    if (data === null) {
      data = seed;
      _write(name, data);
    }
    return data;
  },

  saveCollection(name, data) {
    _write(name, data);
  },

  addItem(name, item, seed = []) {
    const data = Store.getCollection(name, seed);
    const record = { id: uid(), createdAt: new Date().toISOString(), ...item };
    data.push(record);
    _write(name, data);
    return record;
  },

  updateItem(name, id, patch, seed = []) {
    const data = Store.getCollection(name, seed);
    const idx = data.findIndex((r) => r.id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...patch, updatedAt: new Date().toISOString() };
      _write(name, data);
      return data[idx];
    }
    return null;
  },

  // Soft delete: moves the record into "deletedLogs" instead of destroying it,
  // so the "Delete Logs" page in the sidebar has something real to show.
  removeItem(name, id, seed = []) {
    const data = Store.getCollection(name, seed);
    const idx = data.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const [removed] = data.splice(idx, 1);
    _write(name, data);

    const logs = Store.getCollection("deletedLogs", []);
    logs.unshift({
      id: uid(),
      collection: name,
      record: removed,
      deletedAt: new Date().toISOString(),
    });
    _write("deletedLogs", logs);
  },

  restoreItem(logId) {
    const logs = Store.getCollection("deletedLogs", []);
    const idx = logs.findIndex((l) => l.id === logId);
    if (idx === -1) return;
    const [log] = logs.splice(idx, 1);
    _write("deletedLogs", logs);

    const data = Store.getCollection(log.collection, []);
    data.push(log.record);
    _write(log.collection, data);
  },

  purgeLog(logId) {
    const logs = Store.getCollection("deletedLogs", []);
    _write("deletedLogs", logs.filter((l) => l.id !== logId));
  },

  // Full JSON export/import so data isn't trapped in one browser forever.
  exportAll() {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(DB_PREFIX)) {
        all[key.slice(DB_PREFIX.length)] = JSON.parse(localStorage.getItem(key));
      }
    }
    return all;
  },

  importAll(obj) {
    Object.entries(obj).forEach(([name, data]) => _write(name, data));
  },

  // Single-value settings (e.g. company name) — separate from the array-based
  // collections above, so these use a plain read/write of one value.
  getSetting(key, fallback) {
    const val = _read("setting_" + key);
    return val === null ? fallback : val;
  },

  setSetting(key, value) {
    _write("setting_" + key, value);
  },
};
