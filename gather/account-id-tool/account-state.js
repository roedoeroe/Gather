// Conservative adapter contract. Missing IDs, HTTP status and generic page text
// never establish that an account is gone.
export const ADAPTER_VERSION = '1.8.8';
export const ACCOUNT_STATES = ['AVAILABLE','PRIVATE_INACCESSIBLE','GONE','UNKNOWN_TECHNICAL'];
export function confirmedGone(roots, profile, current) {
  if (profile.platform !== 'youtube' || current.key !== profile.key) return null;
  for (const root of roots) {
    for (const alert of root?.alerts || []) {
      const renderer = alert?.alertRenderer;
      const message = renderer?.text?.simpleText || renderer?.text?.runs?.map(r=>r.text||'').join('');
      if (renderer?.type === 'ERROR' && message === 'This channel does not exist.') {
        return {accountState:'GONE', stateReason:message, adapterVersion:ADAPTER_VERSION,
          method:'YouTube · explicit channel absence alert', verifiedAt:Date.now()};
      }
    }
  }
  return null;
}
export function accountState(entry) {
  if (entry?.status === 'gone' && entry.accountState === 'GONE' && entry.verifiedAt && entry.stateReason && entry.adapterVersion) return 'GONE';
  if (entry?.status === 'resolved' && entry.id && entry.verifiedAt && ['live','source'].includes(entry.verificationSource)) return entry.profileStatus?.privacy === 'private' ? 'PRIVATE_INACCESSIBLE' : 'AVAILABLE';
  return 'UNKNOWN_TECHNICAL';
}
export function orderAccounts(entries) {
  const rank=e=>accountState(e)==='GONE'?2:accountState(e)==='UNKNOWN_TECHNICAL'?1:0;
  return [...entries].sort((a,b)=>rank(a)-rank(b));
}
export function accountSummary(entries) {
  const gone=entries.filter(e=>accountState(e)==='GONE').length;
  const ready=entries.filter(e=>['AVAILABLE','PRIVATE_INACCESSIBLE'].includes(accountState(e))).length;
  return `${ready} accounts ready${gone?` · ${gone} gone (omitted from IDs-only copy)`:''}${entries.length-ready-gone?` · ${entries.length-ready-gone} could not be checked — review`:''}`;
}
export function accountLine(entry) {
  const state=accountState(entry);
  return [entry.platform,entry.handle?'@'+entry.handle:'',entry.url,
    state==='GONE'?'Gone':state==='PRIVATE_INACCESSIBLE'?'Private / inaccessible':state==='AVAILABLE'?'Available':'Could not determine',
    state!=='GONE'&&entry.status==='resolved'&&entry.id?'ID: '+entry.id:''].filter(Boolean).join(' · ');
}
