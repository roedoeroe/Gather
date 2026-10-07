import {emptyState, reduceWorkspace, validateWorkspace, mergeWorkspace, WORKSPACE_KEY, SCHEMA, destinationLabel, webUrl} from './workspace-model.js';
import {restoreBatch} from './batches.js';
let queue=Promise.resolve();
export async function readWorkspace(){const state=(await chrome.storage.local.get(WORKSPACE_KEY))[WORKSPACE_KEY];if(state&&state.schemaVersion!==SCHEMA)throw new Error('This workspace needs a different Gather version. Your data has not been changed.');return state||emptyState();}
// All workspace writes run in this service worker queue. A failed write does not poison later actions.
export function dispatch(action){
  const operation=queue.catch(()=>{}).then(async()=>{
    const {state,result}=reduceWorkspace(await readWorkspace(),action);
    await chrome.storage.local.set({[WORKSPACE_KEY]:state});return {state,result};
  });queue=operation;return operation;
}
export async function openSearch(action){
  const saved=await dispatch({...action,type:'search.prepare'}),id=saved.result.id;
  try {await chrome.tabs.create({url:saved.result.url});}
  catch(error){await dispatch({type:'search.status',id,status:'failed'});throw new Error('Search was saved but could not open. Retry from Search history.');}
  // The search carries its original context even if another window switches scans while opening.
  return dispatch({type:'search.status',id,status:'opened'});
}
export async function reopenSearch(id){
  const s=await readWorkspace(),search=s.searches.find(x=>x.id===id);if(!search)throw new Error('Search no longer available.');
  await chrome.tabs.create({url:search.url});return dispatch({type:'search.status',id,status:'opened'});
}
export async function capturePage(scanId,tabId){
  // Snapshot the destination and tab supplied at invocation; never query a later active tab here.
  const tab=await chrome.tabs.get(tabId);
  if(!tab.url)throw new Error('Use the Gather toolbar button on the page, or right-click to save it.');
  webUrl(tab.url);
  return dispatch({type:'item.save',kind:'source',scanId,url:tab.url,title:(tab.title||tab.url).slice(0,500),excerpt:''});
}
export async function backup(){
  await queue.catch(()=>{});
  const all=await chrome.storage.local.get(null),legacy={};
  for(const [key,value] of Object.entries(all))if(key.startsWith('gather.')&&key!==WORKSPACE_KEY)legacy[key]=value;
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
export function importBackup(value){
  validateBackup(value);
  const operation=queue.catch(()=>{}).then(async()=>{
    const all=await chrome.storage.local.get(null),state=mergeWorkspace(all[WORKSPACE_KEY]||emptyState(),value.workspace),writes={[WORKSPACE_KEY]:state},conflicts={};
    for(const [key,v] of Object.entries(value.legacy)){
      if(all[key]===undefined)writes[key]=v;
      else if(JSON.stringify(all[key])!==JSON.stringify(v)){
        if(key.startsWith('gather.batch.')){const id=crypto.randomUUID();writes['gather.batch.'+id]={...v,id};}
        else conflicts[key]=v;
      }
    }
    // Keep conflicting legacy drafts/preferences exactly as imported, without overwriting live settings.
    if(Object.keys(conflicts).length)writes['gather.archive.'+crypto.randomUUID()]=conflicts;
    await chrome.storage.local.set(writes);return {state,result:{imported:true,archivedSettings:Object.keys(conflicts).length}};
  });queue=operation;return operation;
}
export async function handleWorkspace(message){
  switch(message.type){
    case 'workspace.state': await queue.catch(()=>{});return {state:await readWorkspace()};
    case 'workspace.action': return dispatch(message.action);
    case 'workspace.search': return openSearch(message.action);
    case 'workspace.reopenSearch': return reopenSearch(message.id);
    case 'workspace.capture': return capturePage(message.scanId,message.tabId);
    case 'workspace.backup': return {backup:await backup()};
    case 'workspace.import': return importBackup(message.backup);
    default:throw new Error('Unknown workspace request.');
  }
}
export async function updateSaveMenu(){
  const s=await readWorkspace();
  await chrome.contextMenus.update('gather-save',{title:'Save to Gather · '+destinationLabel(s,s.activeScanId)});
}
