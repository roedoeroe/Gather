import {extractId, normalizeProfile, pageAccessIssue} from './core.js';
import {readProfileInPage} from './profile-read-client.js';

export const isExtension = Boolean(globalThis.chrome?.runtime?.id && globalThis.chrome?.scripting);
const ownedTabs = new Set();
const abortError = () => new DOMException('Lookup stopped', 'AbortError');
function check(signal) { if (signal?.aborted) throw abortError(); }
function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    check(signal);
    const onAbort = () => { clearTimeout(timer); reject(abortError()); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, {once: true});
  });
}
export async function closeOwnedTabs() {
  await Promise.all([...ownedTabs].map(async id => { try { await chrome.tabs.remove(id); } catch {} ownedTabs.delete(id); }));
}

async function fetchSource(profile, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, {once: true});
  const timer = setTimeout(abort, 12000);
  try {
    check(signal);
    // Only normalized, allowlisted profile URLs ever reach this function.
    const response = await fetch(profile.url, {credentials: 'omit', signal: controller.signal, redirect: 'follow', cache: 'no-store'});
    if (!response.ok) return {error: `The site returned HTTP ${response.status}. Open the profile to check its response, then retry.`};
    if (!response.body) return {error: 'The site returned no page source'};
    const reader = response.body.getReader(), decoder = new TextDecoder(); let html = '';
    try {
      for (;;) {
        const {done, value} = await reader.read();
        if (done) break;
        html += decoder.decode(value, {stream: true});
        if (html.length > 15000000) { await reader.cancel(); return {error: 'Page source is too large'}; }
      }
      html += decoder.decode();
    } finally { reader.releaseLock(); }
    return extractId(html, profile, response.url);
  } catch (error) {
    check(signal);
    return {error: error.name === 'AbortError' ? 'The site took too long to respond' : 'The site could not be reached'};
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}

async function readBrowserPage(profile, signal, onStage, tabOwner, includeName) {
  check(signal);
  const tab = await chrome.tabs.create({url: profile.url, active: false});
  ownedTabs.add(tab.id);
  try {
    if (tabOwner) await tabOwner.track(tab.id);
    else await chrome.runtime.sendMessage({type: 'trackTab', tabId: tab.id});
    check(signal);
    onStage?.('Reading browser page…');
    const deadline = Date.now() + 22000;
    let last = {error: 'Page did not finish loading. Open it, sign in if needed, and retry.'};
    while (Date.now() < deadline) {
      await pause(1000, signal);
      const state = await chrome.tabs.get(tab.id);
      if (state.status !== 'complete') continue;
      let actual;
      try { actual = normalizeProfile(state.url); } catch { return {error: pageAccessIssue('',state.url)||'The browser page did not return a supported profile URL. Open the intended profile and retry.'}; }
      if (actual.platform !== profile.platform) return {error: 'The profile redirected outside its platform'};
      const snapshot = await readProfileInPage(tab.id, profile, {includeName});
      check(signal);
      last = snapshot.result;
      if (last.id || last.accountState==='GONE' || /security check|sign in|Multiple account IDs|different profile/.test(last.error || '')) return last;
      // Allow hydrated profile data to arrive, but never solve login or CAPTCHA screens.
      if (Date.now() > deadline - 17000) return last;
    }
    return last;
  } finally {
    try { await chrome.tabs.remove(tab.id); } catch {}
    try {
      if (tabOwner) await tabOwner.untrack(tab.id);
      else await chrome.runtime.sendMessage({type: 'untrackTab', tabId: tab.id});
    } catch {}
    ownedTabs.delete(tab.id);
  }
}

export async function resolveProfile(profile, {signal, browserFallback = true, onStage, includeName = false, tabOwner, currentTabId} = {}) {
  check(signal);
  if (profile.directId && !includeName) return {id: profile.directId, method: 'ID in link'};
  const fallbackId = result => profile.directId && !result.id && result.accountState!=='GONE' ? {id: profile.directId, method: 'ID in link', displayName: '', nameWarning: result.error} : result;
  if (!isExtension) return fallbackId({error: 'Install the extension to use live lookup. Page-source import works here.'});
  if (Number.isInteger(currentTabId)) {
    onStage?.('Reading current page…');
    try {
      const tab=await chrome.tabs.get(currentTabId);
      let actual;
      try {actual=normalizeProfile(tab.url);} catch {return {error:'The current page changed. Open the profile and run it again.'};}
      if(actual.key!==profile.key)return {error:'The current page changed. Open the profile and run it again.'};
      const snapshot=await readProfileInPage(currentTabId,profile,{includeName});
      check(signal);
      if(snapshot){
        const result=snapshot.result;
        if(result.id||result.accountState==='GONE')return {...result,method:'Current page · '+result.method};
        // Authentication, conflicting IDs and a different profile are explicit
        // failures. Only missing hydrated data triggers an automatic source read.
        if(!result.error?.startsWith('No matching account ID'))return result;
        onStage?.('Reading profile source automatically…');
        const source=await readProfileInPage(currentTabId,profile,{source:true,includeName,documentId:snapshot.documentId});
        check(signal);
        const latest=await chrome.tabs.get(currentTabId);
        if(normalizeProfile(latest.url).key!==profile.key)return {error:'The page changed during lookup. Open the intended profile and retry.'};
        const found=source.result;
        return found.id||found.accountState==='GONE'?{...found,method:'Current profile source · '+found.method}:found;
      }
      return {error:'The current page returned no readable source. Reload the profile, then retry.'};
    }catch{check(signal);return {error:'Gather could not read this tab. Reopen Gather using its toolbar button on the profile, then retry.'};}
    // This explicit operation reads source in the same authorized tab/document.
    // The existing user tab is never tracked as temporary or closed by Gather.
  }
  onStage?.('Fetching profile…');
  const direct = await fetchSource(profile, signal);
  check(signal);
  if (direct.id || direct.accountState==='GONE' || !browserFallback) return fallbackId(direct);
  try { return fallbackId(await readBrowserPage(profile, signal, onStage, tabOwner, includeName)); }
  catch (error) { check(signal); return fallbackId({error: 'Could not read the browser page. Open the profile, then choose Find IDs on this page.'}); }
}
