// Session ownership survives service-worker restarts. Quick lookups belong to
// the worker, while full-tool lookups belong to their visible Gather tab.
let pending = Promise.resolve();
function serial(action) { pending = pending.catch(() => {}).then(action); return pending; }
export function trackTemporary(tabId, owner) {
  return serial(async () => {
    const {temporaryTabs = {}} = await chrome.storage.session.get('temporaryTabs');
    temporaryTabs[tabId] = owner;
    await chrome.storage.session.set({temporaryTabs});
  });
}
export function untrackTemporary(tabId, owner) {
  return serial(async () => {
    const {temporaryTabs = {}} = await chrome.storage.session.get('temporaryTabs');
    if (temporaryTabs[tabId] === owner) delete temporaryTabs[tabId];
    await chrome.storage.session.set({temporaryTabs});
  });
}
export function closeTemporary(owner) {
  return serial(async () => {
    const {temporaryTabs = {}} = await chrome.storage.session.get('temporaryTabs');
    const ids = Object.entries(temporaryTabs).filter(([,value]) => value === owner).map(([id]) => Number(id));
    for (const id of ids) delete temporaryTabs[id];
    await chrome.storage.session.set({temporaryTabs});
    await Promise.all(ids.map(id => chrome.tabs.remove(id).catch(() => {})));
  });
}
export function tabRemoved(id) {
  return serial(async () => {
    const {temporaryTabs = {}} = await chrome.storage.session.get('temporaryTabs');
    const close = Object.entries(temporaryTabs).filter(([,owner]) => owner === id).map(([tabId]) => Number(tabId));
    delete temporaryTabs[id];
    for (const tabId of close) delete temporaryTabs[tabId];
    await chrome.storage.session.set({temporaryTabs});
    await Promise.all(close.map(tabId => chrome.tabs.remove(tabId).catch(() => {})));
  });
}
