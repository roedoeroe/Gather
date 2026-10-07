const sameHandle = (a, b) => typeof a === 'string' && a.replace(/^@/, '').toLowerCase() === String(b).toLowerCase();
const idString = v => typeof v === 'string' ? v : Number.isSafeInteger(v) ? String(v) : '';
const countValue = v => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : typeof v === 'string' && /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) ? Number(v) : null;
function walk(roots, visit) {
  const stack = [...roots]; let visited = 0;
  while (stack.length && visited++ < 150000) {
    const value = stack.pop();
    if (!value || typeof value !== 'object') continue;
    visit(value);
    for (const child of Object.values(value)) if (child && typeof child === 'object') stack.push(child);
  }
}
export function cleanProfileStatus(value) {
  return {
    privacy: ['private','public'].includes(value?.privacy) ? value.privacy : 'unknown',
    content: ['empty','has-posts'].includes(value?.content) ? value.content : 'unknown',
    postCount: countValue(value?.postCount),
    conflicted: value?.conflicted === true,
    evidence: Array.isArray(value?.evidence) ? value.evidence.filter(v => typeof v === 'string').slice(0,8).map(v => v.slice(0,180)) : []
  };
}

// Only data tied to the resolved account can establish a status. Empty arrays,
// missing fields, boilerplate translations and generic page text are not proof.
export function detectProfileStatus(roots, profile, id) {
  const privacy = new Set(), counts = new Set(), evidence = new Set();
  const privateField = (value, field) => {
    if (typeof value !== 'boolean') return;
    privacy.add(value ? 'private' : 'public'); evidence.add(field + ': ' + value);
  };
  const countField = (value, field) => {
    const count = countValue(value);
    if (count === null) return;
    counts.add(count); evidence.add(field + ': ' + count);
  };
  const metaUser = obj => sameHandle(obj.username, profile.handle) && [obj.id,obj.pk,obj.profile_id].some(v => idString(v) === id);
  const tiktokUser = obj => obj && sameHandle(obj.uniqueId || obj.unique_id, profile.handle) && [obj.id,obj.uid,obj.shortId,obj.short_id].some(v => idString(v) === id);
  walk(roots, obj => {
    if (profile.platform === 'tiktok') {
      if (tiktokUser(obj)) privateField(obj.privateAccount, 'Account privacy');
      if (tiktokUser(obj.user)) {
        privateField(obj.user.privateAccount, 'Account privacy');
        countField(obj.stats?.videoCount, 'Posted videos');
        countField(obj.statsV2?.videoCount, 'Posted videos');
      }
    } else if (['instagram','threads'].includes(profile.platform) && metaUser(obj)) {
      privateField(obj.is_private, 'Account privacy');
      if (profile.platform === 'instagram') {
        countField(obj.edge_owner_to_timeline_media?.count, 'Profile posts');
        countField(obj.media_count, 'Profile posts');
      }
    } else if (profile.platform === 'facebook' && obj.__typename === 'User' && idString(obj.id) === id) {
      // Unlocked Facebook profiles may still hide their posts. False is not proof
      // of a public account; an empty visible timeline is not proof of no posts.
      if (obj.is_profile_locked === true) { privacy.add('private'); evidence.add('Profile locked'); }
    }
  });
  if (profile.platform === 'youtube') {
    for (const root of roots) {
      if (root?.metadata?.channelMetadataRenderer?.externalId !== id) continue;
      const texts = [];
      const old = root.header?.c4TabbedHeaderRenderer;
      if (old?.channelId === id) {
        const text = old.videoCountText;
        texts.push(text?.simpleText || text?.runs?.map(r => r.text || '').join('') || '');
      }
      const metadata = root.header?.pageHeaderRenderer?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel;
      for (const row of metadata?.metadataRows || []) for (const part of row.metadataParts || []) texts.push(part.text?.content || '');
      for (const text of texts) {
        const match = text.trim().match(/^(no|\d[\d,]*)\s+(?:public\s+)?videos?$/i);
        if (match) countField(match[1].toLowerCase() === 'no' ? 0 : match[1].replace(/,/g,''), 'Public uploads');
      }
      // YouTube's channel upload count describes public uploads, not all private
      // videos the owner may have stored. The UI defines EMPTY accordingly.
      if (counts.size) privacy.add('public');
    }
  }
  const conflicted = privacy.size > 1 || counts.size > 1;
  const privacyState = privacy.size === 1 ? [...privacy][0] : 'unknown';
  const count = counts.size === 1 ? [...counts][0] : null;
  const content = conflicted || privacyState === 'private' || count === null ? 'unknown' : count > 0 ? 'has-posts' : privacyState === 'public' ? 'empty' : 'unknown';
  return cleanProfileStatus({privacy: conflicted ? 'unknown' : privacyState, content, postCount: count, conflicted, evidence: [...evidence]});
}

export function currentProfileStatus(entry) {
  if (entry.status !== 'resolved' || !entry.verifiedAt || !['live','source'].includes(entry.verificationSource)) return cleanProfileStatus(null);
  return cleanProfileStatus(entry.profileStatus);
}
export function parseNotes(value) {
  const text = String(value || '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim().slice(0,500);
  return (text.match(/\([^()]*\)|[^()]+/g) || []).map(n => n.trim()).filter(Boolean).map(n => n.startsWith('(') ? n : '(' + n + ')');
}
export function notesInfo(entry) {
  const originals = Array.isArray(entry.notes) ? entry.notes.filter(n => typeof n === 'string') : [];
  const tags = new Set(), other = [];
  for (const note of originals) {
    const match = note.match(/^\(\s*((?:POSS|PRIV|EMPTY)(?:\s*\/\s*(?:POSS|PRIV|EMPTY))*)\s*\)$/i);
    if (match) for (const tag of match[1].split('/')) tags.add(tag.trim().toUpperCase());
    else other.push(note);
  }
  const suppliedTags = new Set(tags), observed = currentProfileStatus(entry);
  const automatic = entry.usePageStatus !== false;
  if (automatic) {
    if (observed.privacy === 'private') { tags.add('PRIV'); tags.delete('EMPTY'); }
    else if (observed.privacy === 'public') tags.delete('PRIV');
    if (observed.content === 'empty') tags.add('EMPTY');
    else if (observed.content === 'has-posts') tags.delete('EMPTY');
  }
  // POSS is only carried forward from the user's own notes. Never infer it.
  const group = ['POSS','PRIV','EMPTY'].filter(tag => tags.has(tag));
  const notes = [...(group.length ? ['(' + group.join('/') + ')'] : []), ...other];
  const changed = automatic && ['PRIV','EMPTY'].some(tag => suppliedTags.has(tag) && !tags.has(tag));
  const unchecked = automatic && ((tags.has('PRIV') && observed.privacy !== 'private') || (tags.has('EMPTY') && observed.content !== 'empty'));
  const warning = !automatic ? 'Manual status' : observed.conflicted ? 'Page status conflicts — notes kept' : unchecked ? 'Supplied status not verified' : '';
  const hint = changed ? 'Status updated · originally ' + originals.join(' ') + (warning ? ' · '+warning : '') : warning;
  return {notes, originalNotes: originals, changed, warning, hint, observed};
}
