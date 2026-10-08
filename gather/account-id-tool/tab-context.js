import {context as workspaceContext, destinationLabel} from './workspace-model.js';

// Session storage survives worker suspension, but not a new browser session. It
// contains only explicit research assignments and browser-provided tab IDs.
export const TAB_CONTEXT_KEY = 'gather.tabContexts.v1';
let pending = Promise.resolve();
function serial(operation) { pending = pending.catch(() => {}).then(operation); return pending; }
const validTab = id => Number.isInteger(id) && id >= 0;
function requireTab(id) { if (!validTab(id)) throw new Error('Choose an open browser tab.'); }
async function records() { return (await chrome.storage.session.get(TAB_CONTEXT_KEY))[TAB_CONTEXT_KEY] || {}; }
async function write(value) { await chrome.storage.session.set({[TAB_CONTEXT_KEY]:value}); }

export function bindTabContext(tabId, value, source='assigned') {
  requireTab(tabId);
  if (!['search','related','assigned'].includes(source)) throw new Error('Invalid tab assignment.');
  return serial(async () => {
    const all = await records();
    all[tabId] = {scanId:value.scanId,projectId:value.projectId,originatingSearchId:value.originatingSearchId || null,source};
    await write(all);
  });
}
export function detachTabContext(tabId) {
  requireTab(tabId);
  return serial(async () => { const all=await records(); all[tabId]={source:'detached'}; await write(all); });
}
export function inheritTabContext(tab) {
  if (!validTab(tab?.id) || !validTab(tab.openerTabId)) return Promise.resolve();
  return serial(async () => {
    const all=await records(),parent=all[tab.openerTabId];
    // Do not infer a relationship from URL, timing, title or a changed opener.
    // A tab that was explicitly detached remains detached.
    if (all[tab.id] || !parent || parent.source==='detached') return;
    all[tab.id]={...parent,source:'related'}; await write(all);
  });
}
export function removeTabContext(tabId) {
  return serial(async () => { const all=await records(); if (!all[tabId]) return; delete all[tabId]; await write(all); });
}
export function replaceTabContext(addedTabId, removedTabId) {
  return serial(async () => {
    const all=await records(); if (!all[removedTabId]) return;
    all[addedTabId]=all[removedTabId]; delete all[removedTabId]; await write(all);
  });
}
export function pruneTabContexts() {
  return serial(async () => {
    const all=await records(),live=new Set((await chrome.tabs.query({})).map(tab=>String(tab.id)));
    let changed=false; for (const id of Object.keys(all)) if (!live.has(id)) {delete all[id];changed=true;}
    if (changed) await write(all);
  });
}
export function resetTabContexts() { return serial(()=>write({})); }
export function resolveTabContext(state, tabId, fallbackScanId=state.activeScanId) {
  requireTab(tabId);
  return serial(async () => {
    const assigned=(await records())[tabId],isAssigned=!!assigned&&assigned.source!=='detached';
    const scope=workspaceContext(state,isAssigned?assigned.scanId:fallbackScanId);
    if (isAssigned && scope.projectId!==assigned.projectId) throw new Error('This tab’s research context is unavailable. Assign it to a current scan.');
    const searchId=isAssigned?assigned.originatingSearchId:null;
    const search=searchId?state.searches.find(s=>s.id===searchId):null;
    if (searchId && (!search || search.scanId!==scope.scanId || search.projectId!==scope.projectId)) throw new Error('This tab’s search context is unavailable. Reassign the tab.');
    return {tabId,context:{...scope,originatingSearchId:searchId||null,source:isAssigned?assigned.source:assigned?.source||'active'},assigned:isAssigned,label:destinationLabel(state,scope.scanId)};
  });
}
export function removeProjectTabContexts(projectId){return serial(async()=>{const all=await records();for(const [id,value]of Object.entries(all))if(value.projectId===projectId)all[id]={source:'detached'};await write(all);});}
