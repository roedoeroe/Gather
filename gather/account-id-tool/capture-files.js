import {getCapture,getAsset,updateCaptureExport} from './capture-store.js';
const RESERVED=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
export function safePathName(value,max=24){let name=String(value??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g,'-').replace(/\s+/g,' ').replace(/^[. ]+|[. ]+$/g,'');name=Array.from(name).slice(0,max).join('').replace(/[. ]+$/g,'');if(!name)name='Untitled';if(RESERVED.test(name))name='_'+name;return name;}
function token(value,max=32){
  const text=String(value??'unassigned');
  // Native record IDs are UUIDs: keep every ID bit, with separators removed.
  const canonical=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(text)?text.replaceAll('-',''):text.replace(/[^a-zA-Z0-9_-]/g,'_');
  if(canonical.length>max&&max===32)throw new Error('This imported record ID is too long for a safe folder path. Keep the image in Gather and export an all-work backup.');
  return safePathName(canonical,max);
}
export function captureExportPath(record,extension='png'){
  const c=record.context||record,project=c.projectId?'Project--'+token(c.projectId):'Inbox',subject=c.subjectId?safePathName(c.roleId||'Subject',12)+'--'+token(c.subjectId):'Unassigned',scan=c.scanId?'Scan--'+token(c.scanId):'Unassigned';
  let host='page';try{host=new URL(record.source.url).hostname;}catch{}
  const stamp=new Date(record.startedAt).toISOString().replace(/[:.]/g,'-'),mode=record.mode==='full-page'?'full-page':record.mode;
  return 'Gather/'+project+'/'+subject+'/'+scan+'/Captures/'+stamp+'_'+safePathName(host,16)+'_'+safePathName(mode,12)+'_'+token(record.id,12)+'.'+extension;
}
export function preferredCaptureAsset(record,{includeOriginal=false}={}){
  const assets=record.assets||[];
  if(!includeOriginal){
    const derivative=record.shareAssetId?assets.find(a=>a.id===record.shareAssetId&&a.role==='derivative'):assets.find(a=>a.role==='derivative');
    if(derivative)return derivative;
    if(record.mode==='selection'||record.shareAssetId)throw new Error('The shareable derivative is missing. Restore it from backup; Gather will not substitute unredacted originals.');
  }
  return assets.find(a=>a.role==='original')||assets.find(a=>a.role==='tile');
}
export function captureExportRecord(record,asset,{includeOriginal=false}={}){
  // Metadata documents omitted originals without including their pixels in a shareable export.
  return {format:'gather-capture-record',schemaVersion:1,captureId:record.id,evidenceId:record.evidenceId||'E-'+record.id,source:record.source,context:record.context,refs:record.refs,mode:record.mode,startedAt:record.startedAtISO,endedAt:record.endedAtISO,timezone:record.timezone,timezoneOffsetMinutes:record.timezoneOffsetMinutes,status:record.status,dimensions:record.dimensions,scale:record.scale,coordinates:record.coordinates,crop:record.crop,scroll:record.scroll,limitations:record.limitations||[],exportedAsset:{...asset,blob:undefined},originalsIncluded:includeOriginal||asset.role==='original'||asset.role==='tile',notice:'SHA-256 checks the saved bytes for changes. It does not establish authenticity or identity. Subject associations are user assignments, not identity conclusions.'};
}
async function waitForDownload(id,{timeout=90000}={}){
  const api=globalThis.chrome?.downloads;if(!api?.search)throw new Error('Browser download status is unavailable. Check Downloads and retry.');
  return new Promise((resolve,reject)=>{let done=false;const finish=(error)=>{if(done)return;done=true;clearTimeout(timer);api.onChanged?.removeListener(changed);error?reject(error):resolve(id);};const changed=delta=>{if(delta.id!==id)return;if(delta.state?.current==='complete')finish();else if(delta.state?.current==='interrupted'||delta.error?.current)finish(new Error('Folder export was interrupted'+(delta.error?.current?': '+delta.error.current:'.')));};const timer=setTimeout(()=>finish(new Error('Folder export is still pending. Check Downloads, then Retry in Gather.')),timeout);api.onChanged?.addListener(changed);api.search({id}).then(rows=>{if(!rows.length)finish(new Error('Folder export was removed from Downloads.'));else if(rows[0].state==='complete')finish();else if(rows[0].state==='interrupted')finish(new Error('Folder export was interrupted: '+(rows[0].error||'unknown error')));}).catch(finish);});
}
export async function downloadVerifiedBlob(blob,filename){
  if(!globalThis.chrome?.downloads?.download||!globalThis.URL?.createObjectURL)throw new Error('Open the Gather workspace to export this saved capture.');
  const url=URL.createObjectURL(blob);try{const id=await chrome.downloads.download({url,filename,saveAs:false,conflictAction:'uniquify'});if(!Number.isInteger(id))throw new Error('Browser did not accept this folder export.');await waitForDownload(id);const downloaded=(await chrome.downloads.search({id}))[0];return {id,basename:(downloaded?.filename||filename).split(/[\\/]/).at(-1)};}finally{URL.revokeObjectURL(url);}
}
const running=new Map();
export function exportCapture(id,options={}){if(running.has(id))return running.get(id);const work=doExport(id,options).finally(()=>running.delete(id));running.set(id,work);return work;}
async function doExport(id,{includeOriginal=false}={}){
  let record=await getCapture(id);if(!record||record.savedState!=='saved')throw new Error('Save a capture in Gather before exporting it.');
  record=await updateCaptureExport(id,{status:'exporting',error:'',startedAt:Date.now(),attempts:(record.export?.attempts||0)+1});
  try{const chosen=preferredCaptureAsset(record,{includeOriginal});if(!chosen)throw new Error('Capture has no image. Restore it from a backup.');const asset=await getAsset(chosen.id,{verify:true}),ext={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"}[asset.mime]||'png',filename=captureExportPath(record,ext);const imageDownload=await downloadVerifiedBlob(asset.blob,filename),actualFilename=filename.slice(0,filename.lastIndexOf('/')+1)+imageDownload.basename;const recordDownload=await downloadVerifiedBlob(new Blob([JSON.stringify({...captureExportRecord(record,chosen,{includeOriginal}),exportedImageFile:imageDownload.basename},null,2)],{type:'application/json'}),actualFilename.replace(/\.[^.]+$/,'.json'));return updateCaptureExport(id,{status:'exported',error:'',completedAt:Date.now(),filename:actualFilename,downloadIds:[imageDownload.id,recordDownload.id],assetId:asset.id});}catch(error){await updateCaptureExport(id,{status:'failed',error:String(error.message||error).slice(0,2000)});throw error;}
}
