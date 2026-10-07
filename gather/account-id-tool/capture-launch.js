import {readWorkspace} from './workspace-store.js';
import {resolveTabContext} from './tab-context.js';
import {resolveCaptureDestination} from './capture-store.js';
import {context as validateScope} from './workspace-model.js';

const LOCK='gather.captureLock';
let queue=Promise.resolve();
export function launchCapture(message){
  const work=queue.catch(()=>{}).then(()=>launch(message));queue=work;return work;
}
async function launch(message){
  if(!['visible','selection','full-page'].includes(message.mode))throw new Error('Choose a capture mode.');
  const existing=(await chrome.storage.session.get(LOCK))[LOCK];
  if(existing){
    let live=false;try{await chrome.windows.get(existing.windowId);live=true;}catch{}
    if(live)throw new Error('Finish or cancel the open capture before starting another.');
    await chrome.storage.session.remove(LOCK);
  }
  const state=await readWorkspace();
  const tab=Number.isInteger(message.tabId)?await chrome.tabs.get(message.tabId):(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0];
  if(!tab?.active||!/^https?:\/\//.test(tab.url||''))throw new Error('Invoke Gather’s toolbar button on the web page you want to capture.');
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
  await chrome.storage.session.set({[key]:{launchId,context,source,mode:message.mode,refs,startedAt:Date.now()}});
  try{
    const window=await chrome.windows.create({url:chrome.runtime.getURL('capture.html?launch='+launchId),type:'popup',focused:false,width:960,height:760});
    await chrome.storage.session.set({[LOCK]:{launchId,windowId:window.id}});
    return {launchId,windowId:window.id,context};
  }catch(error){await chrome.storage.session.remove(key);throw error;}
}
export async function finishCapture(launchId){const lock=(await chrome.storage.session.get(LOCK))[LOCK];if(lock?.launchId===launchId)await chrome.storage.session.remove(LOCK);return {ok:true};}
