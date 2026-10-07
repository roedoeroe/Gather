// Chrome API doubles only. Loaded before the real background module in a REAL
// ServiceWorkerGlobalScope; IDB, Web Locks and module restrictions are native.
export function event() {
  const listeners = new Set();
  return {addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn),
    emit: (...args) => [...listeners].map(fn => fn(...args))};
}
const dbReady = new Promise((resolve, reject) => {
  const req = indexedDB.open('gather-test-chrome', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('areas');
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
const result = req => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
});
const changed = event();
function area(name) {
  return {
    async get(keys) {
      const db = await dbReady, all = await result(db.transaction('areas').objectStore('areas').get(name)) || {};
      if (keys == null) return all;
      if (typeof keys === 'string') return {[keys]: all[keys]};
      return Object.fromEntries((Array.isArray(keys) ? keys : Object.keys(keys)).map(key => [key, all[key] ?? keys[key]]));
    },
    async set(values) { await this.change(values); },
    async remove(keys) { await this.change({}, Array.isArray(keys) ? keys : [keys]); },
    async change(values, remove = []) {
      const db = await dbReady, tx = db.transaction('areas', 'readwrite'), store = tx.objectStore('areas');
      const done = new Promise((resolve, reject) => {tx.oncomplete = resolve; tx.onerror = tx.onabort = () => reject(tx.error);});
      const all = await result(store.get(name)) || {}, changes = {};
      for (const key of [...Object.keys(values), ...remove]) {
        changes[key] = {oldValue: all[key], newValue: values[key]};
        if (remove.includes(key)) delete all[key]; else all[key] = values[key];
      }
      store.put(all, name); await done; changed.emit(changes, name);
    },
    async setAccessLevel() {}
  };
}
const tabs = new Map([[10, {id:10, windowId:1, active:true, status:'complete', title:'Fictional profile', url:'https://www.instagram.com/alex.example/'}]]);
let nextTab = 20;
const tabEvents = {onRemoved:event(), onCreated:event(), onUpdated:event(), onActivated:event(), onReplaced:event()};
globalThis.chrome = {
  runtime: {id:'gather-worker-test', getURL: file => new URL(file, location.origin + '/').href,
    onMessage:event(), onInstalled:event(), onStartup:event()},
  storage: {local:area('local'), session:area('session'), onChanged:changed},
  tabs: {...tabEvents,
    async query(query = {}) {return [...tabs.values()].filter(tab => !query.active || tab.active);},
    async get(id) {if (!tabs.has(id)) throw new Error('No tab'); return {...tabs.get(id)};},
    async create(options) {const tab = {id:nextTab++, windowId:1, status:'complete', ...options}; tabs.set(tab.id,tab); tabEvents.onCreated.emit({...tab}); return {...tab};},
    async update(id, patch) {const tab = tabs.get(id); if (!tab) throw new Error('No tab'); Object.assign(tab,patch); tabEvents.onUpdated.emit(id,patch,{...tab}); return {...tab};},
    async remove(id) {tabs.delete(id); tabEvents.onRemoved.emit(id);}
  },
  scripting: {async executeScript() {return [{documentId:'fictional-document', result:{
    url:'https://www.instagram.com/alex.example/',
    html:'<script type="application/json">{"user":{"username":"alex.example","id":"9007199254740993123","full_name":"Alex Example"}}</script>'
  }}];}},
  windows: {onRemoved:event(), async get(){return {id:1};}, async create(){return {id:2};}, async update(){}},
  contextMenus: {onClicked:event(), async update(){}, removeAll:fn=>fn(), create:(_,fn)=>fn?.()},
  action:{async setBadgeText(){}}, sidePanel:{async open(){}}
};
// Never allow a regression to accidentally query a live platform during tests.
const realFetch = globalThis.fetch;
globalThis.fetch = (url, options) => {
  if (new URL(typeof url === 'string' ? url : url.url, location.href).origin !== location.origin)
    throw new Error('Live network disabled in fictional worker test');
  return realFetch(url, options);
};
