import {emptyState, reduceWorkspace, validateWorkspace, mergeWorkspace, WORKSPACE_KEY, SCHEMA, destinationLabel, webUrl, context, searchUrl} from './workspace-model.js';
import {restoreBatch} from './batches.js';
import {bindTabContext, detachTabContext, resolveTabContext, removeTabContext} from './tab-context.js';
let queue=Promise.resolve();
export async function readWorkspace(){await recoverBinaryRestore();const state=(await chrome.storage.local.get(WORKSPACE_KEY))[WORKSPACE_KEY];if(state&&state.schemaVersion!==SCHEMA)throw new Error('This workspace needs a different Gather version. Your data has not been changed.');return state||emptyState();}
let recovering=null;
async function recoverBinaryRestore(){
  if(!globalThis.indexedDB)return;
  if(recovering)return recovering;
  recovering=(async()=>{
    const {readCaptureSetting,removeCaptureSetting}=await import('./capture-store.js');
    const pending=(await readCaptureSetting('pending-workspace-restore'))?.value;if(!pending)return;
    const all=await chrome.storage.local.get(null),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    const keys=Object.keys(pending.writes);
    const finish=async()=>{if(pending.purgeProjectId){await chrome.storage.session.remove('gather.case.'+pending.purgeProjectId);for(const id of pending.purgeScanIds||[])await chrome.storage.session.remove('gather.search-draft.'+id);await (await import('./tab-context.js')).removeProjectTabContexts(pending.purgeProjectId);}await removeCaptureSetting('pending-workspace-restore');};
    if(keys.every(key=>same(all[key],pending.writes[key]))){await finish();return;}
    if(!keys.every(key=>same(all[key],pending.previous[key])))throw new Error('An interrupted image restore conflicts with newer workspace edits. Your data and images are retained. Keep your backup and use a separate Gather installation to restore it.');
    await chrome.storage.local.set(pending.writes);await finish();
  })();try{await recovering;}finally{recovering=null;}
}
// All workspace writes run in this service worker queue. A failed write does not poison later actions.
export function dispatch(action){
  const operation=queue.catch(()=>{}).then(async()=>{
    const previous=await readWorkspace();if(['research.coverage','research.associate'].includes(action.type)&&action.subjectId){const {listSubjects}=await import('./capture-store.js');const projectId=action.type==='research.coverage'?previous.scans.find(s=>s.id===action.scanId)?.projectId:previous.items.find(i=>i.id===action.itemId)?.projectId;if(!(await listSubjects(projectId)).some(s=>s.id===action.subjectId))throw new Error('Choose a role in this project.');}
    const {state,result}=reduceWorkspace(previous,action);
    await chrome.storage.local.set({[WORKSPACE_KEY]:state});return {state,result};
  });queue=operation;return operation;
}
export async function openSearch(action){
  const before=await readWorkspace(),projectId=before.scans.find(s=>s.id===action.scanId)?.projectId;
  if(!action.queueId&&before.projects.find(p=>p.id===projectId)?.mode==='ephemeral'){
    if(typeof action.query!=='string'||!action.query.trim()||action.query.length>2000)throw new Error('Enter a search under 2000 characters.');
    const prepared=await dispatch({type:'research.manual',scanId:action.scanId,provider:action.provider}),{updateCaseSession}=await import('./case-session.js');await updateCaseSession(projectId,session=>({...session,values:{...session.values,[prepared.result.seedId]:action.query}}));return launchQueued(prepared.result.id);
  }
  const saved=await dispatch({...action,type:'search.prepare'}),id=saved.result.id;
  const search=saved.state.searches.find(x=>x.id===id);
  try {await launchSearchTab(search);}
  catch(error){await dispatch({type:'search.status',id,status:'failed'});throw new Error('Search was saved but could not open. Retry from Search history.');}
  // The search carries its original context even if another window switches scans while opening.
  const response=await dispatch({type:'search.status',id,status:'opened'});response.result.id=id;return response;
}
export async function reopenSearch(id){
  const s=await readWorkspace(),search=s.searches.find(x=>x.id===id);if(!search)throw new Error('Search no longer available.');
  await launchSearchTab(search);return dispatch({type:'search.status',id,status:'opened'});
}
async function launchSearchTab(search){
  // Bind a blank inactive tab before navigating. Its result tabs cannot outrun
  // the assignment write, and no URL/timing heuristic is needed.
  let url=search.url;
  if(search.queueId){const state=await readWorkspace(),row=state.research?.queue.find(q=>q.id===search.queueId),{resolveQuery}=await import('./case-model.js');if(!row)throw new Error('Search context unavailable.');const session=(await chrome.storage.session.get('gather.case.'+row.projectId))['gather.case.'+row.projectId]||{};url=searchUrl(search.provider,resolveQuery(state,{...row,tokenizedQuery:search.query},session));}
  const tab=await chrome.tabs.create({url:'about:blank',active:false});
  try {
    await bindTabContext(tab.id,{scanId:search.scanId,projectId:search.projectId,originatingSearchId:search.id},'search');
    await chrome.tabs.update(tab.id,{url,active:true});
  } catch(error) {
    await removeTabContext(tab.id).catch(()=>{});
    await chrome.tabs.remove(tab.id).catch(()=>{});
    throw error;
  }
}
export async function capturePage(scanId,tabId,options={}){
  // Snapshot the destination and tab supplied at invocation; never query a later active tab here.
  const destination=await resolveTabContext(await readWorkspace(),tabId,scanId);
  let filing={};if(globalThis.indexedDB&&destination.context.projectId){const {selectedSubject,listSubjects}=await import('./capture-store.js');const subjectId=options.subjectId===undefined?await selectedSubject(destination.context.scanId):options.subjectId,subject=(await listSubjects(destination.context.projectId)).find(s=>s.id===subjectId);if(subjectId&&!subject)throw new Error('Choose a subject in this project.');if(subject)filing={filingSubjectId:subject.id,filingRoleId:subject.roleId};}
  const tab=await chrome.tabs.get(tabId);
  if(!tab.url)throw new Error('Use the Gather toolbar button on the page, or right-click to save it.');
  webUrl(tab.url);
  const response=await dispatch({type:'item.save',kind:'source',scanId:destination.context.scanId,originatingSearchId:destination.context.originatingSearchId,url:tab.url,title:(tab.title||tab.url).slice(0,500),excerpt:'',metadataOnly:true,...filing});
  Object.assign(response.result,{scanId:destination.context.scanId,destinationLabel:destination.label});return response;
}
export async function backup(){
  await queue.catch(()=>{});
  await recoverBinaryRestore();
  const all=await chrome.storage.local.get(null),legacy={};
  for(const [key,value] of Object.entries(all))if(key.startsWith('gather.')&&key!==WORKSPACE_KEY&&value!==null)legacy[key]=value;
  return {format:'gather-backup',schemaVersion:1,createdAt:Date.now(),workspace:all[WORKSPACE_KEY]||emptyState(),legacy};
}
export function validateBackup(value){
  if(new TextEncoder().encode(JSON.stringify(value)).length>32*1024*1024)throw new Error('Backup exceeds 32 MB.');
  if(value?.format!=='gather-backup'||value.schemaVersion!==1||!value.legacy||Array.isArray(value.legacy)||typeof value.legacy!=='object')throw new Error('Choose a Gather backup, not a report.');
  validateWorkspace(value.workspace);
  for(const [key,v] of Object.entries(value.legacy)){
    if(!key.startsWith('gather.')||key===WORKSPACE_KEY||key.length>150)throw new Error('Invalid backup storage key.');
    if(key.startsWith('gather.batch.')&&!restoreBatch(v))throw new Error('Backup contains an invalid batch.');
  }
  return value;
}
export function importBackup(value,stageId=null){
  validateBackup(value);
  const operation=queue.catch(()=>{}).then(async()=>{
    await recoverBinaryRestore();
    const all=await chrome.storage.local.get(null),idMap=new Map();
    if(stageId){const {readCaptureSetting,snapshotCaptureBundle}=await import('./capture-store.js'),bundle=(await readCaptureSetting('restore-stage:'+stageId))?.value?.bundle,current=await snapshotCaptureBundle();for(const subject of bundle?.subjects||[])if(current.subjects.some(s=>s.id===subject.id)||all[WORKSPACE_KEY]?.projects?.length)idMap.set(subject.id,crypto.randomUUID());}
    const state=mergeWorkspace(all[WORKSPACE_KEY]||emptyState(),value.workspace,{idMap}),writes={[WORKSPACE_KEY]:state},conflicts={};
    for(const [key,original] of Object.entries(value.legacy)){
      const v=structuredClone(original);
      if(key.startsWith('gather.batch.')&&v.lookupContext){for(const field of ['scanId','projectId','originatingSearchId'])if(idMap.has(v.lookupContext[field]))v.lookupContext[field]=idMap.get(v.lookupContext[field]);}
      if(all[key]===undefined)writes[key]=v;
      else if(JSON.stringify(all[key])!==JSON.stringify(v)){
        if(key.startsWith('gather.batch.')){const id=crypto.randomUUID();writes['gather.batch.'+id]={...v,id};}
        else conflicts[key]=v;
      }
    }
    // Keep conflicting legacy drafts/preferences exactly as imported, without overwriting live settings.
    if(Object.keys(conflicts).length)writes['gather.archive.'+crypto.randomUUID()]=conflicts;
    if(stageId){
      const {readCaptureSetting,importCaptureBundle}=await import('./capture-store.js');
      const staged=(await readCaptureSetting('restore-stage:'+stageId))?.value;if(!staged)throw new Error('The staged image backup is unavailable. Select the backup file again.');
      if(JSON.stringify(staged.workspaceBackup)!==JSON.stringify(value))throw new Error('The staged backup changed. Select it again.');
      const {validateCaptureBundle}=await import('./capture-backup.js');await validateCaptureBundle(staged.bundle,value.workspace);
      const previous=Object.fromEntries(Object.keys(writes).filter(key=>all[key]!==undefined).map(key=>[key,all[key]]));
      await importCaptureBundle(staged.bundle,{idMap,pendingRestore:{stageId,writes,previous}});
      // The journal and all binaries commit atomically. A restart finishes this
      // exact workspace write once; it never imports a second copy.
      await recoverBinaryRestore();
    }else await chrome.storage.local.set(writes);
    return {state,result:{imported:true,archivedSettings:Object.keys(conflicts).length,idMap:Object.fromEntries(idMap)}};
  });queue=operation;return operation;
}
export function createCase(input){
  const operation=queue.catch(()=>{}).then(async()=>{
    const previous=await readWorkspace(),{prepareCase}=await import('./case-model.js'),prepared=prepareCase(previous,input);
    validateWorkspace(prepared.state);
    const {importCaptureBundle}=await import('./capture-store.js');
    await chrome.storage.session.set({['gather.case.'+prepared.result.id]:prepared.session});
    await importCaptureBundle({captures:[],assets:[],subjects:prepared.subjects,settings:prepared.settings},{pendingRestore:{writes:{[WORKSPACE_KEY]:prepared.state},previous:(await chrome.storage.local.get(WORKSPACE_KEY))}});
    await recoverBinaryRestore();return {state:prepared.state,result:prepared.result};
  });queue=operation;return operation;
}
export function closeProject(projectId,guard={}){
  const operation=queue.catch(()=>{}).then(async()=>{
    const previous=await readWorkspace();if(previous.revision!==guard.revision)throw new Error('Workspace changed after the backup. Export again before removing this project.');const {withoutProject,projectSignature}=await import('./case-close.js'),next=withoutProject(previous,projectId),all=await chrome.storage.local.get(null),writes={[WORKSPACE_KEY]:next};
    // Null tombstones make interrupted removal idempotent; restoreBatch ignores them.
    const purgeScanIds=previous.scans.filter(s=>s.projectId===projectId).map(s=>s.id);for(const id of purgeScanIds)if(all['gather.search-draft.'+id]!==undefined)writes['gather.search-draft.'+id]=null;
    const removedBatches=[];for(const [key,value] of Object.entries(all))if(key.startsWith('gather.batch.')&&value?.lookupContext?.projectId===projectId){writes[key]=null;removedBatches.push(value.id);}
    if(removedBatches.includes(all['gather.quick']?.batchId))writes['gather.quick']={input:'',batchId:null};
    const {snapshotCaptureBundle,purgeProjectAssets}=await import('./capture-store.js'),bundle=await snapshotCaptureBundle(),deletedItems=new Set(previous.items.filter(i=>i.projectId===projectId).map(i=>i.id));
    if(bundle.subjects.some(s=>s.projectId!==projectId&&s.accountObservationIds.some(id=>deletedItems.has(id)))||bundle.captures.some(c=>c.projectId!==projectId&&[c.refs?.accountId,c.refs?.sourceId].some(id=>deletedItems.has(id))))throw new Error('Another project references this project’s findings. Review those explicit links before closing.');
    const signature=projectSignature(bundle,projectId),{hashBytes}=await import('./capture-store.js');if(await hashBytes(new Blob([signature]))!==guard.digest)throw new Error('Project images or roles changed after the backup. Export again before removing.');
    const lock=(await chrome.storage.session.get('gather.captureLock'))['gather.captureLock'];if(lock){const seed=(await chrome.storage.session.get('gather.captureLaunch.'+lock.launchId))['gather.captureLaunch.'+lock.launchId];if(seed?.context.projectId===projectId)throw new Error('Finish or cancel the open capture before closing this project.');}
    const counts=await purgeProjectAssets(projectId,{writes,purgeProjectId:projectId,purgeScanIds,previous:Object.fromEntries(Object.keys(writes).filter(k=>all[k]!==undefined).map(k=>[k,all[k]]))},signature);await recoverBinaryRestore();
    await chrome.storage.session.remove('gather.case.'+projectId);const sessions=await chrome.storage.session.get(null);for(const [key,value]of Object.entries(sessions))if(key.startsWith('gather.captureLaunch.')&&value.context?.projectId===projectId)await chrome.storage.session.remove(key);
    const {removeProjectTabContexts}=await import('./tab-context.js');await removeProjectTabContexts(projectId);
    return {state:next,result:{...counts,batches:removedBatches.length,remainingArchives:Object.keys(all).filter(k=>k.startsWith('gather.archive.')).length}};
  });queue=operation;return operation;
}
export async function launchQueued(id){
  const state=await readWorkspace(),row=state.research?.queue.find(q=>q.id===id);if(!row)throw new Error('Queued search is unavailable.');
  const {resolveQuery}=await import('./case-model.js'),session=(await chrome.storage.session.get('gather.case.'+row.projectId))['gather.case.'+row.projectId]||{};
  resolveQuery(state,row,session); // Fail before logging when ephemeral values are absent.
  const result=await openSearch({scanId:row.scanId,provider:row.provider,query:row.tokenizedQuery,queueId:row.id});
  await dispatch({type:'research.queue',id,status:'launched',searchId:result.result.id});if(!state.research.coverage.some(c=>c.scanId===row.scanId&&c.subjectId===row.subjectId&&c.family===row.provider))await dispatch({type:'research.coverage',scanId:row.scanId,subjectId:row.subjectId,family:row.provider==='bing'?'google':row.provider,status:'Search launched'});return {state:await readWorkspace()};
}
export async function handleWorkspace(message){
  switch(message.type){
    case 'workspace.closeProject': return closeProject(message.projectId,message.guard);
    case 'workspace.caseCreate': return createCase(message.input);
    case 'workspace.launchQueued': return launchQueued(message.id);
    case 'workspace.state': await queue.catch(()=>{});return {state:await readWorkspace()};
    case 'workspace.action': return dispatch(message.action);
    case 'workspace.search': return openSearch(message.action);
    case 'workspace.reopenSearch': return reopenSearch(message.id);
    case 'workspace.capture': return capturePage(message.scanId,message.tabId,{subjectId:message.subjectId});
    case 'workspace.tabContext': return resolveTabContext(await readWorkspace(),message.tabId);
    case 'workspace.assignTab': {
      const state=await readWorkspace();await chrome.tabs.get(message.tabId);
      await bindTabContext(message.tabId,context(state,message.scanId));
      return resolveTabContext(state,message.tabId);
    }
    case 'workspace.detachTab': await chrome.tabs.get(message.tabId);await detachTabContext(message.tabId);return resolveTabContext(await readWorkspace(),message.tabId);
    case 'workspace.backup': return {backup:await backup()};
    case 'workspace.import': return importBackup(message.backup);
    case 'workspace.importImages': {
      if(typeof message.stageId!=='string'||! /^[\w-]{1,100}$/.test(message.stageId))throw new Error('Invalid image backup request.');
      const {readCaptureSetting}=await import('./capture-store.js');const staged=(await readCaptureSetting('restore-stage:'+message.stageId))?.value;
      if(!staged)throw new Error('Select the image backup again.');return importBackup(staged.workspaceBackup,message.stageId);
    }
    default:throw new Error('Unknown workspace request.');
  }
}
export async function updateSaveMenu(){
  const s=await readWorkspace();
  const [tab]=chrome.tabs.query?await chrome.tabs.query({active:true,lastFocusedWindow:true}):[];
  const destination=tab?.id!==undefined?await resolveTabContext(s,tab.id):{label:destinationLabel(s,s.activeScanId)};
  await chrome.contextMenus.update('gather-save',{title:'Save to Gather · '+destination.label});
}
