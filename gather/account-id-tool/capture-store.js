import {projectSignature} from './case-close.js';
import {updateCaseSession} from './case-session.js';
// Capture binaries deliberately live outside the 4 MiB workspace JSON.
export const CAPTURE_DB = 'gather-captures-v1';
export const CAPTURE_LIMITS = Object.freeze({assetBytes:64*1024*1024,captureBytes:192*1024*1024,totalBytes:512*1024*1024,records:20000});
const DEFAULTS = {subjectLabel:'Subject',automaticExport:false,automaticCopy:true};
let connection;
const uid=()=>crypto.randomUUID();
const fail=message=>{throw new Error(message);};
function changed(){if(globalThis.document&&globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.postMessage('changed');channel.close();}}
export function captureId(value,nullable=false){if(nullable&&value==null)return null;if(typeof value!=='string'||! /^[\w-]{1,100}$/.test(value))fail('Invalid capture record reference.');return value;}
const cleanText=(value,max=500)=>{if(typeof value!=='string'||value.length>max)fail('Invalid capture text.');return value.trim();};
export function frozenDestination(value={}){
  const projectId=captureId(value.projectId,true),scanId=captureId(value.scanId,true),subjectId=captureId(value.subjectId,true);
  if((projectId===null)!==(scanId===null)||subjectId&&!projectId)fail('Choose a valid project and scan.');
  return Object.freeze({projectId,scanId,subjectId,projectName:cleanText(value.projectName||'Inbox',100),scanName:cleanText(value.scanName||'Unassigned',100),subjectName:cleanText(value.subjectName||'Unassigned',100),...(value.roleId?{roleId:cleanText(value.roleId,50)}:{})});
}
export async function hashBytes(blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function finish(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(tx.error||new Error('Capture storage write was interrupted.'));});}
export function openCaptureDB(){
  if(!globalThis.indexedDB)return Promise.reject(new Error('This browser does not provide IndexedDB capture storage.'));
  if(!connection)connection=new Promise((resolve,reject)=>{
    const req=indexedDB.open(CAPTURE_DB,1);
    req.onupgradeneeded=()=>{const db=req.result;const captures=db.createObjectStore('captures',{keyPath:'id'});for(const key of ['projectId','scanId','subjectId'])captures.createIndex(key,key);const assets=db.createObjectStore('assets',{keyPath:'id'});assets.createIndex('captureId','captureId');db.createObjectStore('subjects',{keyPath:'id'}).createIndex('projectId','projectId');db.createObjectStore('settings',{keyPath:'key'});};
    req.onerror=()=>{connection=null;reject(req.error);};req.onblocked=()=>{connection=null;reject(new Error('Close older Gather windows before opening capture storage.'));};
    req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
  });return connection;
}
async function readOne(store,id){const db=await openCaptureDB();return request(db.transaction(store).objectStore(store).get(id));}
async function readAll(store){const db=await openCaptureDB();return request(db.transaction(store).objectStore(store).getAll());}
async function writeOne(store,value){const db=await openCaptureDB(),tx=db.transaction(store==='subjects'?['subjects','settings']:store,'readwrite'),done=finish(tx);try{if((store==='subjects'&&value.projectId&&await request(tx.objectStore('settings').get('closed-project:'+value.projectId)))||(store==='settings'&&value.key.startsWith('project-label:')&&await request(tx.objectStore('settings').get('closed-project:'+value.key.slice(14))))||(store==='settings'&&value.key.startsWith('subject:')&&await request(tx.objectStore('settings').get('closed-scan:'+value.key.slice(8)))))fail('This project was closed.');tx.objectStore(store).put(value);}catch(e){tx.abort();await done.catch(()=>{});throw e;}await done;changed();return value;}
export async function getCaptureSettings(projectId=null){const settings={...DEFAULTS,...(await readOne('settings','preferences'))?.value};if(projectId){captureId(projectId);const label=(await readOne('settings','project-label:'+projectId))?.value;if(label)settings.subjectLabel=label;}return settings;}
export async function updateCaptureSettings(changes,{projectId=null}={}){
  if(projectId&&Object.hasOwn(changes,'subjectLabel')){captureId(projectId);const label=cleanText(changes.subjectLabel,30);if(!label)fail('Enter a subject display label.');await writeOne('settings',{key:'project-label:'+projectId,value:label});const rest={...changes};delete rest.subjectLabel;if(Object.keys(rest).length)await updateCaptureSettings(rest);return getCaptureSettings(projectId);}
  const approved={};for(const key of ['automaticCopy','automaticExport'])if(Object.hasOwn(changes,key)){if(typeof changes[key]!=='boolean')fail('Invalid capture preference.');approved[key]=changes[key];}
  if(Object.hasOwn(changes,'subjectLabel')){approved.subjectLabel=cleanText(changes.subjectLabel,30);if(!approved.subjectLabel)fail('Enter a subject display label.');}
  // Read/merge/write in one transaction: simultaneous preferences cannot erase each other.
  const db=await openCaptureDB(),tx=db.transaction('settings','readwrite'),done=finish(tx),store=tx.objectStore('settings');let settings;
  try{settings={...DEFAULTS,...(await request(store.get('preferences')))?.value,...approved};store.put({key:'preferences',value:settings});}catch(e){tx.abort();await done.catch(()=>{});throw e;}
  await done;changed();return settings;
}
export async function listSubjects(projectId){
  const db=await openCaptureDB(),tx=db.transaction('subjects','readwrite'),done=finish(tx),store=tx.objectStore('subjects');
  const subjects=(await request(store.getAll())).filter(s=>s.projectId===projectId).sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id));
  const used=new Set(subjects.map(s=>s.roleId).filter(Boolean));let n=1;
  for(const subject of subjects)if(!subject.roleId){while(used.has('SUBJECT-'+String(n).padStart(2,'0')))n++;subject.roleId='SUBJECT-'+String(n++).padStart(2,'0');subject.roleType='SUBJECT';subject.mode??='local';used.add(subject.roleId);store.put(subject);}await done;
  let session={},hidden=false;if(globalThis.chrome?.storage?.session){const all=await chrome.storage.session.get(null);session=all['gather.case.'+projectId]||{};hidden=all['gather.hideFriendlyLabels']===true;}
  return subjects.map(s=>({...s,name:hidden?s.roleId:session.names?.[s.id]||s.name}));
}
export async function createSubject({projectId,name}){captureId(projectId);name=cleanText(name,100);if(!name)fail('Enter a subject name.');
  const state=globalThis.chrome?.storage?.local?(await chrome.storage.local.get('gather.workspace.v1'))['gather.workspace.v1']:null,mode=state?.projects.find(p=>p.id===projectId)?.mode||'local';
  const subject={id:uid(),projectId,name:mode==='ephemeral'?'Subject':name,mode,createdAt:Date.now(),accountObservationIds:[]};await writeOne('subjects',subject);const migrated=(await listSubjects(projectId)).find(s=>s.id===subject.id);
  if(mode==='ephemeral'){await updateCaseSession(projectId,value=>({...value,names:{...value.names,[subject.id]:name}}));await writeOne('subjects',{...subject,roleId:migrated.roleId,roleType:migrated.roleType,name:migrated.roleId});}
  return {...migrated,name};}

export async function renameSubject(id,name){captureId(id);name=cleanText(name,100);if(!name)fail('Enter a subject name.');const subject=await readOne('subjects',id);if(!subject)fail('Subject is no longer available.');
  if(subject.mode==='ephemeral'){await updateCaseSession(subject.projectId,value=>({...value,names:{...value.names,[id]:name}}));changed();return {...subject,name};}
  if(globalThis.chrome?.storage?.session)await updateCaseSession(subject.projectId,value=>value.names?.[id]?{...value,names:{...value.names,[id]:name}}:value);
  return writeOne('subjects',{...subject,name,updatedAt:Date.now()});}

// Associations are deliberate user actions. Names never create or merge identities.
export async function associateSubject(id,accountObservationIds,workspace){
  const subject=await readOne('subjects',captureId(id));if(!subject)fail('Subject is no longer available.');
  if(!Array.isArray(accountObservationIds)||accountObservationIds.length>20000)fail('Invalid account associations.');
  for(const id of accountObservationIds){captureId(id);if(!workspace?.items?.some(item=>item.id===id&&item.kind==='account'&&item.projectId===subject.projectId))fail('Associate an account observation from the same project.');}
  return writeOne('subjects',{...subject,accountObservationIds:[...new Set(accountObservationIds)],updatedAt:Date.now()});
}
export async function selectSubject(scanId,subjectId,projectId){captureId(scanId,true);captureId(subjectId,true);if(subjectId){const subject=await readOne('subjects',subjectId);if(!scanId||!subject||projectId&&subject.projectId!==projectId)fail('Choose a subject in this project.');}await writeOne('settings',{key:'subject:'+String(scanId),value:subjectId||null});return subjectId||null;}
export async function selectedSubject(scanId){return (await readOne('settings','subject:'+String(scanId)))?.value||null;}
export async function resolveCaptureDestination(workspace,scanId,subjectId=undefined){
  if(scanId==null)return frozenDestination({});const scan=workspace.scans.find(s=>s.id===scanId),project=workspace.projects.find(p=>p.id===scan?.projectId);if(!scan||!project)fail('Choose an available scan.');
  if(subjectId===undefined)subjectId=await selectedSubject(scanId);const subject=subjectId?await readOne('subjects',subjectId):null;if(subjectId&&(!subject||subject.projectId!==project.id))fail('Choose a subject in this project.');
  return frozenDestination({projectId:project.id,scanId:scan.id,subjectId:subject?.id||null,projectName:project.name,scanName:scan.name,subjectName:subject?.roleId||subject?.name||'Unassigned',roleId:subject?.roleId||null});
}
export async function beginCapture(input){
  const destination=frozenDestination(input.context),source={url:cleanText(input.source?.url||'',4096),title:cleanText(input.source?.title||'',500),tabId:input.source?.tabId??null,windowId:input.source?.windowId??null};
  let url;try{url=new URL(source.url);}catch{fail('Choose an http or https page to capture.');}if(!['http:','https:'].includes(url.protocol)||url.username||url.password)fail('Choose an http or https page without URL credentials.');
  if(!['visible','selection','full-page'].includes(input.mode))fail('Choose a capture mode.');
  const refs={};for(const key of ['accountId','sourceId','searchId'])refs[key]=captureId(input.refs?.[key],true);
  if(destination.subjectId){const subject=await readOne('subjects',destination.subjectId);if(!subject||subject.projectId!==destination.projectId)fail('Choose a subject in this project.');}
  const startedAt=input.startedAt??Date.now();if(!Number.isFinite(startedAt)||startedAt<=0)fail('Invalid capture start time.');
  const recordId=input.id?captureId(input.id):uid();const record={id:recordId,evidenceId:'E-'+recordId.replace(/-/g,'').toUpperCase(),...destination,context:{...destination},source,mode:input.mode,refs,startedAt,startedAtISO:new Date(startedAt).toISOString(),timezone:cleanText(input.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',100),timezoneOffsetMinutes:new Date(startedAt).getTimezoneOffset(),status:'capturing',review:'unreviewed',included:false,savedState:'pending',assetIds:[],bytes:0,limitations:[],export:{status:'not-exported',attempts:0},automaticExport:(await getCaptureSettings()).automaticExport};
  const db=await openCaptureDB(),tx=db.transaction(['captures','settings'],'readwrite'),done=finish(tx);try{if(await request(tx.objectStore('settings').get('closed-capture:'+recordId)))fail('This capture was deleted. Start a new capture.');if(destination.projectId&&(await request(tx.objectStore('settings').get('closed-project:'+destination.projectId))))fail('This project was closed. Choose a current destination.');tx.objectStore('captures').add(record);}catch(e){tx.abort();await done.catch(()=>{});throw e;}await done;return record;
}
function safeMetadata(value){if(value===undefined)return undefined;const raw=JSON.stringify(value);if(raw.length>256000)fail('Capture metadata is too large.');return JSON.parse(raw);}
export async function completeCapture(id,details){
  captureId(id);if(!['complete','partial'].includes(details.status||'complete'))fail('Invalid capture completion state.');
  if(!Array.isArray(details.assets)||!details.assets.length||details.assets.length>128)fail('Capture needs original image bytes.');
  let total=0;const assets=[];
  for(const input of details.assets){if(!(input.blob instanceof Blob)||!input.blob.size||input.blob.size>CAPTURE_LIMITS.assetBytes||!['image/png','image/jpeg','image/webp'].includes(input.blob.type))fail('Unsupported or oversized capture image.');if(!['original','tile','derivative'].includes(input.role||'original'))fail('Invalid capture asset role.');total+=input.blob.size;if(total>CAPTURE_LIMITS.captureBytes)fail('Capture exceeds the 192 MiB capture limit.');const {blob,...metadata}=input;assets.push({...safeMetadata(metadata),id:input.id?captureId(input.id):uid(),captureId:id,role:input.role||'original',mime:blob.type,bytes:blob.size,sha256:await hashBytes(blob),blob});}
  if(!assets.some(a=>a.role==='original'||a.role==='tile'))fail('Preserve at least one original capture image.');
  const estimate=await globalThis.navigator?.storage?.estimate?.();if(estimate?.quota&&estimate.usage+total>estimate.quota*0.95)fail('Browser storage is almost full. Export a backup before another capture.');
  const db=await openCaptureDB(),tx=db.transaction(['captures','assets'],'readwrite'),done=finish(tx),records=tx.objectStore('captures'),images=tx.objectStore('assets');
  let result;
  try{const all=await request(records.getAll()),record=all.find(r=>r.id===id);if(!record||record.status!=='capturing')fail('Capture is no longer active.');if(all.reduce((n,r)=>n+(r.bytes||0),0)+total>CAPTURE_LIMITS.totalBytes)fail('Gather capture storage has reached its 512 MiB limit. Export a backup.');if(all.length>CAPTURE_LIMITS.records)fail('Gather capture record limit reached.');const endedAt=details.endedAt??Date.now();if(!Number.isFinite(endedAt)||endedAt<record.startedAt)fail('Invalid capture end time.');const metadata={};for(const key of ['dimensions','scale','coordinates','limitations','viewport','scroll','crop','technical'])if(details[key]!==undefined)metadata[key]=safeMetadata(details[key]);result={...record,...metadata,endedAt,endedAtISO:new Date(endedAt).toISOString(),status:details.status||'complete',savedState:'saved',assetIds:assets.map(a=>a.id),assets:assets.map(({blob,...a})=>a),bytes:total};for(const a of assets)images.add(a);records.put(result);}catch(error){tx.abort();await done.catch(()=>{});throw error;}await done;changed();return result;
}
export async function failCapture(id,{status='failed',error='',limitations=[]}={}){
  if(!['failed','cancelled','interrupted'].includes(status))fail('Invalid capture failure state.');
  const db=await openCaptureDB(),tx=db.transaction('captures','readwrite'),done=finish(tx),store=tx.objectStore('captures');let record;
  try{record=await request(store.get(captureId(id)));if(!record)fail('Capture is no longer available.');if(record.savedState!=='saved'){record={...record,status,error:cleanText(String(error),2000),limitations:safeMetadata(limitations),endedAt:Date.now(),endedAtISO:new Date().toISOString()};store.put(record);}}catch(e){tx.abort();await done.catch(()=>{});throw e;}await done;changed();return record;
}
export async function getCapture(id){return readOne('captures',captureId(id));}
export async function updateCaptureReview(id,patch){
  const db=await openCaptureDB(),tx=db.transaction('captures','readwrite'),done=finish(tx),store=tx.objectStore('captures');let record;
  try{record=await request(store.get(captureId(id)));if(!record)fail('Capture is unavailable.');if(Object.hasOwn(patch,'review')){if(!['unreviewed','reviewed','follow-up','excluded'].includes(patch.review))fail('Invalid capture review.');record.review=patch.review;}if(Object.hasOwn(patch,'included')){if(typeof patch.included!=='boolean')fail('Invalid capture inclusion.');record.included=patch.included;}store.put(record);}catch(error){tx.abort();await done.catch(()=>{});throw error;}await done;changed();return record;
}
export async function addCaptureDerivative(id,{blob,parentAssetId,expectedShareAssetId,kind='redacted',operations={},annotation=''}){
  if(!(blob instanceof Blob)||blob.type!=='image/png'||!blob.size||blob.size>CAPTURE_LIMITS.assetBytes)fail('Derivative exceeds image limits.');
  if(!['redacted','cropped','annotated'].includes(kind))fail('Invalid derivative kind.');
  const asset={id:uid(),captureId:captureId(id),parentAssetId:captureId(parentAssetId),role:'derivative',kind,mime:blob.type,bytes:blob.size,sha256:await hashBytes(blob),blob,operations:safeMetadata(operations),annotation:cleanText(annotation,20000),createdAt:Date.now()};
  const db=await openCaptureDB(),tx=db.transaction(['captures','assets'],'readwrite'),done=finish(tx);let record;
  try{const records=await request(tx.objectStore('captures').getAll());record=records.find(r=>r.id===id);if(!record||record.savedState!=='saved'||!record.assetIds.includes(parentAssetId))fail('Choose an image belonging to this capture.');if(record.export?.status==='exporting')fail('Finish the folder export before saving image edits.');if(expectedShareAssetId!==undefined&&(record.shareAssetId||null)!==expectedShareAssetId)fail('The selected image changed in another window. Reopen the editor before saving.');if(record.bytes+blob.size>CAPTURE_LIMITS.captureBytes||records.reduce((n,r)=>n+(r.bytes||0),0)+blob.size>CAPTURE_LIMITS.totalBytes)fail('Saving the derivative would exceed Gather’s storage limit.');tx.objectStore('assets').add(asset);record.assetIds.push(asset.id);const {blob:unused,...metadata}=asset;record.assets.push(metadata);record.shareAssetId=asset.id;record.bytes+=asset.bytes;record.export={status:'not-exported',attempts:0};tx.objectStore('captures').put(record);}catch(error){tx.abort();await done.catch(()=>{});throw error;}await done;changed();return record;
}
export async function getAsset(id,{verify=false}={}){const asset=await readOne('assets',captureId(id));if(!asset?.blob)fail('Capture image is missing. Restore it from a Gather backup.');if(verify&&await hashBytes(asset.blob)!==asset.sha256)fail('Capture image integrity check failed. Restore it from a trusted backup.');return asset;}
export async function listCaptures(filter={}){return (await readAll('captures')).filter(row=>['projectId','scanId','subjectId'].every(key=>!Object.hasOwn(filter,key)||row[key]===filter[key])).sort((a,b)=>b.startedAt-a.startedAt);}
// Review a fixed snapshot before deleting. A later edit/export invalidates it.
export function captureDeleteGuard(records){
  if(!Array.isArray(records)||!records.length||records.length>500)fail('Choose between 1 and 500 captures to delete.');
  if(records.some(r=>r.status==='capturing'||r.export?.status==='exporting'))fail('Finish or cancel the capture or folder export before deleting it.');
  const guard=records.map(record=>({id:captureId(record.id),snapshot:JSON.stringify(record)}));
  if(new Set(guard.map(r=>r.id)).size!==guard.length||JSON.stringify(guard).length>32000000)fail('Invalid or oversized capture selection.');return guard;
}
export async function deleteCaptures(guard){
  if(!Array.isArray(guard)||!guard.length||guard.length>500)fail('Invalid capture deletion.');
  const db=await openCaptureDB(),tx=db.transaction(['captures','assets','settings'],'readwrite'),done=finish(tx);let counts={captures:0,images:0,bytes:0};
  try{
    const settings=await request(tx.objectStore('settings').getAll());if(settings.some(s=>s.key==='pending-workspace-restore'||s.key.startsWith('restore-stage:')))fail('Finish the pending backup restore before deleting captures.');
    const records=tx.objectStore('captures'),assets=tx.objectStore('assets');const ids=new Set();
    for(const item of guard){captureId(item.id);if(ids.has(item.id)||typeof item.snapshot!=='string')fail('Invalid capture deletion.');ids.add(item.id);const record=await request(records.get(item.id));if(!record||JSON.stringify(record)!==item.snapshot)fail('A selected capture changed. Review the selection again.');if(record.status==='capturing'||record.export?.status==='exporting')fail('Finish or cancel active work before deleting it.');const keys=await request(assets.index('captureId').getAllKeys(record.id));for(const id of keys)assets.delete(id);records.delete(record.id);tx.objectStore('settings').put({key:'closed-capture:'+record.id,value:true});counts.captures++;counts.images+=keys.length;counts.bytes+=record.bytes||0;}
  }catch(e){tx.abort();await done.catch(()=>{});throw e;}await done;changed();return counts;
}
export async function updateCaptureExport(id,patch,{expectedAttemptId,expectedExport}={}){
  const db=await openCaptureDB(),tx=db.transaction('captures','readwrite'),done=finish(tx),store=tx.objectStore('captures');let record;
  try{
    record=await request(store.get(captureId(id)));if(!record)fail('Capture is no longer available.');
    if(expectedAttemptId!==undefined&&record.export?.attemptId!==expectedAttemptId)fail('Folder export changed. Review the current export status.');
    if(expectedExport!==undefined&&JSON.stringify(record.export)!==JSON.stringify(expectedExport))fail('Folder export changed. Review the current export status.');
    if(patch.status==='exporting'&&record.export?.status==='exporting')fail('Folder export is already running. Wait for it to finish.');
    record.export={...(patch.status==='exporting'?{}:record.export),...safeMetadata(patch),...(patch.status==='exporting'?{attempts:(record.export?.attempts||0)+1}:{})};store.put(record);
  }catch(error){tx.abort();await done.catch(()=>{});throw error;}await done;changed();return record;
}
export async function recoverInterruptedCaptures({olderThan=Date.now()-120000,activeIds=[]}={}){
  const interrupted=[];for(const record of await listCaptures())if(record.status==='capturing'&&record.startedAt<olderThan&&!activeIds.includes(record.id)){interrupted.push(await failCapture(record.id,{status:'interrupted',error:'Capture was interrupted before its image was saved. Capture the page again.'}));}
  // Two downloads may each wait up to 90 seconds. Do not expire a healthy
  // two-file export after only two minutes, or overwrite a newer attempt.
  for(const record of await listCaptures())if(record.export?.status==='exporting'&&(record.export.startedAt||0)<Math.min(olderThan,Date.now()-300000))await updateCaptureExport(record.id,{status:'failed',error:'Folder export was interrupted. Retry export; the saved capture remains in Gather.'},{expectedExport:record.export}).catch(error=>{if(!/^(Folder export changed\.|Capture is no longer available\.)/.test(error.message))throw error;});return interrupted;
}
export async function captureStats(){const records=await listCaptures(),estimate=await globalThis.navigator?.storage?.estimate?.();return {captures:records.length,bytes:records.reduce((n,r)=>n+(r.bytes||0),0),limitBytes:CAPTURE_LIMITS.totalBytes,browserUsage:estimate?.usage??null,browserQuota:estimate?.quota??null,persistent:await globalThis.navigator?.storage?.persisted?.()??false};}
export async function snapshotCaptureBundle(){const db=await openCaptureDB(),tx=db.transaction(['captures','assets','subjects','settings']),done=finish(tx);const [captures,assets,subjects,settings]=await Promise.all(['captures','assets','subjects','settings'].map(key=>request(tx.objectStore(key).getAll())));await done;return {schemaVersion:1,captures,assets,subjects,settings};}
export const readCaptureSetting=key=>readOne('settings',key);
export const writeCaptureSetting=(key,value)=>writeOne('settings',{key,value});
export async function removeCaptureSetting(key){const db=await openCaptureDB(),tx=db.transaction('settings','readwrite'),done=finish(tx);tx.objectStore('settings').delete(key);await done;}
// Call only after validating the complete archive. Assets and their records commit together.
export async function importCaptureBundle(bundle,{idMap=new Map(),pendingRestore=null}={}){
  const current=await snapshotCaptureBundle(),mapping=new Map(idMap),used=new Set([...current.captures,...current.assets,...current.subjects].map(x=>x.id));
  for(const row of [...bundle.captures,...bundle.assets,...bundle.subjects]){if(!mapping.has(row.id)&&used.has(row.id))mapping.set(row.id,uid());used.add(row.id);}
  const remap=value=>mapping.get(value)||value;
  const rewrite=row=>{const value=structuredClone(row);for(const key of ['id','captureId','projectId','scanId','subjectId','parentAssetId','shareAssetId'])if(value[key])value[key]=remap(value[key]);if(value.context)value.context=rewrite(value.context);if(value.refs)for(const key of ['accountId','sourceId','searchId'])if(value.refs[key])value.refs[key]=remap(value.refs[key]);if(value.assetIds)value.assetIds=value.assetIds.map(remap);if(value.assets)value.assets=value.assets.map(rewrite);if(value.export?.assetId)value.export.assetId=remap(value.export.assetId);if(value.accountObservationIds)value.accountObservationIds=value.accountObservationIds.map(remap);return value;};
  const imports={captures:bundle.captures.map(rewrite),assets:bundle.assets.map(rewrite),subjects:bundle.subjects.map(rewrite)};const db=await openCaptureDB(),tx=db.transaction(['captures','assets','subjects','settings'],'readwrite'),done=finish(tx);
  // A backup contains bytes and history, not a running browser download job.
  for(const record of imports.captures)if(record.export?.status==='exporting'){record.export={...record.export,status:'failed',error:'Folder export was interrupted by backup restore. Retry export; the saved capture remains in Gather.'};delete record.export.attemptId;}
  try{const all=await request(tx.objectStore('captures').getAll());if(all.reduce((n,r)=>n+(r.bytes||0),0)+imports.captures.reduce((n,r)=>n+(r.bytes||0),0)>CAPTURE_LIMITS.totalBytes)fail('Restoring this backup would exceed the 512 MiB capture limit.');for(const key of ['captures','assets','subjects'])for(const row of imports[key]){tx.objectStore(key).add(row);if(row.projectId)tx.objectStore('settings').delete('closed-project:'+row.projectId);if(key==='captures')tx.objectStore('settings').delete('closed-capture:'+row.id);}for(const setting of bundle.settings||[]){if(setting.key==='preferences'){if(!current.settings.some(s=>s.key===setting.key))tx.objectStore('settings').put(setting);}else if(setting.key.startsWith('subject:')){const scan=setting.key.slice(8),key='subject:'+remap(scan);if(!current.settings.some(s=>s.key===key))tx.objectStore('settings').put({key,value:setting.value?remap(setting.value):null});}else if(setting.key.startsWith('project-label:')){const key='project-label:'+remap(setting.key.slice(14));if(!current.settings.some(s=>s.key===key))tx.objectStore('settings').put({key,value:setting.value});}}
    if(pendingRestore){tx.objectStore('settings').put({key:'pending-workspace-restore',value:pendingRestore});if(pendingRestore.stageId)tx.objectStore('settings').delete('restore-stage:'+pendingRestore.stageId);}
  }catch(error){tx.abort();await done.catch(()=>{});throw error;}await done;return {captures:imports.captures.length,subjects:imports.subjects.length,idMap:mapping};
}
// Atomic binary deletion plus exact workspace journal. A restart finishes the
// metadata write; it cannot resurrect a half-deleted project.
export async function purgeProjectAssets(projectId,pendingRestore,expectedSignature){
  const db=await openCaptureDB(),tx=db.transaction(['captures','assets','subjects','settings'],'readwrite'),done=finish(tx);let counts;
  try{
    const captures=await request(tx.objectStore('captures').getAll()),subjects=await request(tx.objectStore('subjects').getAll()),settings=await request(tx.objectStore('settings').getAll());
    const assets=await request(tx.objectStore('assets').getAll());if(projectSignature({captures,subjects,assets},projectId)!==expectedSignature)fail('Case changed. Reopen Delete case to review it.');
    const selected=captures.filter(c=>c.projectId===projectId);if(selected.some(c=>c.status==='capturing'||c.export?.status==='exporting'))fail('Finish or cancel this project’s capture or folder export before closing it.');
    if(settings.some(s=>s.key.startsWith('restore-stage:')))fail('Finish the pending backup restore before closing a project.');
    const ids=new Set(selected.map(c=>c.id));let bytes=0,images=0;
    for(const a of assets)if(ids.has(a.captureId)){tx.objectStore('assets').delete(a.id);bytes+=a.bytes;images++;}
    for(const c of selected)tx.objectStore('captures').delete(c.id);
    for(const s of subjects.filter(s=>s.projectId===projectId))tx.objectStore('subjects').delete(s.id);
    const selectedIds=new Set(subjects.filter(s=>s.projectId===projectId).map(s=>s.id));for(const setting of settings)if(setting.key==='project-label:'+projectId||setting.key.startsWith('subject:')&&(selectedIds.has(setting.value)||(pendingRestore.purgeScanIds||[]).some(id=>setting.key==='subject:'+id)))tx.objectStore('settings').delete(setting.key);
    for(const id of pendingRestore.purgeScanIds||[])tx.objectStore('settings').put({key:'closed-scan:'+id,value:true});
    tx.objectStore('settings').put({key:'closed-project:'+projectId,value:true});
    tx.objectStore('settings').put({key:'pending-workspace-restore',value:pendingRestore});counts={captures:selected.length,images,bytes,subjects:selectedIds.size};
  }catch(e){tx.abort();await done.catch(()=>{});throw e;}await done;changed();return counts;
}
