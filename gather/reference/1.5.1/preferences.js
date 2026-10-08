import {storage} from './batches.js';

// Save only changed fields, under a shared lock, so a full-tool tab and the
// quick panel cannot reset each other's copy choices or lookup settings.
export async function patchPreferences(patch) {
  // Let the worker finish the write even when the toolbar panel closes.
  if(globalThis.chrome?.runtime?.id && typeof window!=='undefined'){
    const result=await chrome.runtime.sendMessage({type:'savePreferences',patch});
    if(!result?.ok)throw new Error(result?.error||'Preferences could not be saved.');
    return;
  }
  const update = async () => {
    const previous = (await storage.get('gather.prefs'))['gather.prefs'] || {};
    await storage.set({'gather.prefs': {...previous, ...patch}});
  };
  if (navigator.locks) await navigator.locks.request('gather-preferences', update);
  else await update();
}
export function onPreferencesChanged(callback) {
  if (globalThis.chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes['gather.prefs']) callback(changes['gather.prefs'].newValue || {});
    });
  } else {
    addEventListener('storage', event => {
      if (event.key === 'gather.prefs') { try { callback(JSON.parse(event.newValue) || {}); } catch {} }
    });
  }
}
