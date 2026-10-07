// This metadata travels with a lookup batch; active workspace changes cannot retarget it.
export function cleanLookupContext(value){
  if(!value||typeof value!=='object'||!Number.isFinite(value.startedAt)||value.startedAt<=0)return null;
  const id=v=>typeof v==='string'&&/^[\w-]{1,100}$/.test(v);
  const search=value.originatingSearchId;
  if(search!==undefined&&search!==null&&!id(search))return null;
  const extra=search?{originatingSearchId:search}:{};
  if(value.scanId===null&&value.projectId===null)return {scanId:null,projectId:null,startedAt:value.startedAt,...extra};
  if(id(value.scanId)&&id(value.projectId))return {scanId:value.scanId,projectId:value.projectId,startedAt:value.startedAt,...extra};
  return null;
}
export function captureContext(state,startedAt=Date.now()){
  if(state.activeScanId===null)return {scanId:null,projectId:null,startedAt};
  const scan=state.scans.find(s=>s.id===state.activeScanId);
  if(!scan)throw new Error('Choose a valid active scan before starting this lookup.');
  return {scanId:scan.id,projectId:scan.projectId,startedAt};
}
export function saveDestination(state,origin){const captured=cleanLookupContext(origin);return captured?captured.scanId:state.activeScanId;}
