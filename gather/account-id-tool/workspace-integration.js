import {captureContext,cleanLookupContext,saveDestination} from './lookup-context.js';
import {request,act} from './workspace-client.js';
import {destinationLabel,WORKSPACE_KEY} from './workspace-model.js';
let state=null,windowId=null,pageTabId=null,pageContext=null,pageRequest=0;
const buttons=new Set();
let initialState;
const select=document.getElementById('gatherDestination');
const pageSave=document.getElementById('saveCurrentSource');
const status=text=>{const el=document.getElementById('workspaceStatus');if(el)el.textContent=text;};
export async function captureLookupContext(){
  if(!globalThis.chrome?.runtime?.id)return undefined;
  await initialState;
  if(pageSave){const result=await refreshPageContext();if(result?.context)return {...result.context,startedAt:Date.now()};}
  return captureContext(state);
}
function update(next){
  if(state&&next.revision<state.revision)return;state=next;
  if(select){select.replaceChildren(new Option('Inbox',''));for(const scan of state.scans)select.append(new Option(destinationLabel(state,scan.id),scan.id));select.value=state.activeScanId||'';select.disabled=false;}
  for(const b of buttons){if(!b.isConnected){buttons.delete(b);continue;}if(b.dataset.pending!=='true')b.textContent='Save to '+destinationLabel(state,saveDestination(state,b.lookupOrigin));b.disabled=b.dataset.pending==='true'||b.dataset.unfinished==='true';}
  if(pageSave)refreshPageContext().catch(error=>status(error.message));
}
function showPageContext(result){
  pageContext=result;pageTabId=result.tabId;
  const label=destinationLabel(state,result.context.scanId);
  pageSave.textContent='Save page to '+label;pageSave.disabled=false;
  document.getElementById('pageDestination').textContent=result.assigned?'This tab keeps '+label+' when the default changes.':'This tab uses the default destination: '+label+'.';
  document.getElementById('pageContextHelp').textContent='Tab assignment is research context, not proof of how a source was found. Detach returns this tab to the default destination.';
  const target=document.getElementById('pageScan');target.replaceChildren(new Option('Inbox',''));for(const scan of state.scans)target.append(new Option(destinationLabel(state,scan.id),scan.id));target.value=result.context.scanId||'';
  document.getElementById('detachPage').disabled=!result.assigned;
}
async function refreshPageContext(){
  const serial=++pageRequest,[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id)throw new Error('Open a web page to save it.');
  const result=await request('workspace.tabContext',{tabId:tab.id});
  if(serial===pageRequest&&state)showPageContext(result);
  return result;
}
export function saveAccountButton(entry,notify,origin){
  const b=document.createElement('button');b.lookupOrigin=cleanLookupContext(origin);b.type='button';b.className='text-button gather-save-account';b.disabled=!state||['loading','ready'].includes(entry.status);b.textContent=state?'Save to '+destinationLabel(state,saveDestination(state,b.lookupOrigin)):'Save to workspace';
  b.dataset.unfinished=String(['loading','ready'].includes(entry.status));
  b.addEventListener('click',async()=>{
    if(!state)return;const scanId=saveDestination(state,b.lookupOrigin),label=destinationLabel(state,scanId),snapshot=structuredClone(entry);b.disabled=true;b.dataset.pending='true';b.textContent='Saving to '+label+'…';
    try{const r=await act({type:'item.save',kind:'account',scanId,entry:snapshot,originatingSearchId:b.lookupOrigin?.originatingSearchId});notify((r.result.duplicate?'Already saved in ':'Saved to ')+label,true);}
    catch(error){notify(error.message,false);}finally{delete b.dataset.pending;b.disabled=false;b.textContent='Save to '+destinationLabel(state,saveDestination(state,b.lookupOrigin));}
  });buttons.add(b);return b;
}
async function init(){
  if(!globalThis.chrome?.runtime?.id)return;
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[WORKSPACE_KEY]?.newValue)update(changes[WORKSPACE_KEY].newValue);if(pageSave&&area==='session'&&changes['gather.tabContexts.v1'])refreshPageContext().catch(error=>status(error.message));});
  initialState=request('workspace.state').then(r=>update(r.state));await initialState;windowId=(await chrome.windows.getCurrent()).id;
  if(select)select.onchange=async()=>{try{const r=await act({type:'context.select',scanId:select.value||null});update(r.state);}catch(error){status(error.message);}};
  const open=document.getElementById('openWorkspace');if(open)open.onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('workspace.html')});
  const panel=document.getElementById('openPanel');if(panel)panel.onclick=()=>{chrome.sidePanel.open({windowId}).then(()=>window.close()).catch(error=>status(error.message));};
  if(pageSave){
    pageSave.onclick=async()=>{
      const tabId=pageTabId,scanId=pageContext?.context.scanId??null;pageSave.disabled=true;
      try{const response=await request('workspace.capture',{scanId,tabId});status('Saved page to '+(response.result?.destinationLabel||destinationLabel(state,response.result?.scanId??scanId)));}
      catch(error){status(error.message);}finally{pageSave.disabled=false;}
    };
    document.getElementById('assignPage').onclick=async()=>{try{showPageContext(await request('workspace.assignTab',{tabId:pageTabId,scanId:document.getElementById('pageScan').value||null}));status('Tab destination assigned.');}catch(error){status(error.message);}};
    document.getElementById('detachPage').onclick=async()=>{try{showPageContext(await request('workspace.detachTab',{tabId:pageTabId}));status('Tab detached. It now uses the default destination.');}catch(error){status(error.message);}};
    chrome.tabs.onActivated.addListener(()=>refreshPageContext().catch(error=>status(error.message)));
    chrome.tabs.onUpdated.addListener(id=>{if(id===pageTabId)refreshPageContext().catch(error=>status(error.message));});
  }
}
init().catch(error=>status(error.message));
