// Older releases kept automatic search logs. Keep only query-free reference
// records so existing captures/findings retain valid, stable relationships.
// Deliberately entered case fields, findings and search plans are untouched.
export function forgetSearchText(state) {
  const clean=structuredClone(state);
  clean.searches=clean.searches.map(({id,scanId,projectId,provider,status,createdAt,openedAt,lastOpenedAt,reviewedAt})=>({
    id,scanId,projectId,provider,status,createdAt,
    ...(openedAt?{openedAt}:{}),...(lastOpenedAt?{lastOpenedAt}:{}),...(reviewedAt?{reviewedAt}:{}),
    query:'',url:'',queryRetained:false
  }));
  clean.activity=clean.activity.filter(event=>!event.kind.startsWith('search.'));
  if(JSON.stringify(clean)===JSON.stringify(state))return state;
  clean.revision++;
  return clean;
}

export function forgetSearchDrafts(values,depth=0) {
  if(depth>64)throw new Error('Search draft archive is too deeply nested. No data was removed.');
  return Object.fromEntries(Object.entries(values).filter(([key])=>!key.startsWith('gather.search-draft.')).map(([key,value])=>[
    key,key.startsWith('gather.archive.')&&value&&typeof value==='object'?forgetSearchDrafts(value,depth+1):value
  ]));
}
