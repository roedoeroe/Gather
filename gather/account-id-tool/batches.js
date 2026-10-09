import {accountState} from './account-state.js';
import {cleanLookupContext} from './lookup-context.js';
import {normalizeProfile, cleanName, suppliedIds} from './core.js';
import {cleanProfileStatus} from './profile-status.js';

const PREFIX = 'gather.batch.';
export const MAX_BATCHES = 5;
export const HISTORY_EPOCH_KEY = 'gather.lookupEpoch';
const extension = Boolean(globalThis.chrome?.storage?.local);
export const storage = {
  async get(key) {
    if (extension) return chrome.storage.local.get(key);
    if (key === null) return Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('gather.')).map(k => { try { return [k, JSON.parse(localStorage.getItem(k))]; } catch { return [k, null]; } }));
    try { return {[key]: JSON.parse(localStorage.getItem(key))}; } catch { return {}; }
  },
  async set(object) {
    if (extension) return chrome.storage.local.set(object);
    for (const [key, value] of Object.entries(object)) localStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key) {
    if (extension) return chrome.storage.local.remove(key);
    localStorage.removeItem(key);
  }
};

export function restoreBatch(value) {
  if (!value || typeof value.id !== 'string' || !/^[\w-]{1,80}$/.test(value.id) || !Array.isArray(value.entries)) return null;
  const entries = [];
  for (const item of value.entries.slice(0,100)) {
    try {
      const originalUrl = item.originalUrl || item.url;
      const profile = normalizeProfile(originalUrl);
      const validId = typeof item.id === 'string' && (profile.platform === 'youtube' ? /^UC[\w-]{22}$/ : /^[1-9]\d{0,29}$/).test(item.id);
      const interrupted = item.status === 'loading';
      const status = item.status==='gone'&&accountState(item)!=='GONE'?'error':interrupted ? 'stopped' : ['resolved','gone','ready','error','stopped'].includes(item.status) ? item.status : 'ready';
      entries.push({...profile, originalUrl, number: entries.length + 1, displayName: cleanName(item.displayName), id: item.status==='gone'?'':validId ? item.id : profile.directId,
        suppliedName: cleanName(item.suppliedName), providedIds: suppliedIds(item),
        notes: Array.isArray(item.notes) ? item.notes.filter(n => typeof n === 'string').map(n => n.replace(/[\r\n]/g, ' ').slice(0,500)).slice(0,100) : [],
        reviewedId: typeof item.reviewedId === 'string' ? item.reviewedId : '',
        verificationSource: ['live','source','url'].includes(item.verificationSource) ? item.verificationSource : '',
        accountState:item.accountState, stateReason:String(item.stateReason||'').slice(0,2000),adapterVersion:String(item.adapterVersion||'').slice(0,50),priorPermanentId:typeof item.priorPermanentId==='string'?item.priorPermanentId:'',
        profileStatus: cleanProfileStatus(item.profileStatus), usePageStatus: item.usePageStatus !== false,
        status: status === 'resolved' && !validId && !profile.directId ? 'ready' : status,
        method: cleanName(item.method), message: interrupted ? 'Interrupted. Retry to finish this account.' : String(item.message || '').slice(0,500),
        nameChecked: Boolean(item.nameChecked), verifiedAt: Number(item.verifiedAt) || null, nameWarning: String(item.nameWarning || '').slice(0,500)});
    } catch {}
  }
  if (!entries.length) return null;
  return {...(typeof value.historyEpoch==='string'&&/^[\w-]{1,80}$/.test(value.historyEpoch)?{historyEpoch:value.historyEpoch}:{}),...(cleanLookupContext(value.lookupContext)?{lookupContext:cleanLookupContext(value.lookupContext)}:{}),id: value.id, title: cleanName(value.title).slice(0,80), createdAt: Number(value.createdAt) || Date.now(), updatedAt: Number(value.updatedAt) || Date.now(),
    entries, invalid: Array.isArray(value.invalid) ? value.invalid.slice(0,100).map(i=>({input:String(i.input || '').slice(0,2048),error:String(i.error || '').slice(0,300)})) : [], duplicates: Number(value.duplicates) || 0};
}
function listedBatches(data){
  return Object.entries(data).filter(([key])=>key.startsWith(PREFIX)).map(([,value])=>restoreBatch(value)).filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt||b.updatedAt-a.updatedAt||a.id.localeCompare(b.id));
}
function evictionWrites(data,batches){
  const removed=new Set(batches.slice(MAX_BATCHES).map(b=>PREFIX+b.id)),writes={};
  if(!removed.size)return writes;
  for(const key of removed)writes[key]=null; // Opaque tombstone stops stale tabs recreating an evicted batch.
  for(const [key,value]of Object.entries(data))if(key.startsWith('gather.archive.'))writes[key]=scrubLookupArchive(value,k=>removed.has(k));
  if(removed.has(PREFIX+data['gather.quick']?.batchId))writes['gather.quick']={input:'',submittedInput:'',batchId:null};
  return writes;
}
export function recentRetentionWrites(data){return evictionWrites(data,listedBatches(data));}
export function recentBatches(){
  return withHistoryLock(async()=>{const data=await storage.get(null),batches=listedBatches(data);if(batches.length>MAX_BATCHES)await storage.set(evictionWrites(data,batches));return batches.slice(0,MAX_BATCHES);});
}
export async function loadBatch(id) {
  return restoreBatch((await storage.get(PREFIX + id))[PREFIX + id]);
}
function batchSnapshot(batch) {
  const safe = restoreBatch(batch);
  if (!safe) throw new Error('This batch has no valid accounts to save.');
  for (const entry of safe.entries) {
    if (batch.entries.find(e=>e.key===entry.key)?.status === 'loading') entry.status = 'loading';
  }
  return safe;
}
// Serialize lookup writes with clear/delete/restore across pages and the worker.
let historyQueue=Promise.resolve();
export function withHistoryLock(work) {
  if(globalThis.navigator?.locks?.request)return navigator.locks.request('gather-lookup-history',{mode:'exclusive'},work);
  const result=historyQueue.catch(()=>{}).then(work);historyQueue=result;return result;
}
export async function historyEpoch() {
  return (await storage.get(HISTORY_EPOCH_KEY))[HISTORY_EPOCH_KEY] || '';
}
function sameEpoch(expected, actual) {
  if ((expected || '') !== actual) throw new Error('Recent lookups were cleared. Start a new lookup.');
}
export async function historySummary() {
  const all=await storage.get(null);
  return {batches:Object.entries(all).filter(([key,value])=>key.startsWith(PREFIX)&&value!=null).length};
}
export function saveLookupDraft(key,value,epoch) {
  if(!['gather.draft','gather.quick'].includes(key))throw new Error('Invalid lookup draft.');
  if(extension&&globalThis.document&&!globalThis.navigator?.locks)return chrome.runtime.sendMessage({type:'history.draft',key,value,epoch}).then(checkReply);
  return withHistoryLock(async()=>{sameEpoch(epoch,await historyEpoch());if(key==='gather.quick'&&value?.batchId&&!await loadBatch(value.batchId))throw new Error('This lookup was deleted. Start a new lookup.');await storage.set({[key]:value});});
}
// A closing page delegates to the worker so a queued write survives page closure.
// The worker applies the same epoch/case guards, so deletion cannot be undone.
export function flushSavedBatch(batch) {
  if(extension&&globalThis.chrome?.runtime?.id&&chrome.runtime.sendMessage)
    return chrome.runtime.sendMessage({type:'history.flush',batch:batchSnapshot(batch)}).then(result=>{
      if(!result||result.error)throw new Error(result?.error||'Batch could not be saved.');
    });
  return saveBatch(batch);
}
function checkReply(result){if(!result||result.error)throw new Error(result?.error||'History could not be saved.');return result;}
export function saveBatch(batch) {
  if(extension&&globalThis.document&&!globalThis.navigator?.locks)return chrome.runtime.sendMessage({type:'history.flush',batch:batchSnapshot(batch)}).then(checkReply);
  return withHistoryLock(async()=>{
    sameEpoch(batch.historyEpoch,await historyEpoch());
    const projectId=batch.lookupContext?.projectId;
    if(projectId){
      const state=(await storage.get('gather.workspace.v1'))['gather.workspace.v1'];
      if(!state||!state.projects.some(p=>p.id===projectId))throw new Error('This case was deleted. Start a new lookup.');
    }
    const data=await storage.get(null),key=PREFIX+batch.id;
    if(Object.hasOwn(data,key)&&data[key]===null)throw new Error('This lookup has left Recent. Start a new lookup.');
    const snapshot=batchSnapshot(batch),next={...data,[key]:snapshot};
    const ordered=listedBatches(next);
    const writes=evictionWrites(next,ordered);
    if(Object.hasOwn(writes,key))throw new Error('This older lookup has left Recent. Start a new lookup.');
    await storage.set({[key]:snapshot,...writes});
  });
}
export function removeBatch(id) {return withHistoryLock(()=>storage.set({[PREFIX+id]:null}));}
// Imported settings archives can contain old lookup copies. Scrub those copies
// as well, without removing unrelated preferences or saved case records.
export function scrubLookupArchive(value,remove,depth=0) {
  if(!value||typeof value!=='object'||Array.isArray(value))return value;
  if(depth>64)throw new Error('An imported settings archive is too deeply nested to clear safely.');
  const next={};
  for(const [key,item] of Object.entries(value)) {
    if(remove(key,item))continue;
    if(key.startsWith('gather.archive.')){
      const cleaned=scrubLookupArchive(item,remove,depth+1);
      if(cleaned&&Object.keys(cleaned).length)next[key]=cleaned;
    }else next[key]=item;
  }
  return next;
}
export async function clearHistoryRecords() {
  // Caller holds the history lock and the workspace mutation queue.
  const all=await storage.get(null),writes={[HISTORY_EPOCH_KEY]:crypto.randomUUID()},remove=key=>
    key.startsWith(PREFIX)||['gather.draft','gather.quick','gather.lookupEpoch'].includes(key);
  let batches=0;
  for(const [key,value] of Object.entries(all)) {
    if(key===HISTORY_EPOCH_KEY)continue;
    if(remove(key)){writes[key]=null;if(key.startsWith(PREFIX)&&value!=null)batches++;}
    if(key.startsWith('gather.archive.')){
      const cleaned=scrubLookupArchive(value,remove);
      writes[key]=cleaned&&Object.keys(cleaned).length?cleaned:null;
    }
  }
  // One write invalidates old writers and replaces their content with empty
  // tombstones. A failed write cannot report a successful clear.
  await storage.set(writes);
  return {batches};
}
