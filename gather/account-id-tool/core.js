import {confirmedGone,accountState,orderAccounts,ADAPTER_VERSION} from './account-state.js';
import {detectProfileStatus, cleanProfileStatus, notesInfo} from './profile-status.js';
export const PLATFORMS = ['instagram', 'facebook', 'threads', 'tiktok', 'youtube'];
export const LABELS = {instagram: 'Instagram', facebook: 'Facebook', threads: 'Threads', tiktok: 'TikTok', youtube: 'YouTube'};
const numeric = value => typeof value === 'string' && /^[1-9]\d{0,29}$/.test(value);
const channel = value => typeof value === 'string' && /^UC[\w-]{22}$/.test(value);
const clean = value => value.replace(/^[<(["']+|[>\])"'.!?]+$/g, '');
const lower = value => String(value || '').replace(/^@/, '').toLowerCase();

export function normalizeProfile(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Profile links must be under 2,048 characters');
  let input = clean(value.trim());
  if (!/^https?:\/\//i.test(input)) input = 'https://' + input;
  let url;
  try { url = new URL(input); } catch { throw new Error('Not a valid profile link'); }
  if (url.username || url.password || url.port || !['http:', 'https:'].includes(url.protocol)) throw new Error('Use a normal profile link');
  const host = url.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./, '');
  let parts;
  try { parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent); } catch { throw new Error('Invalid characters in link'); }
  const [first = '', second = '', third = ''] = parts;
  let platform, handle = '', directId = '', path;
  if (host === 'instagram.com') {
    platform = 'instagram';
    if (!/^[\w.]{1,30}$/.test(first) || /^(p|reel|reels|stories|explore|accounts|direct|about|developer|legal|challenge)$/i.test(first) || (parts.length > 1 && !(parts.length === 2 && /^(reels|tagged)$/i.test(second)))) throw new Error('Use an Instagram profile, not a post or reel');
    handle = first; path = '/' + handle + '/';
  } else if (host === 'facebook.com') {
    platform = 'facebook';
    if (parts.length === 1 && first.toLowerCase() === 'profile.php' && numeric(url.searchParams.get('id'))) directId = url.searchParams.get('id');
    else if (/^(people|pages)$/i.test(first) && parts.length === 3 && numeric(third)) directId = third;
    else if (parts.length === 1 && numeric(first)) directId = first;
    else if (parts.length === 1 && /^[\w.-]+$/.test(first) && !/^(groups|events|watch|reel|reels|share|sharer|sharer.php|login|login.php|checkpoint|help|marketplace|gaming|friends|settings|search|home.php|photo|photo.php|photos|video.php|watch.php|story.php|permalink.php|notifications|saved|memories|feeds|stories|pages|people|policies)$/i.test(first)) handle = first;
    else throw new Error('Use a Facebook profile or Page link');
    path = directId ? '/profile.php?id=' + directId : '/' + handle;
  } else if (host === 'threads.com' || host === 'threads.net') {
    platform = 'threads';
    if (parts.length !== 1 || !/^@[\w.]{1,30}$/.test(first)) throw new Error('Use a Threads @profile link, not a post');
    handle = first.slice(1); path = '/@' + handle;
  } else if (host === 'tiktok.com') {
    platform = 'tiktok';
    if (parts.length !== 1 || !/^@[\w.]{1,30}$/.test(first)) throw new Error('Use a TikTok @profile link, not a video or short link');
    handle = first.slice(1); path = '/@' + handle;
  } else if (host === 'youtube.com') {
    platform = 'youtube';
    const tab = /^(videos|shorts|streams|featured|playlists|community|about|podcasts)$/;
    if (first.startsWith('@') && first.length > 1 && (parts.length === 1 || parts.length === 2 && tab.test(second))) {
      handle = first.slice(1); path = '/@' + encodeURIComponent(handle);
    } else if (first === 'channel' && channel(second) && (parts.length === 2 || parts.length === 3 && tab.test(third))) {
      directId = second; path = '/channel/' + directId;
    } else if (/^(c|user)$/.test(first) && second && (parts.length === 2 || parts.length === 3 && tab.test(third))) {
      handle = second; path = '/' + first + '/' + encodeURIComponent(second);
    } else throw new Error('Use a YouTube channel link, not a video');
  } else throw new Error('Use an Instagram, Facebook, Threads, TikTok or YouTube profile URL');
  const canonical = 'https://www.' + platform + '.com' + path;
  return {platform, handle, directId, url: canonical, key: platform === 'youtube' && directId ? canonical : canonical.toLowerCase()};
}

export function parseInput(text) {
  const entries = [], invalid = [], seen = new Map(), names = [], covered = [];
  let duplicates = 0;
  let source = decodeHtml(String(text || '')).replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\\_/g, '_')
    .replace(/\[[^\]\r\n]*\]\(<?(https?:\/\/[^\s)>]+)>?\)/gi, '$1')
    .replace(/\*\*/g, '')
    .replace(/^[ \t]*(?:Display name:[ \t]*|\d+[.)][ \t]+)([^\r\n]+)$/gmi, (whole, name) => {
      if (/(?:https?:\/\/|(?:instagram|facebook|threads|tiktok|youtube)\.(?:com|net)\/)/i.test(name)) return whole;
      const value = cleanName(name.replace(/\s*\((?:name unavailable|supplied; not checked)\)\s*$/i, ''));
      names.push(/^(?:Unavailable|Name unavailable|@\S+)$/i.test(value) ? '' : value);
      return '\u0001NAME' + (names.length - 1) + '\u0001';
    })
    .replace(/^[ \t]*(?:Batch|Saved|Check|Status check|Original notes|Found ID|Page ID|URL ID|Previously found ID|Previously supplied IDs?):[^\r\n]*$/gmi, '')
    .replace(/^[ \t]*User ID:[ \t]*(?:Not looked up yet|Lookup in progress|Lookup stopped|Needs attention)[^\r\n]*$/gmi, '')
    .replace(/^[ \t]*[_-]{3,}[ \t]*$/gm, '')
    .replace(/^[ \t]*[-•][ \t]+/gm, '')
    .replace(/^[ \t]*\d+[.)][ \t]+(?=(?:https?:\/\/|(?:www\.)?[\w.-]+\.[a-z]{2,}\/))/gmi, '');
  // Locate links anywhere in a chat/export, rather than requiring every word to
  // be a URL. Every URL (including unsupported ones) is an association boundary.
  const links = [...source.matchAll(/(?:https?:\/\/|(?<![\w@.-])(?:[\w-]{1,63}\.){1,5}[a-z]{2,24}\/)[^\s<>"'“”‘’\[\]{}(),;]*/gi)];
  const cover = (start, end) => covered.push([start, end]);
  const addInvalid = (input, error) => invalid.push({input, error});
  for (let i = 0; i < links.length; i++) {
    const match = links[i], token = clean(match[0]).replace(/[:…]+$/, '');
    const before = source.slice(i ? links[i-1].index + links[i-1][0].length : 0, match.index);
    const afterStart = match.index + match[0].length;
    const after = source.slice(afterStart, i+1 < links.length ? links[i+1].index : source.length);
    cover(match.index, afterStart);
    let current = null;
    try {
      if (match.index && /[\w@./]/.test(source[match.index-1])) throw new Error('Profile link has an unclear start; put it on its own line');
      const profile = normalizeProfile(token);
      const marker = [...before.matchAll(/\u0001NAME(\d+)\u0001/g)].at(-1);
      const suppliedName = marker ? names[Number(marker[1])] || '' : '';
      if (seen.has(profile.key)) {
        current = seen.get(profile.key); duplicates++;
        if (!current.suppliedName && suppliedName) current.suppliedName = suppliedName;
      } else if (entries.length >= 100) addInvalid(token, 'Maximum 100 unique profiles per batch');
      else {
        current = {...profile, originalUrl: token, number: entries.length + 1, displayName: '', suppliedName,
          providedIds: [], notes: [], reviewedId: '', verificationSource: profile.directId ? 'url' : '',
          status: profile.directId ? 'resolved' : 'ready', id: profile.directId, method: profile.directId ? 'ID in link' : '', message: ''};
        entries.push(current); seen.set(profile.key, current);
      }
      if (current && /\bBanned\s+(?:account\s*)?:\s*$/i.test(before) && !current.notes.includes('(BANNED)')) current.notes.push('(BANNED)');
    } catch (error) { addInvalid(token, error.message); }
    // Only the immediate ID/note block after a URL belongs to it. Prose, message
    // headers and timestamps end that block; later numbers need human review.
    let offset = 0;
    while (offset < after.length) {
      const gap = after.slice(offset).match(/^[\s,;<>`"'“”‘’\[\]]+/);
      if (gap) { offset += gap[0].length; continue; }
      const rest = after.slice(offset);
      const label = rest.match(/^(?:(?:supplied\s+|user\s*|profile\s+|channel\s+)?ids?|uid)\s*[:=#]\s*/i);
      if (label) { cover(afterStart+offset, afterStart+offset+label[0].length); offset += label[0].length; continue; }
      const note = rest.match(/^\([^()\r\n]*\)/) || rest.match(/^(?:POSS|PRIV|EMPTY)(?:\/(?:POSS|PRIV|EMPTY))*(?=$|[\s,;])/i);
      if (note) {
        if (/^\(\s*(?:edited|deleted message)\s*\)$/i.test(note[0])) break;
        const value = note[0].startsWith('(') ? note[0] : '('+note[0]+')';
        const inner = value.slice(1,-1).trim();
        if (current && (numeric(inner) || channel(inner))) { if (!current.providedIds.includes(inner)) current.providedIds.push(inner); }
        else if (current && !current.notes.includes(value)) current.notes.push(value);
        else if (!current) addInvalid(value, 'Note has no preceding supported profile link');
        cover(afterStart+offset, afterStart+offset+note[0].length);offset+=note[0].length;continue;
      }
      const id = rest.match(/^([1-9]\d{0,29}|UC[\w-]{22})(?:[.!?](?=$|[\s,;]))?(?=$|[\s,;>"'“”‘’\]])/);
      if (id) {
        if (current && !current.providedIds.includes(id[1])) current.providedIds.push(id[1]);
        else if (!current) addInvalid(id[1], 'ID has no preceding supported profile link');
        cover(afterStart+offset, afterStart+offset+id[0].length);offset+=id[0].length;continue;
      }
      // Scientific notation and zero must not silently become a usable ID.
      const badId = rest.match(/^(?:0|\d+(?:\.\d+)?e[+-]?\d+)(?=$|[\s,;])/i);
      if (badId) { addInvalid(badId[0], 'Use the complete ID digits, not zero or scientific notation');cover(afterStart+offset,afterStart+offset+badId[0].length);offset+=badId[0].length;continue; }
      break;
    }
  }
  const chars = source.split('');
  for (const [start,end] of covered) chars.fill(' ',start,end);
  const remainder = chars.join('').replace(/\u0001NAME\d+\u0001/g,'');
  // Long numbers left inside prose might be IDs. Surface them for review instead
  // of assigning them across unrelated text or silently losing them.
  const orphans = [...remainder.matchAll(/\b(?:[1-9]\d{4,29}|UC[\w-]{22})\b/g)];
  for (const match of orphans) addInvalid(match[0], 'Possible ID could not be safely assigned. Put it directly below its link.');
  const beginning = source.slice(0,links[0]?.index ?? source.length).trim();
  if (/^[1-9]\d{0,29}(?:\s|$)/.test(beginning)) {
    const id = beginning.match(/^[1-9]\d{0,29}/)[0];
    if (!orphans.some(m=>m[0]===id)) addInvalid(id, 'ID has no preceding supported profile link');
    for (const note of beginning.match(/\((?:POSS|PRIV|EMPTY)(?:\/(?:POSS|PRIV|EMPTY))*\)/gi) || []) addInvalid(note, 'Note has no preceding supported profile link');
  }
  const ignoredCount = remainder.replace(/[\s_\-*<>`"'\[\],;]+/g,' ').trim().split(/\s+/).filter(Boolean).length;
  return {entries, invalid, duplicates, ignoredCount};
}

export function suppliedIds(entry) {
  return [...new Set((Array.isArray(entry.providedIds) ? entry.providedIds : []).filter(id => numeric(id) || channel(id)))];
}
export function idCheck(entry) {
  const ids = suppliedIds(entry);
  if (accountState(entry)==='GONE') return {state:'none',label:''};
  if (!ids.length) return {state: 'none', label: ''};
  const evidence = entry.status === 'resolved' && entry.verifiedAt && ['live', 'source'].includes(entry.verificationSource);
  if (evidence && entry.reviewedId === entry.id) return {state: 'corrected', label: 'Correction accepted'};
  if (ids.length > 1) return {state: 'conflict', label: 'Multiple supplied IDs — review required'};
  if (!evidence) {
    if (entry.directId && ids[0] !== entry.directId) return {state: 'mismatch', label: 'Supplied ID differs from the URL ID; page not verified'};
    return {state: 'unverified', label: 'Not verified'};
  }
  if (ids[0] !== entry.id) return {state: 'mismatch', label: 'ID mismatch — review required'};
  return {state: 'matched', label: entry.verificationSource === 'source' ? 'Matches pasted source' : 'Matches page'};
}
export function isCopyableId(entry) {
  if (entry.status !== 'resolved' || !entry.id) return false;
  return ['none', 'matched', 'corrected'].includes(idCheck(entry).state);
}
export function applyLookup(entry, result, source = 'live') {
  entry.accountState=result.accountState|| (result.id ? result.profileStatus?.privacy==='private'?'PRIVATE_INACCESSIBLE':'AVAILABLE' : 'UNKNOWN_TECHNICAL');
  entry.adapterVersion=result.adapterVersion||ADAPTER_VERSION;entry.stateReason=result.stateReason||result.error||'';
  if(result.accountState==='GONE'&&result.verifiedAt&&result.stateReason){
    if(entry.id)entry.priorPermanentId=entry.id;entry.id='';
    Object.assign(entry,result,{status:'gone',message:'',nameChecked:true,verificationSource:source,profileStatus:cleanProfileStatus(null)});return;
  }
  entry.profileStatus = result.id && result.verifiedAt ? cleanProfileStatus(result.profileStatus) : cleanProfileStatus(null);
  if (result.id) Object.assign(entry, result, {displayName: result.displayName || '', status: 'resolved', message: '', nameChecked: true,
    verifiedAt: result.verifiedAt || null, verificationSource: result.verifiedAt ? source : 'url'});
  else Object.assign(entry, {status: 'error', message: result.error || 'No matching account ID found', nameChecked: true, verificationSource: '', verifiedAt: null});
}

const decodeHtml = text => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_,code) => {
  const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1),16) : Number(code);
  return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '';
}).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function metaValues(html, name) {
  const found = [];
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) attrs[match[1].toLowerCase()] = decodeHtml(match[3]);
    if ([attrs.property, attrs.name, attrs.itemprop].includes(name) && attrs.content) found.push(attrs.content);
  }
  return found;
}

// Parse data, never execute page JavaScript. Preserve large numeric IDs as strings.
function parseJson(text) {
  const parts=[]; let start=0, quoted=false, escaped=false;
  const number=/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(quoted){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;continue;}
    if(char==='"'){quoted=true;continue;}
    if(char!=='-'&&(char<'0'||char>'9'))continue;
    number.lastIndex=i;const match=number.exec(text);if(!match)continue;
    const token=match[0],end=number.lastIndex,before=i===0?'':text[i-1],after=end===text.length?'':text[end];
    if(/^-?\d{16,}$/.test(token)&&(before===''||/[\x20\t\r\n:[,]/.test(before))&&(after===''||/[\x20\t\r\n,}\]]/.test(after))){parts.push(text.slice(start,i),JSON.stringify(token));start=end;}
    i=end-1;
  }
  parts.push(text.slice(start));return JSON.parse(parts.join(''));
}
function jsonObjects(html) {
  const roots = [];
  const source = html.trim();
  if (/^[{[]/.test(source)) { try { roots.push(parseJson(source)); } catch {} }
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    const body = match[1].trim();
    if (/^[{[]/.test(body)) { try { roots.push(parseJson(body)); } catch {} }
    // Known data assignments contain JSON, not executable extraction logic.
    // Read their balanced JSON value without evaluating the surrounding script.
    const marker = /(?:\b(?:var\s+)?ytInitialData\s*=|\bwindow\._sharedData\s*=|\bwindow\.__additionalDataLoaded\s*\(\s*["'][^"']+["']\s*,)\s*/g;
    let start;
    while ((start = marker.exec(body))) {
      const tail = body.slice(start.index + start[0].length);
      let depth = 0, quoted = false, escaped = false;
      for (let i = 0; i < tail.length; i++) {
        const c = tail[i];
        if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
        else if (c === '"') quoted = true;
        else if (c === '{' || c === '[') depth++;
        else if (c === '}' || c === ']') { depth--; if (depth === 0) { try { roots.push(parseJson(tail.slice(0, i + 1))); } catch {} break; } }
      }
    }
  }
  return roots;
}
function walk(roots, visit) {
  const stack = roots.map(value => ({value, key: ''})); let count = 0;
  while (stack.length && count++ < 150000) {
    const {value, key} = stack.pop();
    if (!value || typeof value !== 'object') continue;
    visit(value, key);
    for (const [k, v] of Object.entries(value)) if (v && typeof v === 'object') stack.push({value: v, key: k});
  }
}
const asId = value => typeof value === 'string' ? value : Number.isSafeInteger(value) ? String(value) : '';

// The anonymous profile route binds its handle/URL to the content view's user
// ID before hydration. Logging IDs only corroborate that content ID; arbitrary
// profile_id fields, preload variables and recommended accounts are insufficient.
function instagramRouteIds(info, profile) {
  const route = info?.route;
  if (!route || route.canonicalRouteName !== 'comet.igweb.PolarisLoggedOutDesktopWWWProfileRoute' ||
      route.tracePolicy !== 'polaris.profilePage' || route.polarisRouteConfig?.pageID !== 'profilePage' ||
      typeof route.params?.username !== 'string' || lower(route.params.username) !== lower(profile.handle) ||
      typeof route.url !== 'string') return [];
  try { if (normalizeProfile(new URL(route.url, profile.url).href).key !== profile.key) return []; }
  catch { return []; }
  const ids = [route.rootView, route.hostableView].map(view => {
    const id = asId(view?.props?.id), logging = view?.props?.page_logging;
    return view?.resource?.__dr === 'PolarisProfilePostsTabRoot.react' &&
      view?.entryPoint?.__dr === 'PolarisLoggedOutDesktopWWWProfilePostsTabRoot.entrypoint' &&
      numeric(id) && logging?.name === 'profilePage' && logging.params?.sub_path === 'posts' &&
      asId(logging.params.profile_id) === id && logging.params.page_id === 'profilePage_' + id ? id : '';
  });
  // Both views must be valid. Distinct IDs enter the ordinary ambiguity guard.
  return ids.every(Boolean) ? ids : [];
}

// Challenge libraries and login links occur on ordinary profile pages too.
// Only rendered text, explicit structured errors or a known redirect screen
// justify asking the analyst to sign in or complete a security check.
export function pageAccessIssue(html, pageUrl, roots = []) {
  let path='';try{path=new URL(pageUrl).pathname;}catch{}
  if(/^\/(?:accounts\/login|login|login\.php)(?:\/|$)/i.test(path))return 'The page opened a sign-in screen. Sign in on the site, then reopen the profile and retry.';
  if(/^\/(?:challenge|checkpoint)(?:\/|$)/i.test(path))return 'The page opened a security check. Complete it on the site, then reopen the profile and retry.';
  const text=html.replace(/<!--[^]*?-->/g,' ').replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  let login=/\blogin_required\b|\blog in to (?:instagram|facebook)\b|\bsign in to confirm\b/i.test(text),challenge=/\b(?:challenge_required|checkpoint_required)\b|\bverify (?:that )?you are human\b|\bcomplete (?:the )?(?:security check|captcha)\b/i.test(text);
  walk(roots,obj=>{for(const key of ['error','message','error_type']){if(obj[key]==='login_required')login=true;if(['challenge_required','checkpoint_required'].includes(obj[key]))challenge=true;}});
  return challenge?'The page reports a security check. Complete it on the site, then retry.':login?'The page asks you to sign in. Sign in on the site, then reopen the profile and retry.':null;
}

export function extractId(html, profile, pageUrl = profile.url) {
  if (typeof html !== 'string' || html.length > 15000000) return {error: 'Page source is empty or too large'};
  let current;
  try { current = normalizeProfile(pageUrl); } catch { return {error: pageAccessIssue(html,pageUrl)||'The page did not return a supported profile URL. Open the intended profile and retry.'}; }
  if (current.platform !== profile.platform) return {error: 'The page redirected to a different platform'};
  if (current.key !== profile.key && !(profile.platform === 'youtube' && current.directId) && !profile.directId) return {error: 'The page redirected to a different profile. Use its current profile link.'};
  const candidates = new Map();
  const names = new Map();
  let differentChannel = false;
  const add = (id, method, name) => {
    id = asId(id);
    if ((profile.platform === 'youtube' ? channel(id) : numeric(id))) {
      candidates.set(id, method);
      if (typeof name === 'string' && name.trim()) names.set(id, cleanName(name));
    }
  };
  const matching = value => value && lower(value) === lower(profile.handle);
  const sameUrl = value => { try { return normalizeProfile(value).key === profile.key; } catch { return false; } };
  const ogUrls = metaValues(html, 'og:url');
  const ogMatches = ogUrls.some(sameUrl);
  const declaredProfiles = ogUrls.flatMap(value => { try { return [normalizeProfile(value)]; } catch { return []; } });
  if (declaredProfiles.some(p => p.platform !== profile.platform)) return {error: 'This source belongs to a different platform'};
  if (declaredProfiles.length && !ogMatches && profile.platform !== 'youtube' && !profile.directId) return {error: 'This source belongs to a different profile. Paste the source of the linked account.'};
  if (profile.platform === 'youtube' && profile.url.includes('/@') && declaredProfiles.some(p => p.handle && !sameUrl(p.url))) return {error: 'This source belongs to a different channel'};
  const roots = jsonObjects(html);
  walk(roots, (obj, key) => {
    if (['instagram', 'threads'].includes(profile.platform)) {
      if (matching(obj.username)) {
        // Hydrated Instagram users can expose a separate numeric `id` beside
        // their account `pk`. Do not mix those namespaces or silently resolve
        // real conflicts between account keys in different observations.
        const instagramPk = profile.platform === 'instagram' && Object.hasOwn(obj, 'pk');
        const fields = instagramPk ? numeric(asId(obj.pk)) ? ['pk', 'profile_id'] : [] : ['id', 'pk', 'profile_id'];
        for (const field of fields) if (obj[field]) add(obj[field], 'Profile data · ' + field, obj.full_name || obj.fullName);
      }
      if (profile.platform === 'instagram' && key === 'initialRouteInfo')
        for (const id of instagramRouteIds(obj, profile)) add(id, 'Matched Instagram profile route');
    } else if (profile.platform === 'tiktok') {
      if (matching(obj.uniqueId || obj.unique_id)) {
        if (numeric(asId(obj.id || obj.uid))) add(obj.id || obj.uid, 'Profile data · user ID', obj.nickname);
        else if (numeric(asId(obj.shortId || obj.short_id))) add(obj.shortId || obj.short_id, 'Profile data · shortId', obj.nickname);
      }
    } else if (profile.platform === 'facebook') {
      if (matching(obj.username || obj.vanity || obj.userVanity) || [obj.url, obj.profile_url].some(sameUrl)) {
        for(const field of ['profile_id','id','userID'])if(obj[field])add(obj[field], 'Matched Facebook profile data · '+field, obj.name);
      }
      // Facebook's initial profile route binds vanity and URL to userID in
      // that route's own views. Never search nearby text or recommendation IDs.
      if(key==='initialRouteInfo'&&matching(obj.route?.params?.userVanity)){
        const route=obj.route;let routeMatches=false;
        try{routeMatches=sameUrl(new URL(route.url,profile.url).href);}catch{}
        if(routeMatches)for(const view of [route.rootView,route.hostableView])
          if(view?.props?.userID)add(view.props.userID,'Matched Facebook profile route');
      }
      if (profile.directId && asId(obj.id) === profile.directId && /^(User|Page)$/.test(obj.__typename)) add(obj.id, 'Matched Facebook account ID', obj.name);
      if (/^(profile_owner|profileOwner)$/.test(key)) {
        if (matching(obj.username) || sameUrl(obj.url) || (!obj.username && !obj.url && ogMatches)) add(obj.id || obj.profile_id, 'Profile owner data', obj.name);
      }
    } else if (profile.platform === 'youtube' && key === 'channelMetadataRenderer') {
      const addresses = [obj.vanityChannelUrl, ...(Array.isArray(obj.ownerUrls) ? obj.ownerUrls : [])].filter(Boolean);
      // An explicit different handle is never accepted. Legacy /c and /user URLs can redirect.
      if (!profile.url.includes('/@') || !addresses.length || addresses.some(sameUrl)) add(obj.externalId, 'Channel metadata', obj.title);
      else differentChannel = true;
    }
  });
  if (differentChannel) return {error: 'This source belongs to a different channel'};
  if (profile.platform === 'youtube') {
    for (const id of metaValues(html, 'channelId')) add(id, 'Channel ID metadata');
    if (current.directId && current.key !== profile.key) add(current.directId, 'Canonical channel URL');
  }
  if (profile.platform === 'facebook') {
    for (const value of metaValues(html, 'al:ios:url')) {
      const id = value.match(/^fb:\/\/(?:profile|page)\/(\d+)/)?.[1];
      if (id) add(id, 'Facebook profile metadata');
    }
  }
  // Unscoped profile_id strings can belong to recommendations or embedded accounts.
  // Require an account-bound candidate above; page-level og:url alone is insufficient.
  if (candidates.size === 1) {
    const [id, method] = [...candidates][0];
    if (profile.directId && profile.directId !== id) return {error: 'The page returned a different account ID. Check the original link.'};
    const title = metaValues(html, 'og:title')[0] || '';
    return {id, method, displayName: names.get(id) || nameFromTitle(title, profile), verifiedAt: Date.now(), profileStatus: detectProfileStatus(roots, profile, id)};
  }
  if (candidates.size > 1) return {error: 'Multiple account IDs found. Open the profile and check its source.'};
  const accessIssue=pageAccessIssue(html,pageUrl,roots);if(accessIssue)return {error:accessIssue};
  const gone=confirmedGone(roots,profile,current);if(gone)return gone;
  return {error: 'No matching account ID was exposed by this page. Let the profile finish loading, then retry.'};
}

export function cleanName(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}
function nameFromTitle(title, profile) {
  let text = cleanName(title);
  if (!text) return '';
  if (['instagram', 'threads', 'tiktok'].includes(profile.platform)) {
    const match = text.match(/^(.*?)\s*\(@([^)]*)\)/);
    return match && lower(match[2]) === lower(profile.handle) ? cleanName(match[1]) : '';
  }
  if (profile.platform === 'facebook') text = text.replace(/\s*[|–—-]\s*Facebook\s*$/i, '');
  if (profile.platform === 'youtube') text = text.replace(/\s*[|–—-]\s*YouTube\s*$/i, '');
  if (/^(Facebook|YouTube|Log in.*|Sign in.*|.*not available|.*not found)$/i.test(text)) return '';
  return cleanName(text);
}

export function accountTitle(entry) { return entry.displayName || entry.suppliedName || (entry.handle ? '@' + entry.handle : 'Name unavailable'); }
export function formatDetails(entries, platform = null, {includeNames = true} = {}) {
  return orderAccounts(entries.filter(e => !platform || e.platform === platform)).map((e,index,rows) => {
    if(accountState(e)==='GONE')return [(index===0||accountState(rows[index-1])!=='GONE')?'Accounts no longer available':'',e.originalUrl||e.url,e.handle?'Former / supplied username: @'+e.handle:'', 'Status: Gone'].filter(Boolean).join('\n');
    const state = e.status === 'resolved' && e.id ? e.id : e.status === 'loading' ? 'Lookup in progress' : e.status === 'ready' ? 'Not looked up yet' : e.status === 'stopped' ? 'Lookup stopped' : 'Needs attention';
    const name = e.displayName || (e.suppliedName ? e.suppliedName + ' (supplied; not checked)' : 'Unavailable');
    const annotation = notesInfo(e);
    const lines = includeNames ? ['Display name:  ' + name] : [];
    lines.push([e.originalUrl || e.url, ...annotation.notes].join(' '));
    const ids = suppliedIds(e), check = idCheck(e);
    if (['mismatch', 'conflict', 'unverified'].includes(check.state)) {
      lines.push('Supplied ID' + (ids.length > 1 ? 's' : '') + ': ' + ids.join(', '));
      if (e.status === 'resolved' && e.id) lines.push((e.verificationSource === 'url' ? 'URL ID: ' : 'Found ID: ') + e.id);
    } else {
      lines.push('User ID: ' + state);
      if (check.state === 'corrected') lines.push('Previously supplied IDs: ' + ids.join(', '));
    }
    if (e.status !== 'resolved' && e.id) lines.push('Previously found ID: ' + e.id + ' (not rechecked)');
    if (check.label) lines.push('Check: ' + check.label);
    else if (e.status==='resolved' && e.directId===e.id && !e.verifiedAt) lines.push('Check: ID from link; page not verified');
    if (annotation.changed) lines.push('Original notes: ' + annotation.originalNotes.join(' '));
    if (annotation.warning) lines.push('Status check: ' + annotation.warning);
    return lines.join('\n');
  }).join('\n\n');
}

export function formatIds(entries, platform, separator = 'newline') {
  const delimiter = {newline: '\n', comma: ', ', space: ' '}[separator] || '\n';
  const seen = new Set();
  return entries.filter(e => {
    if (!isCopyableId(e) || (platform && e.platform !== platform)) return false;
    const key = e.platform + ':' + e.id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(e => e.id).join(delimiter);
}
