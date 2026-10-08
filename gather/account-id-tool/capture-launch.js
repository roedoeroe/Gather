import {readWorkspace} from './workspace-store.js';
import {resolveTabContext} from './tab-context.js';
import {resolveCaptureDestination,failCapture,getCaptureSettings} from './capture-store.js';
import {pageSelectionOperation} from './capture-selection.js';
import {pageCaptureOperation} from './capture-engine.js';
import {context as validateScope} from './workspace-model.js';

const LOCK='gather.captureLock';
let queue=Promise.resolve();
export function launchCapture(message){
  const work=queue.catch(()=>{}).then(()=>launch(message));queue=work;return work;
}
async function launch(message){
  if(!['visible','selection','full-page'].includes(message.mode))throw new Error('Choose a capture mode.');
  if(message.afterCapture!==undefined&&!['copy','none'].includes(message.afterCapture))throw new Error('Choose a supported capture action.');
  if(message.selectionMethod!==undefined&&!['page','screenshot'].includes(message.selectionMethod))throw new Error('Choose a supported selection method.');
  const existing=(await chrome.storage.session.get(LOCK))[LOCK];
  if(existing){
    let live=false;try{await chrome.windows.get(existing.windowId);live=true;}catch{}
    if(live)throw new Error('Finish or cancel the open capture before starting another.');
    await chrome.storage.session.remove(LOCK);
  }
  const state=await readWorkspace();
  const tab=Number.isInteger(message.tabId)?await chrome.tabs.get(message.tabId):(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0];
  if(!tab?.active||!/^https?:\/\//.test(tab.url||''))throw new Error('Invoke Gather’s toolbar button on the web page you want to capture.');
  if(message.expectedUrl&&tab.url!==message.expectedUrl)throw new Error('The page changed. Reopen Gather on the page you want to capture.');
  let assignment;
  if(message.destination){
    const chosen=validateScope(state,message.destination.scanId);
    if(chosen.projectId!==message.destination.projectId)throw new Error('The displayed capture destination is unavailable. Choose it again.');
    const searchId=message.destination.originatingSearchId||null;
    if(searchId&&!state.searches.some(s=>s.id===searchId&&s.scanId===chosen.scanId&&s.projectId===chosen.projectId))throw new Error('The displayed search context is unavailable. Reassign this tab.');
    assignment={context:{...chosen,originatingSearchId:searchId}};
  }else assignment=await resolveTabContext(state,tab.id);
  const context=await resolveCaptureDestination(state,assignment.context.scanId,message.subjectId);
  const source={tabId:tab.id,windowId:tab.windowId,url:tab.url,title:(tab.title||tab.url).slice(0,500)};
  // Check access without reading page contents. A side panel alone does not grant activeTab.
  try{await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>true});}
  catch{throw new Error('Click Gather’s toolbar button on this page first, then choose Capture. Access expires when the page changes to another site.');}
  const launchId=crypto.randomUUID(),key='gather.captureLaunch.'+launchId;
  const refs={searchId:assignment.context.originatingSearchId||null};
  for(const [field,kind] of [['accountId','account'],['sourceId','source']])if(message[field]){
    const item=state.items.find(x=>x.id===message[field]&&x.kind===kind&&x.projectId===context.projectId);
    if(!item)throw new Error('Choose a saved observation from this project.');refs[field]=item.id;
  }
  await chrome.storage.session.set({[key]:{launchId,context,source,mode:message.mode,selectionMethod:message.selectionMethod||'page',afterCapture:message.afterCapture??((await getCaptureSettings()).automaticCopy?'copy':'none'),refs,startedAt:Date.now()}});
  try{
    const window=await chrome.windows.create({url:chrome.runtime.getURL('capture.html?launch='+launchId),type:'popup',focused:false,width:960,height:760});
    await chrome.storage.session.set({[LOCK]:{launchId,windowId:window.id,source}});
    return {launchId,windowId:window.id,context};
  }catch(error){await chrome.storage.session.remove(key);throw error;}
}
async function finishSession(launchId){const lock=(await chrome.storage.session.get(LOCK))[LOCK];if(lock?.launchId===launchId)await chrome.storage.session.remove(LOCK);return {ok:true};}
export function finishCapture(launchId){
  // A controller can finish while windows.create is still resolving. Release
  // after the queued launch writes its lock, never before that write.
  const work=queue.catch(()=>{}).then(()=>finishSession(launchId));queue=work;return work;
}
export function captureWindowRemoved(windowId){
  const work=queue.catch(()=>{}).then(async()=>{
    const lock=(await chrome.storage.session.get(LOCK))[LOCK];if(lock?.windowId!==windowId)return;
    if(lock.source){
      let tab;try{tab=await chrome.tabs.get(lock.source.tabId);}catch{}
      if(tab?.url===lock.source.url){
        await chrome.scripting.executeScript({target:{tabId:tab.id},func:pageSelectionOperation,args:['cancel',lock.launchId,{message:'Capture window closed.'}]}).catch(()=>{});
        await chrome.scripting.executeScript({target:{tabId:tab.id},func:pageCaptureOperation,args:['restore',lock.launchId,{}]}).catch(()=>{});
      }
    }
    await failCapture(lock.launchId,{status:'cancelled',error:'Capture window closed before its image was saved.'}).catch(()=>{});
    await finishSession(lock.launchId);await chrome.storage.session.remove('gather.captureLaunch.'+lock.launchId);
  });queue=work;return work;
}
