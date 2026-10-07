import {cleanLookupContext,captureContext} from './lookup-context.js';
import {readWorkspace} from './workspace-store.js';
import {parseInput, normalizeProfile, applyLookup, idCheck} from './core.js';
import {resolveProfile} from './resolver.js';
import {storage, loadBatch, saveBatch, historyEpoch, saveLookupDraft} from './batches.js';
import {trackTemporary, untrackTemporary, closeTemporary} from './tab-ownership.js';

let active = null, commands = Promise.resolve();
const OWNER = 'quick';
const ready = recover();
async function recover() {
  await closeTemporary(OWNER);
  const {quickRun} = await chrome.storage.session.get('quickRun');
  if (quickRun?.status === 'running') {
    const batch = await loadBatch(quickRun.batchId);
    if (batch) await saveBatch(batch);
    await chrome.storage.session.set({quickRun: {...quickRun, status: 'interrupted'}});
  }
}
async function lockBatch(id) {
  if(!globalThis.navigator?.locks) return ()=>{};
  return new Promise((resolve, reject) => {
    navigator.locks.request('gather-batch-'+id, {ifAvailable:true}, async lock => {
      if (!lock) { reject(new Error('This batch is open in the full tool. Close that tab before retrying here.')); return; }
      await new Promise(release => resolve(release));
    }).catch(reject);
  });
}
async function state() {
  const quick = (await storage.get('gather.quick'))['gather.quick'] || {};
  const {quickRun} = await chrome.storage.session.get('quickRun');
  const previous = quickRun && quickRun.batchId === quick.batchId ? quickRun : {};
  const batch = active ? structuredClone(active.batch) : quick.batchId ? await loadBatch(quick.batchId) : null;
  // Also clear completed input left by an earlier extension version. Keep new
  // drafts, failed and interrupted work; results remain in the saved batch.
  const completed = !active && batch?.entries.every(e=>['resolved','gone'].includes(e.status)) && previous.status!=='interrupted';
  const input = completed && quick.input===quick.submittedInput ? '' : quick.input;
  return {historyEpoch:await historyEpoch(),input: typeof input === 'string' ? input.slice(0,100000) : '',
    submittedInput: typeof quick.submittedInput === 'string' ? quick.submittedInput : null,
    batch,
    busy: Boolean(active), stopping: Boolean(active?.controller.signal.aborted),
    interrupted: !active && previous.status === 'interrupted',
    warning: active?.warning || previous.warning || '',
    copyPending: !active && previous.status === 'done' && previous.autoCopy === true && previous.copied !== true};
}
function persist(job) {
  job.batch.updatedAt = Date.now();
  const snapshot = structuredClone(job.batch);
  job.saves = job.saves.catch(() => {}).then(() => saveBatch(snapshot)).catch(error => {job.warning = 'Results could not be saved: '+error.message;});
  return job.saves;
}
async function run(job, retry) {
  const signal = job.controller.signal;
  const queue = job.batch.entries.filter(e => !retry || !['resolved','gone'].includes(e.status));
  for (const entry of queue) Object.assign(entry, {status:'ready', message:'', verifiedAt:null, verificationSource:'', reviewedId:'', displayName:'', nameWarning:'', profileStatus:null});
  await persist(job);
  const tabOwner = {track: id => trackTemporary(id, OWNER), untrack: id => untrackTemporary(id, OWNER)};
  async function worker() {
    while (queue.length && !signal.aborted) {
      const entry = queue.shift(); entry.status = 'loading';
      await persist(job);
      try {
        const result = await resolveProfile(entry, {signal, browserFallback:job.browserFallback, includeName:true, tabOwner, currentTabId:job.currentTabId});
        if (signal.aborted) throw new DOMException('Stopped','AbortError');
        applyLookup(entry, result);
      } catch (error) {
        entry.status = signal.aborted ? 'stopped' : 'error';
        entry.message = signal.aborted ? 'Lookup stopped. Retry to finish.' : error.message;
      }
      await persist(job);
    }
  }
  try { await Promise.all([worker(), worker()]); }
  finally {
    for (const entry of queue) {entry.status='stopped';entry.message='Lookup stopped. Retry to finish.';}
    await closeTemporary(OWNER);
    await persist(job);
    if(!signal.aborted&&job.batch.entries.every(e=>['resolved','gone'].includes(e.status))){
      const quick=(await storage.get('gather.quick'))['gather.quick'];
      if(quick?.batchId===job.batch.id)await saveLookupDraft('gather.quick',{...quick,input:''},job.batch.historyEpoch);
    }
    job.release(); active = null;
    await chrome.storage.session.set({quickRun:{batchId:job.batch.id, status:signal.aborted?'stopped':'done', warning:job.warning, autoCopy:job.autoCopy}});
  }
}
async function start(message) {
  if (active) throw new Error('A lookup is already running.');
  const originalContext=message.type==='quick.start'?(cleanLookupContext(message.lookupContext)||captureContext(await readWorkspace())):null;
  let batch, input, currentTabId;
  if (message.type === 'quick.retry') {
    const quick = (await storage.get('gather.quick'))['gather.quick'];
    batch = quick?.batchId ? await loadBatch(quick.batchId) : null;
    if (!batch || batch.id !== message.batchId) throw new Error('That quick batch is no longer available.');
    input = quick.submittedInput ?? quick.input;
    if (!batch.entries.some(e => !['resolved','gone'].includes(e.status))) throw new Error('All accounts are already finished.');
  } else {
    input = String(message.input || '');
    if (input.length > 100000) throw new Error('Paste a list under 100 KB.');
    const parsed = parseInput(input);
    if (!parsed.entries.length) throw new Error('Paste a supported profile or channel link.');
    batch = {historyEpoch:message.historyEpoch,lookupContext:originalContext,id:crypto.randomUUID(), title:'', createdAt:Date.now(), updatedAt:Date.now(), entries:parsed.entries, invalid:parsed.invalid, duplicates:parsed.duplicates};
  }
  if(message.currentTabId!==undefined){
    if(!Number.isInteger(message.currentTabId)||batch.entries.length!==1)throw new Error('Open one supported profile to run this page.');
    try {
      const tab=await chrome.tabs.get(message.currentTabId);
      if(normalizeProfile(tab.url).key!==batch.entries[0].key)throw new Error('changed');
      currentTabId=message.currentTabId;
    }catch{throw new Error('The current page changed. Open the profile and run it again.');}
  }
  const release = await lockBatch(batch.id);
  let prefs;
  try {
    prefs = (await storage.get('gather.prefs'))['gather.prefs'] || {};
    await saveBatch(batch);
    await saveLookupDraft('gather.quick',{input, submittedInput:input, batchId:batch.id},batch.historyEpoch);
    await chrome.storage.session.set({quickRun:{batchId:batch.id, status:'running'}});
  } catch (error) { release(); throw error; }
  const job = {batch, controller:new AbortController(), release, saves:Promise.resolve(), warning:'', browserFallback:prefs.browserFallback !== false, autoCopy:prefs.autoCopy === true, currentTabId};
  active = job;
  job.done=run(job, message.type === 'quick.retry').catch(async error => {
    job.release(); if (active === job) active = null;
    await chrome.storage.session.set({quickRun:{batchId:batch.id,status:'interrupted',warning:'Lookup interrupted. '+error.message}}).catch(() => {});
  });
  return state();
}
async function accept(message) {
  if (active) throw new Error('Wait for lookup to finish.');
  const quick = (await storage.get('gather.quick'))['gather.quick'];
  if (quick?.batchId !== message.batchId) throw new Error('That quick batch has changed.');
  const release = await lockBatch(message.batchId);
  try {
    const batch = await loadBatch(message.batchId);
    const entry = batch?.entries.find(e => e.key === message.key);
    if (!entry || entry.id !== message.id || !['mismatch','conflict'].includes(idCheck(entry).state) || entry.status !== 'resolved' || !entry.verifiedAt || !['live','source'].includes(entry.verificationSource)) throw new Error('Reopen this result before accepting the correction.');
    entry.reviewedId = entry.id; batch.updatedAt=Date.now(); await saveBatch(batch);
  } finally { release(); }
  return state();
}
export function handleQuick(message) {
  const action = async () => {
    await ready;
    switch (message.type) {
      case 'quick.privacy': {
        if(active&&(!message.projectId||active.batch.lookupContext?.projectId===message.projectId)){const job=active;job.controller.abort();await job.done;}
        return message.operation();
      }
      case 'quick.state': return state();
      case 'quick.draft': {
        if (active) return {ok:true};
        const previous=(await storage.get('gather.quick'))['gather.quick'] || {};
        await saveLookupDraft('gather.quick',{...previous,input:String(message.input || '').slice(0,100000), batchId:previous.batchId || null},message.historyEpoch);
        return {ok:true};
      }
      case 'quick.start': case 'quick.retry': return start(message);
      case 'quick.stop': active?.controller.abort(); return state();
      case 'quick.accept': return accept(message);
      case 'quick.copied': {
        const {quickRun}=await chrome.storage.session.get('quickRun');
        if(quickRun?.batchId===message.batchId)await chrome.storage.session.set({quickRun:{...quickRun,copied:true}});
        return {ok:true};
      }
      default: throw new Error('Unknown quick-panel action.');
    }
  };
  const result = commands.catch(() => {}).then(action); commands = result;
  return result;
}
