/* Ocherki project store: keeps the manuscript (sections, pages, photos) so a
 * reload or a closed tab never loses work. Today it writes to the browser's
 * IndexedDB; when an account server is configured (OcherkiStore.useRemote)
 * the same calls also sync to it, and the local copy stays as the offline
 * cache. Everything is asynchronous and never throws into the editor. */
(function (root) {
  'use strict';

  const DB = 'ocherki', STORE = 'projects', PHOTOS = 'photos', VERSION = 2;
  let dbPromise = null, remote = null;

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
  async function attachPhotos(value) {
    const refs = new Set();
    (function walk(item) { if (typeof item === 'string') { if (item.startsWith(PHOTO_REF)) refs.add(item.slice(PHOTO_REF.length)); } else if (item && typeof item === 'object') Object.values(item).forEach(walk); })(value);
    const images = new Map();
    await Promise.all([...refs].map(async ref => { try { const src = await tx('readonly', store => store.get(ref), PHOTOS); if (src) { images.set(ref, src); written.add(ref); } } catch (_) {} }));
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
    if (remote) { try { await remote.save(id, record); } catch (_) { /* offline: local copy is kept */ } }
    return record.savedAt;
  }

  async function load(id) {
    let local = null, cloud = null;
    try { local = await tx('readonly', store => store.get(id)); if (local) local = await attachPhotos(local); } catch (_) { local = null; }
    if (remote) { try { cloud = await remote.load(id); } catch (_) { cloud = null; } }
    if (cloud && (!local || Number(cloud.savedAt) > Number(local.savedAt))) return cloud;
    return local || null;
  }

  async function remove(id) {
    await tx('readwrite', store => store.delete(id));
    if (remote) { try { await remote.remove(id); } catch (_) {} }
  }

  root.OcherkiStore = Object.freeze({
    save, load, remove,
    // adapter: {save(id, record), load(id), remove(id)} backed by the server.
    useRemote(adapter) { remote = adapter || null; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
