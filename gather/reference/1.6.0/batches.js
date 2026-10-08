import {normalizeProfile, cleanName, suppliedIds} from './core.js';
import {cleanProfileStatus} from './profile-status.js';

const PREFIX = 'gather.batch.';
export const MAX_BATCHES = 50;
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
      const status = interrupted ? 'stopped' : ['resolved','ready','error','stopped'].includes(item.status) ? item.status : 'ready';
      entries.push({...profile, originalUrl, number: entries.length + 1, displayName: cleanName(item.displayName), id: validId ? item.id : profile.directId,
        suppliedName: cleanName(item.suppliedName), providedIds: suppliedIds(item),
        notes: Array.isArray(item.notes) ? item.notes.filter(n => typeof n === 'string').map(n => n.replace(/[\r\n]/g, ' ').slice(0,500)).slice(0,100) : [],
        reviewedId: typeof item.reviewedId === 'string' ? item.reviewedId : '',
        verificationSource: ['live','source','url'].includes(item.verificationSource) ? item.verificationSource : '',
        profileStatus: cleanProfileStatus(item.profileStatus), usePageStatus: item.usePageStatus !== false,
        status: status === 'resolved' && !validId && !profile.directId ? 'ready' : status,
        method: cleanName(item.method), message: interrupted ? 'Interrupted. Retry to finish this account.' : String(item.message || '').slice(0,500),
        nameChecked: Boolean(item.nameChecked), verifiedAt: Number(item.verifiedAt) || null, nameWarning: String(item.nameWarning || '').slice(0,500)});
    } catch {}
  }
  if (!entries.length) return null;
  return {id: value.id, title: cleanName(value.title).slice(0,80), createdAt: Number(value.createdAt) || Date.now(), updatedAt: Number(value.updatedAt) || Date.now(),
    entries, invalid: Array.isArray(value.invalid) ? value.invalid.slice(0,100).map(i=>({input:String(i.input || '').slice(0,2048),error:String(i.error || '').slice(0,300)})) : [], duplicates: Number(value.duplicates) || 0};
}
export async function recentBatches() {
  const data = await storage.get(null);
  return Object.entries(data).filter(([key]) => key.startsWith(PREFIX)).map(([,value])=>restoreBatch(value)).filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt);
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
// Call only for an existing, owned batch when this page is closing. Sending the
// latest snapshot immediately avoids losing a just-edited title to a debounce.
export function flushSavedBatch(batch) {
  return storage.set({[PREFIX + batch.id]: batchSnapshot(batch)});
}
export async function saveBatch(batch) {
  const existing = await storage.get(PREFIX + batch.id);
  if (!existing[PREFIX + batch.id] && (await recentBatches()).length >= MAX_BATCHES) throw new Error('Recent batches is full (50). Remove one to save this batch.');
  // Store only list data. Page HTML and session credentials are never persisted.
  await storage.set({[PREFIX + batch.id]: batchSnapshot(batch)});
}
export async function removeBatch(id) { await storage.remove(PREFIX + id); }
