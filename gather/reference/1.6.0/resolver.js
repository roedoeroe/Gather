import {extractId, normalizeProfile} from './core.js';

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
    const response = await fetch(profile.url, {credentials: 'include', signal: controller.signal, redirect: 'follow', cache: 'no-store'});
    if (!response.ok) return {error: `Site returned HTTP ${response.status}. Try signing in and retrying.`};
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

async function readBrowserPage(profile, signal, onStage, tabOwner) {
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
      try { actual = normalizeProfile(state.url); } catch { return {error: 'Open the profile, sign in or complete its security check, then retry'}; }
      if (actual.platform !== profile.platform) return {error: 'The profile redirected outside its platform'};
      const results = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => ({html: document.documentElement.outerHTML.slice(0, 15000001), url: location.href})
      });
      check(signal);
      const snapshot = results[0]?.result;
      if (snapshot) last = extractId(snapshot.html, profile, snapshot.url);
      if (last.id || /security check|Multiple account IDs|different profile/.test(last.error || '')) return last;
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
  const fallbackId = result => profile.directId && !result.id ? {id: profile.directId, method: 'ID in link', displayName: '', nameWarning: result.error} : result;
  if (!isExtension) return fallbackId({error: 'Install the extension to use live lookup. Page-source import works here.'});
  if (Number.isInteger(currentTabId)) {
    onStage?.('Reading current page…');
    try {
      const tab=await chrome.tabs.get(currentTabId);
      let actual;
      try {actual=normalizeProfile(tab.url);} catch {return {error:'The current page changed. Open the profile and run it again.'};}
      if(actual.key!==profile.key)return {error:'The current page changed. Open the profile and run it again.'};
      const results=await chrome.scripting.executeScript({target:{tabId:currentTabId},func:()=>({html:document.documentElement.outerHTML.slice(0,15000001),url:location.href})});
      check(signal);
      const snapshot=results[0]?.result;
      if(snapshot){
        const result=extractId(snapshot.html,profile,snapshot.url);
        if(result.id)return {...result,method:'Current page · '+result.method};
        if(/different profile|different platform|different channel/.test(result.error||''))return result;
      }
    }catch{check(signal);}
    // A closed or unreadable tab can still be resolved from its requested link.
    // This existing user tab is never tracked as temporary or closed by Gather.
  }
  onStage?.('Fetching profile…');
  const direct = await fetchSource(profile, signal);
  check(signal);
  if (direct.id || !browserFallback) return fallbackId(direct);
  try { return fallbackId(await readBrowserPage(profile, signal, onStage, tabOwner)); }
  catch (error) { check(signal); return fallbackId({error: 'Could not read the browser page. Open it and try the page-source fallback.'}); }
}
