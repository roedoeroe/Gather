import {request,act} from './workspace-client.js';
import {destinationLabel,WORKSPACE_KEY} from './workspace-model.js';
let state=null,windowId=null;
const buttons=new Set();
const select=document.getElementById('gatherDestination');
function update(next){
  if(state&&next.revision<state.revision)return;state=next;
  if(select){select.replaceChildren(new Option('Inbox',''));for(const scan of state.scans)select.append(new Option(destinationLabel(state,scan.id),scan.id));select.value=state.activeScanId||'';select.disabled=false;}
  for(const b of buttons){if(!b.isConnected){buttons.delete(b);continue;}if(b.dataset.pending!=='true')b.textContent='Save to '+destinationLabel(state,state.activeScanId);b.disabled=b.dataset.pending==='true'||b.dataset.unfinished==='true';}
}
export function saveAccountButton(entry,notify){
  const b=document.createElement('button');b.type='button';b.className='text-button gather-save-account';b.disabled=!state||['loading','ready'].includes(entry.status);b.textContent=state?'Save to '+destinationLabel(state,state.activeScanId):'Save to workspace';
  b.dataset.unfinished=String(['loading','ready'].includes(entry.status));
  b.addEventListener('click',async()=>{
    if(!state)return;const scanId=state.activeScanId,label=destinationLabel(state,scanId),snapshot=structuredClone(entry);b.disabled=true;b.dataset.pending='true';b.textContent='Saving to '+label+'…';
    try{const r=await act({type:'item.save',kind:'account',scanId,entry:snapshot});notify((r.result.duplicate?'Already saved in ':'Saved to ')+label,true);}
    catch(error){notify(error.message,false);}finally{delete b.dataset.pending;b.disabled=false;b.textContent='Save to '+destinationLabel(state,state.activeScanId);}
  });buttons.add(b);return b;
}
async function init(){
  if(!globalThis.chrome?.runtime?.id)return;
  const r=await request('workspace.state');update(r.state);windowId=(await chrome.windows.getCurrent()).id;
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[WORKSPACE_KEY]?.newValue)update(changes[WORKSPACE_KEY].newValue);});
  if(select)select.onchange=async()=>{try{const r=await act({type:'context.select',scanId:select.value||null});update(r.state);}catch(error){document.getElementById('workspaceStatus').textContent=error.message;}};
  const open=document.getElementById('openWorkspace');if(open)open.onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('workspace.html')});
  const panel=document.getElementById('openPanel');if(panel)panel.onclick=()=>{chrome.sidePanel.open({windowId}).then(()=>window.close()).catch(error=>document.getElementById('workspaceStatus').textContent=error.message);};
  const save=document.getElementById('saveCurrentSource');if(save)save.onclick=async()=>{
    const scanId=state.activeScanId,label=destinationLabel(state,scanId);save.disabled=true;
    try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});await request('workspace.capture',{scanId,tabId:tab.id});document.getElementById('workspaceStatus').textContent='Saved page to '+label;}
    catch(error){document.getElementById('workspaceStatus').textContent=error.message;}finally{save.disabled=false;}
  };
}
init().catch(error=>{const el=document.getElementById('workspaceStatus');if(el)el.textContent=error.message;});
