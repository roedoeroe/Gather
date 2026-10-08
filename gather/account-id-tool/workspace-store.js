import {emptyState, reduceWorkspace, validateWorkspace, mergeWorkspace, WORKSPACE_KEY, SCHEMA, destinationLabel, webUrl, context, searchUrl} from './workspace-model.js';
import {validateBackup} from './backup-validation.js';
export {validateBackup} from './backup-validation.js';
import {bindTabContext, detachTabContext, resolveTabContext, removeTabContext, removeProjectTabContexts} from './tab-context.js';
// MV3 service workers forbid dynamic import. Every worker dependency must load
// statically, including recovery, image restore and case closure paths.
import {readCaptureSetting,removeCaptureSetting,listSubjects,selectedSubject,snapshotCaptureBundle,importCaptureBundle,purgeProjectAssets,hashBytes} from './capture-store.js';
import {validateCaptureBundle} from './capture-backup.js';
import {forgetSearchText,forgetSearchDrafts} from './search-privacy.js';
import {imageSearchUrl} from './image-search.js';
import {prepareCase,resolveQuery} from './case-model.js';
import {withoutProject,projectSignature} from './case-close.js';
import {withHistoryLock,clearHistoryRecords,historySummary,HISTORY_EPOCH_KEY,scrubLookupArchive} from './batches.js';
let queue=Promise.resolve();
let privacyReady;
async function removeLegacySearchData(){
  if(privacyReady)return privacyReady;
  privacyReady=(async()=>{
    const all=await chrome.storage.local.get(null),writes={};
    if(all[WORKSPACE_KEY]&&all[WORKSPACE_KEY].schemaVersion!==SCHEMA)throw new Error('This workspace needs a different Gather version. Your data has not been changed.');
    if(all[WORKSPACE_KEY]){const clean=forgetSearchText(all[WORKSPACE_KEY]);if(clean!==all[WORKSPACE_KEY])writes[WORKSPACE_KEY]=clean;}
    for(const [key,value] of Object.entries(forgetSearchDrafts(all)))if(key.startsWith('gather.archive.')&&JSON.stringify(value)!==JSON.stringify(all[key]))writes[key]=value;
    if(Object.keys(writes).length)await chrome.storage.local.set(writes);
    for(const area of [chrome.storage.local,chrome.storage.session]){
      const values=await area.get(null),keys=Object.keys(values).filter(key=>key.startsWith('gather.search-draft.'));
      if(keys.length)await area.remove(keys);
    }
  })();try{await privacyReady;}catch(error){privacyReady=null;throw error;}
}
export async function readWorkspace(){await recoverBinaryRestore();await removeLegacySearchData();const state=(await chrome.storage.local.get(WORKSPACE_KEY))[WORKSPACE_KEY];if(state&&state.schemaVersion!==SCHEMA)throw new Error('This workspace needs a different Gather version. Your data has not been changed.');return state||emptyState();}
let recovering=null;
async function recoverBinaryRestore(){
  if(!globalThis.indexedDB)return;
  if(recovering)return recovering;
  recovering=(async()=>{
    const pending=(await readCaptureSetting('pending-workspace-restore'))?.value;if(!pending)return;
    const all=await chrome.storage.local.get(null),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    const keys=Object.keys(pending.writes);
    const finish=async()=>{if(pending.purgeProjectId){await chrome.storage.session.remove('gather.case.'+pending.purgeProjectId);for(const id of pending.purgeScanIds||[])await chrome.storage.session.remove('gather.search-draft.'+id);await removeProjectTabContexts(pending.purgeProjectId);}await removeCaptureSetting('pending-workspace-restore');};
    if(keys.every(key=>same(all[key],pending.writes[key]))){await finish();return;}
    if(!keys.every(key=>same(all[key],pending.previous[key])))throw new Error('An interrupted image restore conflicts with newer workspace edits. Your data and images are retained. Keep your backup and use a separate Gather installation to restore it.');
    await chrome.storage.local.set(pending.writes);await finish();
  })();try{await recovering;}finally{recovering=null;}
}
// All workspace writes run in this service worker queue. A failed write does not poison later actions.
export function dispatch(action){
  if(action.type.startsWith('search.'))return Promise.reject(new Error('Searches open without a saved log. Launch a new search.'));
  const operation=queue.catch(()=>{}).then(async()=>{
    const previous=await readWorkspace();if(['research.coverage','research.associate'].includes(action.type)&&action.subjectId){const projectId=action.type==='research.coverage'?previous.scans.find(s=>s.id===action.scanId)?.projectId:previous.items.find(i=>i.id===action.itemId)?.projectId;if(!(await listSubjects(projectId)).some(s=>s.id===action.subjectId))throw new Error('Choose a role in this project.');}
    const {state,result}=reduceWorkspace(previous,action);
    await chrome.storage.local.set({[WORKSPACE_KEY]:state});return {state,result};
  });queue=operation;return operation;
}
export async function openSearch(action){
  const state=await readWorkspace(),scope=context(state,action.scanId);
  // Build the URL in memory only. Neither the query nor a launch event is stored.
  const url=searchUrl(action.provider,action.query);
  await launchSearchTab(scope,url);
  return {state:await readWorkspace(),result:{opened:true}};
}
export async function openImageSearch(action){
  const state=await readWorkspace(),scope=context(state,action.scanId);
  await launchSearchTab(scope,imageSearchUrl(action.provider));
  return {state:await readWorkspace(),result:{opened:true}};
}
export async function reopenSearch(){throw new Error('Search text is no longer retained. Enter a new search.');}
async function launchSearchTab(scope,url){
  // Only filing context is kept in session storage, never a query or URL.
  // Bind before navigating so browser-related result tabs inherit this scan.
  let tab;
  try {
    tab=await chrome.tabs.create({url:'about:blank',active:false});
    await bindTabContext(tab.id,scope,'search');
    await chrome.tabs.update(tab.id,{url,active:true});
  } catch(error) {
    if(tab){await removeTabContext(tab.id).catch(()=>{});await chrome.tabs.remove(tab.id).catch(()=>{});}
    throw new Error('The search could not open. Your text is still here; try again.');
  }
}
export async function capturePage(scanId,tabId,options={}){
  // Snapshot the destination and tab supplied at invocation; never query a later active tab here.
  const current=await readWorkspace();let destination;
  if(options.destination){
    const chosen=context(current,options.destination.scanId),searchId=options.destination.originatingSearchId||null;
    if(chosen.projectId!==options.destination.projectId||searchId&&!current.searches.some(s=>s.id===searchId&&s.scanId===chosen.scanId&&s.projectId===chosen.projectId))throw new Error('The displayed destination is unavailable. Choose a scan again.');
    destination={context:{...chosen,originatingSearchId:searchId},label:destinationLabel(current,chosen.scanId)};
  }else destination=await resolveTabContext(current,tabId,scanId);
  let filing={};if(globalThis.indexedDB&&destination.context.projectId){const subjectId=options.subjectId===undefined?await selectedSubject(destination.context.scanId):options.subjectId,subject=(await listSubjects(destination.context.projectId)).find(s=>s.id===subjectId);if(subjectId&&!subject)throw new Error('Choose a subject in this project.');if(subject)filing={filingSubjectId:subject.id,filingRoleId:subject.roleId};}
  const tab=await chrome.tabs.get(tabId);
  if(options.expectedUrl&&tab.url!==options.expectedUrl)throw new Error('The page changed. Reopen Gather before saving it.');
  if(!tab.url)throw new Error('Use the Gather toolbar button on the page, or right-click to save it.');
  webUrl(tab.url);
  const response=await dispatch({type:'item.save',kind:'source',scanId:destination.context.scanId,originatingSearchId:destination.context.originatingSearchId,url:tab.url,title:(tab.title||tab.url).slice(0,500),excerpt:'',metadataOnly:true,...filing});
  Object.assign(response.result,{scanId:destination.context.scanId,destinationLabel:destination.label});return response;
}
export async function backup(){
  await queue.catch(()=>{});
  await readWorkspace();
  const all=await chrome.storage.local.get(null),legacy={};
  for(const [key,value] of Object.entries(all))if(key.startsWith('gather.')&&key!==WORKSPACE_KEY&&key!==HISTORY_EPOCH_KEY&&value!==null)legacy[key]=value;
  return {format:'gather-backup',schemaVersion:1,createdAt:Date.now(),workspace:all[WORKSPACE_KEY]||emptyState(),legacy};
}
export function importBackup(value,stageId=null){
  validateBackup(value);
  const operation=queue.catch(()=>{}).then(()=>withHistoryLock(async()=>{
    await readWorkspace();
    const all=await chrome.storage.local.get(null),idMap=new Map();
    if(stageId){const bundle=(await readCaptureSetting('restore-stage:'+stageId))?.value?.bundle,current=await snapshotCaptureBundle();for(const subject of bundle?.subjects||[])if(current.subjects.some(s=>s.id===subject.id)||all[WORKSPACE_KEY]?.projects?.length)idMap.set(subject.id,crypto.randomUUID());}
    const state=mergeWorkspace(all[WORKSPACE_KEY]||emptyState(),forgetSearchText(value.workspace),{idMap}),writes={[WORKSPACE_KEY]:state},conflicts={};
    for(const [key,original] of Object.entries(forgetSearchDrafts(value.legacy))){
      if(key===HISTORY_EPOCH_KEY)continue;
      const v=structuredClone(original);
      if(key.startsWith('gather.batch.')&&v){delete v.historyEpoch;if(all[HISTORY_EPOCH_KEY])v.historyEpoch=all[HISTORY_EPOCH_KEY];}
      if(key.startsWith('gather.batch.')&&v.lookupContext){for(const field of ['scanId','projectId','originatingSearchId'])if(idMap.has(v.lookupContext[field]))v.lookupContext[field]=idMap.get(v.lookupContext[field]);}
      if(all[key]==null)writes[key]=v;
      else if(JSON.stringify(all[key])!==JSON.stringify(v)){
        if(key.startsWith('gather.batch.')){const id=crypto.randomUUID();writes['gather.batch.'+id]={...v,id};}
        else conflicts[key]=v;
      }
    }
    // Keep conflicting legacy drafts/preferences exactly as imported, without overwriting live settings.
    if(Object.keys(conflicts).length)writes['gather.archive.'+crypto.randomUUID()]=conflicts;
    if(stageId){
      const staged=(await readCaptureSetting('restore-stage:'+stageId))?.value;if(!staged)throw new Error('The staged image backup is unavailable. Select the backup file again.');
      if(JSON.stringify(staged.workspaceBackup)!==JSON.stringify(value))throw new Error('The staged backup changed. Select it again.');
      await validateCaptureBundle(staged.bundle,value.workspace);
      const previous=Object.fromEntries(Object.keys(writes).filter(key=>all[key]!==undefined).map(key=>[key,all[key]]));
      await importCaptureBundle(staged.bundle,{idMap,pendingRestore:{stageId,writes,previous}});
      // The journal and all binaries commit atomically. A restart finishes this
      // exact workspace write once; it never imports a second copy.
      await recoverBinaryRestore();
    }else await chrome.storage.local.set(writes);
    return {state,result:{imported:true,archivedSettings:Object.keys(conflicts).length,idMap:Object.fromEntries(idMap)}};
  }));queue=operation;return operation;
}
export function createCase(input){
  const operation=queue.catch(()=>{}).then(async()=>{
    const previous=await readWorkspace(),prepared=prepareCase(previous,input);
    validateWorkspace(prepared.state);
    await chrome.storage.session.set({['gather.case.'+prepared.result.id]:prepared.session});
    await importCaptureBundle({captures:[],assets:[],subjects:prepared.subjects,settings:prepared.settings},{pendingRestore:{writes:{[WORKSPACE_KEY]:prepared.state},previous:(await chrome.storage.local.get(WORKSPACE_KEY))}});
    await recoverBinaryRestore();return {state:prepared.state,result:prepared.result};
  });queue=operation;return operation;
}
export function closeProject(projectId,guard={}){
  const operation=queue.catch(()=>{}).then(()=>withHistoryLock(async()=>{
    const previous=await readWorkspace();if(previous.revision!==guard.revision)throw new Error('Workspace changed. Reopen Delete case to review the current data.');const next=withoutProject(previous,projectId),all=await chrome.storage.local.get(null),writes={[WORKSPACE_KEY]:next};
    // Null tombstones make interrupted removal idempotent; restoreBatch ignores them.
    const purgeScanIds=previous.scans.filter(s=>s.projectId===projectId).map(s=>s.id);for(const id of purgeScanIds)if(all['gather.search-draft.'+id]!==undefined)writes['gather.search-draft.'+id]=null;
    const removedBatches=[];for(const [key,value] of Object.entries(all))if(key.startsWith('gather.batch.')&&value?.lookupContext?.projectId===projectId){writes[key]=null;removedBatches.push(value.id);}
    if(removedBatches.includes(all['gather.quick']?.batchId))writes['gather.quick']={input:'',batchId:null};
    const archivedBatches=new Set(removedBatches);for(const [key,value] of Object.entries(all))if(key.startsWith('gather.archive.'))scrubLookupArchive(value,(k,v)=>{if(k.startsWith('gather.batch.')&&v?.lookupContext?.projectId===projectId)archivedBatches.add(v.id);return false;});
    for(const [key,value] of Object.entries(all))if(key.startsWith('gather.archive.')){const cleaned=scrubLookupArchive(value,(k,v)=>k.startsWith('gather.batch.')&&v?.lookupContext?.projectId===projectId||purgeScanIds.some(id=>k==='gather.search-draft.'+id)||k==='gather.quick'&&archivedBatches.has(v?.batchId));writes[key]=Object.keys(cleaned||{}).length?cleaned:null;}
    const bundle=await snapshotCaptureBundle(),deletedItems=new Set(previous.items.filter(i=>i.projectId===projectId).map(i=>i.id));
    if(bundle.subjects.some(s=>s.projectId!==projectId&&s.accountObservationIds.some(id=>deletedItems.has(id)))||bundle.captures.some(c=>c.projectId!==projectId&&[c.refs?.accountId,c.refs?.sourceId].some(id=>deletedItems.has(id))))throw new Error('Another project references this project’s findings. Review those explicit links before closing.');
    const signature=projectSignature(bundle,projectId);if(await hashBytes(new Blob([signature]))!==guard.digest)throw new Error('Case images or roles changed. Reopen Delete case to review the current data.');
    const lock=(await chrome.storage.session.get('gather.captureLock'))['gather.captureLock'];if(lock){const seed=(await chrome.storage.session.get('gather.captureLaunch.'+lock.launchId))['gather.captureLaunch.'+lock.launchId];if(seed?.context.projectId===projectId)throw new Error('Finish or cancel the open capture before closing this project.');}
    const counts=await purgeProjectAssets(projectId,{writes,purgeProjectId:projectId,purgeScanIds,previous:Object.fromEntries(Object.keys(writes).filter(k=>all[k]!==undefined).map(k=>[k,all[k]]))},signature);await recoverBinaryRestore();
    await chrome.storage.session.remove('gather.case.'+projectId);const sessions=await chrome.storage.session.get(null);for(const [key,value]of Object.entries(sessions))if(key.startsWith('gather.captureLaunch.')&&value.context?.projectId===projectId)await chrome.storage.session.remove(key);
    if(removedBatches.includes(sessions.quickRun?.batchId))await chrome.storage.session.remove('quickRun');
    await removeProjectTabContexts(projectId);
    return {state:next,result:{...counts,batches:removedBatches.length,remainingArchives:Object.keys(all).filter(k=>k.startsWith('gather.archive.')).length}};
  }));queue=operation;return operation;
}
export async function launchQueued(id){
  const state=await readWorkspace(),row=state.research?.queue.find(q=>q.id===id);if(!row)throw new Error('Queued search is unavailable.');
  const session=(await chrome.storage.session.get('gather.case.'+row.projectId))['gather.case.'+row.projectId]||{};
  const query=resolveQuery(state,row,session);
  await openSearch({scanId:row.scanId,provider:row.provider,query});
  await dispatch({type:'research.queue',id,status:'launched'});if(!state.research.coverage.some(c=>c.scanId===row.scanId&&c.subjectId===row.subjectId&&c.family===row.provider))await dispatch({type:'research.coverage',scanId:row.scanId,subjectId:row.subjectId,family:row.provider==='bing'?'google':row.provider,status:'Search launched'});return {state:await readWorkspace()};
}
// Old open pages may still send this message after an update. Never retain it.
export async function saveSearchDraft(){return {ok:true,retained:false};}
export function clearLookups(){
  const operation=queue.catch(()=>{}).then(async()=>{await recoverBinaryRestore();return withHistoryLock(async()=>{const result=await clearHistoryRecords();await chrome.storage.session.remove('quickRun');return {result};});});queue=operation;return operation;
}
export async function handleWorkspace(message){
  switch(message.type){
    case 'workspace.searchDraft': return saveSearchDraft(message.scanId,message.value);
    case 'workspace.historySummary': return historySummary();
    case 'workspace.clearLookups': return clearLookups();
    case 'workspace.closeProject': return closeProject(message.projectId,message.guard);
    case 'workspace.caseCreate': return createCase(message.input);
    case 'workspace.launchQueued': return launchQueued(message.id);
    case 'workspace.state': await queue.catch(()=>{});return {state:await readWorkspace()};
    case 'workspace.action': return dispatch(message.action);
    case 'workspace.search': return openSearch(message.action);
    case 'workspace.imageSearch': return openImageSearch(message.action);
    case 'workspace.reopenSearch': return reopenSearch(message.id);
    case 'workspace.capture': return capturePage(message.scanId,message.tabId,{subjectId:message.subjectId,destination:message.destination,expectedUrl:message.expectedUrl});
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
      const staged=(await readCaptureSetting('restore-stage:'+message.stageId))?.value;
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
