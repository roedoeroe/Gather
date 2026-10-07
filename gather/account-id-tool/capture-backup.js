import {snapshotCaptureBundle,hashBytes,captureId,frozenDestination,CAPTURE_LIMITS,writeCaptureSetting} from './capture-store.js';
import {validateBackup} from './backup-validation.js';
import {projectScope} from './case-close.js';
// A length-prefixed binary container keeps original image bytes out of JSON.
// No executable code, paths, compression, or base64 images are accepted.
const MAGIC=new TextEncoder().encode('GATHER-BINARY-1\n');
export const MAX_BACKUP_BYTES=560*1024*1024;
const fail=message=>{throw new Error(message);};
export async function validateCaptureBundle(bundle,workspace){
  if(bundle?.schemaVersion!==1)fail('Unsupported capture backup version.');
  for(const key of ['captures','assets','subjects','settings'])if(!Array.isArray(bundle[key])||bundle[key].length>100000)fail('Invalid capture backup records.');
  if(bundle.captures.length>CAPTURE_LIMITS.records||bundle.subjects.length>CAPTURE_LIMITS.records)fail('Too many capture records.');
  const ids=new Set(['projects','scans','items','entities','tasks','searches','activity'].flatMap(key=>workspace[key].map(row=>row.id))),subjects=new Map(),captures=new Map(),assets=new Map();
  for(const rows of [bundle.subjects,bundle.captures,bundle.assets])for(const row of rows){captureId(row.id);if(ids.has(row.id))fail('Duplicate capture backup ID.');ids.add(row.id);}
  const scope=row=>{if(row.scanId===null&&row.projectId===null)return;if(!workspace.scans.some(s=>s.id===row.scanId&&s.projectId===row.projectId))fail('Capture refers to an unavailable project or scan.');};
  // Existing explicit associations survive later moves of the saved observation.
  // New associations are constrained to the project at the user action.
  for(const subject of bundle.subjects){if(!workspace.projects.some(p=>p.id===subject.projectId)||typeof subject.name!=='string'||!subject.name.trim()||subject.name.length>100||!Array.isArray(subject.accountObservationIds))fail('Invalid subject in backup.');for(const id of subject.accountObservationIds)if(!workspace.items.some(i=>i.id===id&&i.kind==='account'))fail('Subject account association is missing.');subjects.set(subject.id,subject);}
  for(const subject of subjects.values()){if(subject.roleId!==undefined&&(!/^[A-Z][A-Z0-9_-]*-\d{2,}$/.test(subject.roleId)||subject.roleId.length>50))fail('Invalid durable role label.');if(subject.mode==='ephemeral'&&subject.name!==subject.roleId)fail('Ephemeral subject names must not be durable.');}
  for(const item of workspace.items)if(item.filingSubjectId&&subjects.get(item.filingSubjectId)?.projectId!==item.capturedContext.projectId)fail('Finding filing role is missing.');
  if(workspace.research)for(const key of ['seeds','queue','coverage','associations'])for(const row of workspace.research[key])if(row.subjectId&&subjects.get(row.subjectId)?.projectId!==row.projectId)fail('Research role is missing or in another project.');
  for(const record of bundle.captures){
    frozenDestination(record.context);scope(record);scope(record.context);
    for(const key of ['scanId','projectId','subjectId'])if(record[key]!==record.context[key])fail('Capture assignment differs from its frozen destination.');
    if(record.subjectId&&subjects.get(record.subjectId)?.projectId!==record.projectId)fail('Capture subject is missing or in another project.');
    if(!['visible','selection','full-page'].includes(record.mode)||!['capturing','complete','partial','failed','cancelled','interrupted'].includes(record.status)||!Array.isArray(record.assetIds)||!Number.isFinite(record.startedAt)||record.startedAt<=0)fail('Invalid capture record.');
    const url=new URL(record.source?.url);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)fail('Invalid capture URL.');
    for(const [key,kind] of [['accountId','account'],['sourceId','source']])if(record.refs?.[key]&&!workspace.items.some(i=>i.id===record.refs[key]&&i.kind===kind))fail('Capture observation reference is missing.');
    if(record.refs?.searchId&&!workspace.searches.some(s=>s.id===record.refs.searchId&&s.scanId===record.scanId))fail('Capture search reference is missing.');
    captures.set(record.id,record);
  }
  let total=0;
  for(const asset of bundle.assets){
    if(!captures.has(asset.captureId)||!['original','tile','derivative'].includes(asset.role)||!['image/png','image/jpeg','image/webp'].includes(asset.mime)||!(asset.blob instanceof Blob)||asset.blob.size!==asset.bytes||asset.bytes>CAPTURE_LIMITS.assetBytes||!asset.bytes||! /^[a-f0-9]{64}$/.test(asset.sha256))fail('Invalid capture asset.');
    total+=asset.bytes;if(total>CAPTURE_LIMITS.totalBytes)fail('Capture backup exceeds the storage limit.');
    if(await hashBytes(asset.blob)!==asset.sha256)fail('Capture backup image failed its SHA-256 integrity check.');assets.set(asset.id,asset);
  }
  for(const record of captures.values()){
    let bytes=0;for(const id of record.assetIds){const asset=assets.get(id);if(!asset||asset.captureId!==record.id)fail('Capture image is missing from this backup.');bytes+=asset.bytes;}
    if(bytes!==record.bytes)fail('Capture byte count differs from its assets.');
    if(record.savedState==='saved'&&(!record.assetIds.length||!record.assetIds.some(id=>['original','tile'].includes(assets.get(id).role))))fail('Saved capture is missing original image bytes.');
    if(record.mode==='selection'&&record.savedState==='saved'&&!record.assetIds.some(id=>assets.get(id).role==='derivative'))fail('Selection capture is missing its cropped image.');
    if(record.assetIds.length!==new Set(record.assetIds).size)fail('Repeated asset reference.');
    if(record.shareAssetId&&(!record.assetIds.includes(record.shareAssetId)||assets.get(record.shareAssetId)?.role!=='derivative'))fail('Invalid shareable derivative reference.');
    if(record.review!==undefined&&!['unreviewed','reviewed','follow-up','excluded'].includes(record.review)||record.included!==undefined&&typeof record.included!=='boolean')fail('Invalid capture review state.');
    if((record.assets||[]).length!==record.assetIds.length)fail('Capture asset metadata is incomplete.');
    if(new Set((record.assets||[]).map(a=>a.id)).size!==record.assetIds.length)fail('Repeated capture asset metadata.');
    for(const summary of record.assets||[]){const actual=assets.get(summary.id);if(!actual||!record.assetIds.includes(summary.id)||summary.sha256!==actual.sha256||summary.role!==actual.role||summary.captureId!==record.id||summary.mime!==actual.mime||summary.bytes!==actual.bytes)fail('Capture asset metadata differs from image bytes.');}
  }
  for(const asset of assets.values())if(!captures.get(asset.captureId).assetIds.includes(asset.id))fail('Orphan image in backup.');
  for(const asset of assets.values())if(asset.parentAssetId&&(asset.parentAssetId===asset.id||assets.get(asset.parentAssetId)?.captureId!==asset.captureId))fail('Invalid derivative parent.');
  const keys=new Set();for(const setting of bundle.settings){if(keys.has(setting.key))fail('Duplicate capture setting.');keys.add(setting.key);if(setting.key==='preferences'){if(typeof setting.value?.automaticExport!=='boolean'||typeof setting.value?.subjectLabel!=='string'||setting.value.subjectLabel.length>30)fail('Invalid capture preferences.');}else if(setting.key.startsWith('subject:')){const scanId=setting.key.slice(8);if(scanId!=='null'&&!workspace.scans.some(s=>s.id===scanId))fail('Missing selected scan.');const scan=workspace.scans.find(s=>s.id===scanId);if(setting.value&&subjects.get(setting.value)?.projectId!==scan?.projectId)fail('Invalid selected subject.');}else if(setting.key.startsWith('project-label:')){if(!workspace.projects.some(p=>p.id===setting.key.slice(14))||typeof setting.value!=='string'||!setting.value.trim()||setting.value.length>30)fail('Invalid subject display label.');}else fail('Unknown capture backup setting.');}
  return bundle;
}
export async function createFullBackup(workspaceBackup,{projectId=null}={}){
  validateBackup(workspaceBackup);const bundle=await snapshotCaptureBundle();
  if(bundle.settings.some(s=>s.key==='pending-workspace-restore'))fail('Finish the interrupted restore before creating a backup.');
  if(projectId){const state=projectScope(workspaceBackup.workspace,projectId);const legacy=Object.fromEntries(Object.entries(workspaceBackup.legacy).filter(([key,value])=>key.startsWith('gather.batch.')&&value.lookupContext?.projectId===projectId));workspaceBackup={...workspaceBackup,workspace:state,legacy};bundle.captures=bundle.captures.filter(c=>c.projectId===projectId);const captures=new Set(bundle.captures.map(c=>c.id));bundle.assets=bundle.assets.filter(a=>captures.has(a.captureId));bundle.subjects=bundle.subjects.filter(s=>s.projectId===projectId);const scans=new Set(state.scans.map(s=>s.id));bundle.settings=bundle.settings.filter(s=>s.key==='preferences'||s.key==='project-label:'+projectId||s.key.startsWith('subject:')&&scans.has(s.key.slice(8)));}
  bundle.settings=bundle.settings.filter(s=>s.key==='preferences'||s.key.startsWith('subject:')||s.key.startsWith('project-label:'));
  await validateCaptureBundle(bundle,workspaceBackup.workspace);
  const manifest={format:'gather-binary-backup',schemaVersion:1,createdAt:new Date().toISOString(),workspaceBackup,bundle:{...bundle,assets:bundle.assets.map(({blob,...asset})=>asset)}};
  const json=new TextEncoder().encode(JSON.stringify(manifest));if(json.length>32*1024*1024)fail('Backup metadata exceeds 32 MiB.');const size=new Uint8Array(4);new DataView(size.buffer).setUint32(0,json.length,true);
  const blob=new Blob([MAGIC,size,json,...bundle.assets.map(a=>a.blob)],{type:'application/octet-stream'});if(blob.size>MAX_BACKUP_BYTES)fail('Backup exceeds the 560 MiB container limit.');return blob;
}
export async function readFullBackup(file){
  if(!(file instanceof Blob)||file.size>MAX_BACKUP_BYTES||file.size<MAGIC.length+4)fail('Choose a Gather binary backup under 560 MiB.');
  const head=new Uint8Array(await file.slice(0,MAGIC.length+4).arrayBuffer());if(!MAGIC.every((b,i)=>head[i]===b))fail('This is not a Gather image backup.');const length=new DataView(head.buffer).getUint32(MAGIC.length,true);
  if(length>32*1024*1024||length<2||length+head.length>file.size)fail('Invalid backup metadata length.');
  const manifest=JSON.parse(await file.slice(head.length,head.length+length).text());if(manifest.format!=='gather-binary-backup'||manifest.schemaVersion!==1)fail('Unsupported backup.');validateBackup(manifest.workspaceBackup);
  let offset=head.length+length;for(const asset of manifest.bundle?.assets||[]){if(!Number.isInteger(asset.bytes)||asset.bytes<1||asset.bytes>CAPTURE_LIMITS.assetBytes||offset+asset.bytes>file.size)fail('Missing or oversized backup image.');asset.blob=file.slice(offset,offset+asset.bytes,asset.mime);offset+=asset.bytes;}if(offset!==file.size)fail('Unexpected trailing backup data.');
  await validateCaptureBundle(manifest.bundle,manifest.workspaceBackup.workspace);return manifest;
}
export async function stageFullRestore(manifest){
  validateBackup(manifest.workspaceBackup);await validateCaptureBundle(manifest.bundle,manifest.workspaceBackup.workspace);
  const id=crypto.randomUUID();await writeCaptureSetting('restore-stage:'+id,manifest);return id;
}
