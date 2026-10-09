// Packaged static script runs in the ISOLATED world; never the site's MAIN world.
// Keep its return value small and treat it as untrusted input.
export function validateProfileResult(value) {
  const fail = () => {throw new Error('The profile reader returned invalid data.');};
  if(!value || typeof value!=='object' || Array.isArray(value) || JSON.stringify(value).length>8192)fail();
  const keys=['id','method','displayName','verifiedAt','profileStatus','accountState','stateReason','adapterVersion','error'];
  if(Object.keys(value).some(key=>!keys.includes(key)))fail();
  for(const key of ['id','method','displayName','stateReason','adapterVersion','error'])if(value[key]!==undefined&&(typeof value[key]!=='string'||value[key].length>1000))fail();
  if(value.id!==undefined&&!/^(?:[1-9]\d{0,29}|UC[\w-]{22})$/.test(value.id))fail();
  if(value.verifiedAt!==undefined&&(!Number.isSafeInteger(value.verifiedAt)||value.verifiedAt<0))fail();
  if(value.accountState!==undefined&&value.accountState!=='GONE')fail();
  if(value.profileStatus!==undefined){
    const s=value.profileStatus;
    if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).some(k=>!['privacy','content','postCount','conflicted','evidence'].includes(k)))fail();
    if(!['private','public','unknown'].includes(s.privacy)||!['empty','has-posts','unknown'].includes(s.content)||(s.postCount!==null&&(!Number.isSafeInteger(s.postCount)||s.postCount<0))||typeof s.conflicted!=='boolean'||!Array.isArray(s.evidence)||s.evidence.length>8||s.evidence.some(v=>typeof v!=='string'||v.length>180))fail();
  }
  if(!value.id&&!value.error&&value.accountState!=='GONE')fail();
  if(value.error&&(value.id||value.accountState))fail();
  return value;
}
export async function readProfileInPage(tabId,profile,{source=false,includeName=false,documentId,reuseReader=false}={}) {
  let target={tabId,...(documentId?{documentIds:[documentId]}:{})};
  const loaded=reuseReader&&documentId?[{documentId}]:await chrome.scripting.executeScript({target,world:'ISOLATED',files:['profile-reader.js']});
  const loadedId=loaded[0]?.documentId;
  if(documentId&&loadedId!==documentId)throw new Error('The profile document changed.');
  if(loadedId)target={tabId,documentIds:[loadedId]};
  const rows=await chrome.scripting.executeScript({target,world:'ISOLATED',func:async function readProfileResult(url,source,includeName){return globalThis.__gatherProfileReader(url,source,includeName);},args:[profile.url,source,Boolean(includeName)]});
  if(loadedId&&rows[0]?.documentId!==loadedId)throw new Error('The profile document changed.');
  return {result:validateProfileResult(rows[0]?.result),documentId:rows[0]?.documentId};
}
