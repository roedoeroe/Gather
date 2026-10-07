import {handleWorkspace, readWorkspace, dispatch, updateSaveMenu} from './workspace-store.js';
import {trackTemporary, untrackTemporary, tabRemoved} from './tab-ownership.js';
import {saveBatch,saveLookupDraft} from './batches.js';
import {handleQuick} from './quick-worker.js';
import {patchPreferences} from './preferences.js';
import {TAB_CONTEXT_KEY, inheritTabContext, removeTabContext, replaceTabContext, pruneTabContexts, resetTabContexts, resolveTabContext} from './tab-context.js';
import {launchCapture,finishCapture} from './capture-launch.js';

async function openFull(batchId) {
  const base = chrome.runtime.getURL('index.html');
  const url = base + (/^[\w-]{1,80}$/.test(batchId || '') ? '?batch='+encodeURIComponent(batchId) : '');
  const tabs = await chrome.tabs.query({url:base+'*'});
  const match = tabs.find(tab => tab.url === url);
  if (match) {
    await chrome.tabs.update(match.id,{active:true});
    await chrome.windows.update(match.windowId,{focused:true});
  } else await chrome.tabs.create({url});
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return;
  const page = sender.url?.split(/[?#]/)[0];
  const full = page === chrome.runtime.getURL('index.html');
  const workspace = page === chrome.runtime.getURL('workspace.html');
  if(page===chrome.runtime.getURL('evidence.html')&&message?.type==='workspace.state'){handleWorkspace(message).then(reply,error=>reply({error:error.message}));return true;}
  const capture = page === chrome.runtime.getURL('capture.html');
  if((workspace||page===chrome.runtime.getURL('popup.html'))&&message?.type==='capture.start'){
    launchCapture(message).then(reply,error=>reply({error:error.message}));return true;
  }
  if(capture&&message?.type==='capture.finished'){finishCapture(message.launchId).then(reply,error=>reply({error:error.message}));return true;}
  if ((full || page === chrome.runtime.getURL('popup.html') || workspace) && message?.type?.startsWith('workspace.')) {
    const work=['workspace.clearLookups','workspace.closeProject'].includes(message.type)?handleQuick({type:'quick.privacy',operation:()=>handleWorkspace(message),projectId:message.projectId}):handleWorkspace(message);
    work.then(reply,error=>reply({error:error.message})); return true;
  }
  if(full&&message?.type==='history.flush'){saveBatch(message.batch).then(()=>reply({ok:true}),error=>reply({error:error.message}));return true;}
  if(full&&message?.type==='history.draft'){saveLookupDraft(message.key,message.value,message.epoch).then(()=>reply({ok:true}),error=>reply({error:error.message}));return true;}
  const quick = page === chrome.runtime.getURL('popup.html');
  if((full||quick)&&message?.type==='savePreferences'&&message.patch&&typeof message.patch==='object'){
    patchPreferences(message.patch).then(()=>reply({ok:true}),error=>reply({error:error.message}));return true;
  }
  if (quick && message?.type === 'quick.open') {
    openFull(message.batchId).then(()=>reply({ok:true}),error=>reply({error:error.message})); return true;
  }
  if (quick && message?.type?.startsWith('quick.') && message.type!=='quick.privacy') {
    handleQuick(message).then(reply,error=>reply({error:error.message})); return true;
  }
  if (!full || !sender.tab || !['trackTab','untrackTab'].includes(message?.type) || !Number.isInteger(message.tabId)) return;
  const action = message.type === 'trackTab' ? trackTemporary : untrackTemporary;
  action(message.tabId,sender.tab.id).then(()=>reply({ok:true}),()=>reply({ok:false}));return true;
});
chrome.tabs.onRemoved.addListener(id=>{tabRemoved(id).catch(()=>{});removeTabContext(id).catch(()=>{});});
chrome.tabs.onCreated?.addListener(tab=>{inheritTabContext(tab).catch(()=>{});});
chrome.tabs.onReplaced?.addListener((added,removed)=>{replaceTabContext(added,removed).catch(()=>{});});
chrome.tabs.onActivated?.addListener(()=>{updateSaveMenu().catch(()=>{});});
chrome.runtime.onStartup?.addListener(()=>{resetTabContexts().catch(()=>{});});
if(chrome.tabs.query)pruneTabContexts().catch(()=>{});

chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.removeAll(()=>{
    chrome.contextMenus.create({id:'gather-save',title:'Save to Gather · Inbox',contexts:['page','link','selection'],documentUrlPatterns:['http://*/*','https://*/*']},()=>{if(!chrome.runtime.lastError)updateSaveMenu().catch(()=>{});});
    chrome.contextMenus.create({id:'gather-case-selection',title:'Case Start from selected text…',contexts:['selection'],documentUrlPatterns:['http://*/*','https://*/*']});
    chrome.contextMenus.create({id:'gather-screenshot',title:'Capture visible page in Gather',contexts:['page'],documentUrlPatterns:['http://*/*','https://*/*']});
  });
  chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'}).catch(()=>{});
});
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='local'&&changes['gather.workspace.v1'])updateSaveMenu().catch(()=>{});
  if(area==='session'&&changes[TAB_CONTEXT_KEY])updateSaveMenu().catch(()=>{});
});
chrome.contextMenus.onClicked.addListener((info,tab)=>{
  if(info.menuItemId==='gather-case-selection'){chrome.storage.session.set({'gather.caseSelection':{text:String(info.selectionText||'').slice(0,100000)}}).then(()=>chrome.tabs.create({url:chrome.runtime.getURL('workspace.html')})).catch(()=>{});return;}
  if(info.menuItemId==='gather-screenshot'){launchCapture({mode:'visible',tabId:tab.id}).catch(async error=>{await chrome.storage.session.set({gatherCaptureError:error.message});chrome.action.setBadgeText({text:'!'}).catch(()=>{});});return;}
  if(info.menuItemId!=='gather-save')return;
  // Enqueue the context read immediately, before any tab work.
  const destination=readWorkspace().then(state=>resolveTabContext(state,tab.id));
  chrome.sidePanel.open({windowId:tab.windowId}).catch(()=>{});
  destination.then(({context:c})=>dispatch({type:'item.save',kind:'source',scanId:c.scanId,originatingSearchId:c.originatingSearchId,url:info.linkUrl||info.pageUrl,title:(info.linkUrl||tab.title||info.pageUrl).slice(0,500),originUrl:info.pageUrl,excerpt:info.selectionText||''})).catch(async error=>{
    await chrome.storage.session.set({gatherCaptureError:error.message});
    chrome.action.setBadgeText({text:'!'}).catch(()=>{});
  });
});
