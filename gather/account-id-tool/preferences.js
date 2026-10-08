import {storage} from './batches.js';

// Save only changed fields, under a shared lock, so a full-tool tab and the
// quick panel cannot reset each other's copy choices or lookup settings.
export function validatePreferences(patch) {
  const allowed={copyMode:['details','ids'],separator:['newline','comma','space'],autoCopy:'boolean',browserFallback:'boolean',includeNames:'boolean'};
  if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new Error('Invalid preferences.');
  for(const [key,value] of Object.entries(patch)){
    const rule=Object.hasOwn(allowed,key)?allowed[key]:null;
    if(!rule||(Array.isArray(rule)?!rule.includes(value):typeof value!==rule))throw new Error('Invalid preference: '+key.slice(0,40));
  }
  return patch;
}
export async function patchPreferences(patch) {
  validatePreferences(patch);
  // Let the worker finish the write even when the toolbar panel closes.
  if(globalThis.chrome?.runtime?.id && typeof window!=='undefined'){
    const result=await chrome.runtime.sendMessage({type:'savePreferences',patch});
    if(!result?.ok)throw new Error(result?.error||'Preferences could not be saved.');
    return;
  }
  const update = async () => {
    const previous = (await storage.get('gather.prefs'))['gather.prefs'] || {};
    const next={};for(const [key,value] of Object.entries(previous)){try{validatePreferences({[key]:value});next[key]=value;}catch{}}
    await storage.set({'gather.prefs': {...next, ...patch}});
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
