/* ==========================================================================
   STORE.JS — data access layer
   Backed by localStorage for instant, synchronous reads (so app.js's
   rendering code never has to change or become async), AND synced in the
   background to a Supabase Postgres database so data survives browser
   resets and is shared across devices/people.

   How the sync works:
   - Every collection app.js asks for goes through getCollection/addItem/
     updateItem/removeItem exactly as before — nothing in app.js changes.
   - For the collections we've wired up so far (the global "projects" list,
     each project's "parties__<projectId>" list, and each project's
     "txn__<typeId>__<projectId>" list), writes are also pushed to a single
     generic Supabase table called "records" in the background (fire and
     forget — if the network/Supabase is down, the app keeps working off
     localStorage and just doesn't get the cloud copy of that one write).
   - Store.syncPull(name) pulls the latest rows for a synced collection down
     from Supabase into localStorage. app.js calls this right when a project
     is opened / a tab is switched, and re-renders if anything changed, so
     data added from another browser/device shows up.
   - Adding a new tab's collection to the cloud later is a one-line change:
     add its name pattern to _isSynced() below. No new Supabase table needed
     — everything lands in the same generic "records" table.
   ========================================================================== */

const DB_PREFIX = "siteerp_";

// ---------------------------------------------------------------------------
// Supabase connection (safe to keep these values in client-side code — this
// is the public "anon" key, meant to be shipped in frontend JS; it can only
// do what the database's row-level-security policies allow it to do).
// ---------------------------------------------------------------------------
const SUPABASE_URL = "https://nyrseggowmekzrtzheto.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_URAuB6FimVsPjXi_UAMNDg_b5vLRuDQ";

let _sb = null;
try {
  if (window.supabase && typeof window.supabase.createClient === "function") {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn("Supabase client script did not load — running on localStorage only.");
  }
} catch (e) {
  console.warn("Supabase client init failed — running on localStorage only.", e);
}

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
// Cloud sync helpers — which collections are cloud-backed, and how to talk
// to the generic "records" table for them.
// ---------------------------------------------------------------------------
function _isSynced(name) {
  return name === "projects" || name.startsWith("parties__") || name.startsWith("txn__");
}

function _projectIdFor(name) {
  if (name === "projects") return null;
  const parts = name.split("__");
  return parts[parts.length - 1];
}

async function _pullFromCloud(name) {
  if (!_sb || !_isSynced(name)) return false;
  try {
    const { data, error } = await _sb
      .from("records")
      .select("id,data")
      .eq("collection", name)
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("Supabase pull failed for", name, error.message);
      return false;
    }
    const rows = (data || []).map((r) => ({ id: r.id, ...r.data }));
    const before = JSON.stringify(_read(name) || []);
    const after = JSON.stringify(rows);
    _write(name, rows);
    return before !== after;
  } catch (e) {
    console.warn("Supabase pull threw for", name, e);
    return false;
  }
}

function _pushInsert(name, record) {
  if (!_sb || !_isSynced(name)) return;
  const { id, ...data } = record;
  _sb.from("records")
    .insert({ id, collection: name, project_id: _projectIdFor(name), data })
    .then(({ error }) => { if (error) console.warn("Supabase insert failed for", name, error.message); });
}

function _pushUpdate(name, id, record) {
  if (!_sb || !_isSynced(name)) return;
  const { id: _drop, ...data } = record;
  _sb.from("records")
    .update({ data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .then(({ error }) => { if (error) console.warn("Supabase update failed for", name, error.message); });
}

function _pushDelete(name, id) {
  if (!_sb || !_isSynced(name)) return;
  _sb.from("records")
    .delete()
    .eq("id", id)
    .then(({ error }) => { if (error) console.warn("Supabase delete failed for", name, error.message); });
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
    _pushInsert(name, record);
    return record;
  },

  updateItem(name, id, patch, seed = []) {
    const data = Store.getCollection(name, seed);
    const idx = data.findIndex((r) => r.id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...patch, updatedAt: new Date().toISOString() };
      _write(name, data);
      _pushUpdate(name, id, data[idx]);
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
    _pushDelete(name, id);

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
    _pushInsert(log.collection, log.record);
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

  // Pull the latest rows for a cloud-backed collection down from Supabase
  // into localStorage. Resolves to true if the local copy changed (so the
  // caller knows whether it's worth re-rendering). Safe to call on a
  // collection that isn't cloud-backed — it just resolves to false.
  async syncPull(name) {
    return _pullFromCloud(name);
  },

  isSynced(name) {
    return _isSynced(name);
  },
};
