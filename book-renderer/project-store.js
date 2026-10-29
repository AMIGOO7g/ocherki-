/* Ocherki project store: keeps the manuscript (sections, pages, photos) so a
 * reload or a closed tab never loses work. Today it writes to the browser's
 * IndexedDB; when an account server is configured (OcherkiStore.useRemote)
 * the same calls also sync to it, and the local copy stays as the offline
 * cache. Everything is asynchronous and never throws into the editor. */
(function (root) {
  'use strict';

  const DB = 'ocherki', STORE = 'projects', PHOTOS = 'photos', VERSION = 2;
  let dbPromise = null, remote = null, lastSync = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!root.indexedDB) { reject(new Error('IndexedDB недоступен')); return; }
      const request = root.indexedDB.open(DB, VERSION);
      request.onupgradeneeded = () => { for (const name of [STORE, PHOTOS]) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  function tx(mode, run, name = STORE) {
    return open().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(name, mode), result = run(t.objectStore(name));
      t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  // Photos are large, so the manuscript keeps only a reference
  // («ocherki-photo:<key>») and each image is written once to its own store.
  const PHOTO_REF = 'ocherki-photo:', written = new Set();
  const photoKey = src => `${src.length}:${src.slice(22, 86)}:${src.slice(src.length >> 1, (src.length >> 1) + 64)}:${src.slice(-64)}`;
  function detachPhotos(value, found) {
    if (Array.isArray(value)) return value.map(item => detachPhotos(item, found));
    if (value && typeof value === 'object') {
      const out = {};
      for (const [key, item] of Object.entries(value)) {
        if (typeof item === 'string' && item.startsWith('data:image/') && item.length > 2048) { const ref = photoKey(item); found.set(ref, item); out[key] = PHOTO_REF + ref; }
        else out[key] = detachPhotos(item, found);
      }
      return out;
    }
    return value;
  }
  // The account server (server/server.js), found by asking /api/me once.
  // Opened from disk or from a plain static server there is none, and the
  // store works locally only.
  const api = (url, options = {}) => fetch(url, { credentials: 'same-origin', ...options, headers: { 'X-Ocherki': '1', ...(options.headers || {}) } });
  const serverReady = (typeof fetch === 'function' && /^https?:$/u.test(String(root.location?.protocol || '')))
    ? api('/api/me').then(response => response.ok, () => false) : Promise.resolve(false);
  const refsOf = value => { const refs = new Set(); (function walk(item) { if (typeof item === 'string') { if (item.startsWith(PHOTO_REF)) refs.add(item.slice(PHOTO_REF.length)); } else if (item && typeof item === 'object') Object.values(item).forEach(walk); })(value); return [...refs]; };
  const serverAdapter = {
    async save(id, record) {
      const refs = refsOf(record);
      const { missing } = await (await api('/api/photos/missing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refs }) })).json();
      for (const ref of missing || []) {
        const src = await tx('readonly', store => store.get(ref), PHOTOS);
        if (src) { const put = await api(`/api/photos?ref=${encodeURIComponent(ref)}`, { method: 'PUT', body: src }); if (!put.ok) throw new Error('photo upload failed'); }
      }
      const response = await api(`/api/projects/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
      if (!response.ok) throw new Error('project upload failed');
    },
    async load(id) {
      const response = await api(`/api/projects/${encodeURIComponent(id)}`);
      return response.ok ? response.json() : null;
    },
    async photo(ref) {
      const response = await api(`/api/photos?ref=${encodeURIComponent(ref)}`);
      return response.ok ? response.text() : null;
    },
    async remove() {}
  };
  const remoteReady = serverReady.then(ok => { if (ok && !remote) remote = serverAdapter; return ok; });

  async function attachPhotos(value) {
    const refs = new Set();
    (function walk(item) { if (typeof item === 'string') { if (item.startsWith(PHOTO_REF)) refs.add(item.slice(PHOTO_REF.length)); } else if (item && typeof item === 'object') Object.values(item).forEach(walk); })(value);
    const images = new Map();
    await Promise.all([...refs].map(async ref => {
      try {
        let src = await tx('readonly', store => store.get(ref), PHOTOS);
        // A photo saved on another computer comes from the account and is
        // kept locally from then on.
        if (!src && remote?.photo) { src = await remote.photo(ref); if (src) await tx('readwrite', store => store.put(src, ref), PHOTOS); }
        if (src) { images.set(ref, src); written.add(ref); }
      } catch (_) {}
    }));
    return (function put(item) {
      if (typeof item === 'string') return item.startsWith(PHOTO_REF) ? images.get(item.slice(PHOTO_REF.length)) || '' : item;
      if (Array.isArray(item)) return item.map(put);
      if (item && typeof item === 'object') { const out = {}; for (const [key, inner] of Object.entries(item)) out[key] = put(inner); return out; }
      return item;
    })(value);
  }

  // Saves {savedAt, ...data} under the project id. The newest of the local
  // and remote copies wins on load.
  async function save(id, data) {
    const found = new Map(), record = { ...detachPhotos(data, found), savedAt: Date.now() };
    const fresh = [...found].filter(([ref]) => !written.has(ref));
    if (fresh.length) await tx('readwrite', store => { for (const [ref, src] of fresh) store.put(src, ref); }, PHOTOS);
    fresh.forEach(([ref]) => written.add(ref));
    await tx('readwrite', store => store.put(record, id));
    await remoteReady;
    if (remote) { try { await remote.save(id, record); lastSync = { ok: true, at: record.savedAt }; } catch (_) { lastSync = { ok: false, at: record.savedAt }; /* offline: local copy is kept */ } }
    return record.savedAt;
  }

  async function load(id) {
    let local = null, cloud = null;
    await remoteReady;
    try { local = await tx('readonly', store => store.get(id)); } catch (_) { local = null; }
    if (remote) { try { cloud = await remote.load(id); } catch (_) { cloud = null; } }
    const newest = cloud && (!local || Number(cloud.savedAt) > Number(local.savedAt)) ? cloud : local;
    return newest ? attachPhotos(newest) : null;
  }

  async function remove(id) {
    await tx('readwrite', store => store.delete(id));
    if (remote) { try { await remote.remove(id); } catch (_) {} }
  }

  root.OcherkiStore = Object.freeze({
    save, load, remove,
    // adapter: {save(id, record), load(id), photo(ref), remove(id)}.
    useRemote(adapter) { remote = adapter || null; },
    // Resolves to true when the book is also kept in the user's account.
    signedIn() { return remoteReady; },
    lastSync() { return lastSync; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
