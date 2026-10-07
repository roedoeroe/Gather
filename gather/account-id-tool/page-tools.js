import {request} from './workspace-client.js';
import {WORKSPACE_KEY,destinationLabel} from './workspace-model.js';
import {listSubjects,selectedSubject,selectSubject,getCaptureSettings} from './capture-store.js';
import {workspaceLink} from './workspace-links.js';

const host=document.getElementById('pageTools');
const $=id=>document.getElementById(id);
let state,snapshot,ready,serial=0,timer,busy=false,windowId,subjectAvailable=true;
const captureButtons=()=>[...host.querySelectorAll('[data-capture-mode]')];
function status(text,error=false){$('pageToolsStatus').textContent=text;$('pageToolsStatus').classList.toggle('error',error);}
function controls(){
  const available=!!snapshot&&(!snapshot.context.scanId||state.scans.some(s=>s.id===snapshot.context.scanId&&s.projectId===snapshot.context.projectId));
  const web=available&&subjectAvailable&&/^https?:\/\//.test(snapshot.url||'');
  for(const b of captureButtons())b.disabled=busy||!web;
  $('captureScan').disabled=busy||!state;
  $('toolbarSubject').disabled=busy||!snapshot?.context.projectId;
  $('savePageLink').disabled=busy||!web;
  $('useDefaultScan').disabled=busy||!snapshot;
  $('viewCaptures').disabled=busy||!available;
  $('openDashboard').disabled=busy||!available;
}
async function refresh({reset=false}={}){
  const ticket=++serial;
  const [response,tabs]=await Promise.all([request('workspace.state'),chrome.tabs.query({active:true,windowId})]);
  if(ticket!==serial)return;
  state=response.state;const tab=tabs[0];
  if(!tab){snapshot=null;controls();status('Open a web page, then click Gather.',true);return;}
  if(reset||!snapshot||snapshot.tabId!==tab.id){
    const result=await request('workspace.tabContext',{tabId:tab.id});
    const subjectId=await selectedSubject(result.context.scanId);
    if(ticket!==serial)return;
    snapshot={tabId:tab.id,url:tab.url,context:{...result.context},subjectId:subjectId||null};
  }
  // Background destination changes never replace the destination already displayed.
  const frozen=snapshot;
  const [subjects,settings]=await Promise.all([listSubjects(frozen.context.projectId),getCaptureSettings(frozen.context.projectId)]);
  if(ticket!==serial)return;
  $('captureScan').replaceChildren(new Option('Inbox',''),...state.scans.map(s=>new Option(destinationLabel(state,s.id),s.id)));
  const valid=!frozen.context.scanId||state.scans.some(s=>s.id===frozen.context.scanId&&s.projectId===frozen.context.projectId);
  if(!valid){$('captureScan').append(new Option('Scan unavailable — choose another',frozen.context.scanId));status('This scan is no longer available. Choose where to save.',true);}
  $('captureScan').value=frozen.context.scanId||'';
  $('captureSubjectRow').hidden=!frozen.context.projectId;
  $('captureSubjectLabel').textContent=settings.subjectLabel;
  $('toolbarSubject').replaceChildren(new Option('Unassigned',''),...subjects.map(s=>new Option(s.name===s.roleId?s.roleId:s.name+' · '+s.roleId,s.id)));
  subjectAvailable=!frozen.subjectId||subjects.some(s=>s.id===frozen.subjectId);
  if(!subjectAvailable){$('toolbarSubject').append(new Option('Subject unavailable — choose another',frozen.subjectId));status('Choose an available subject or Unassigned before capturing.',true);}
  $('toolbarSubject').value=frozen.subjectId||'';
  const hostName=(()=>{try{return new URL(frozen.url).hostname;}catch{return '';}})();
  $('toolbarContext').textContent=/^https?:\/\//.test(frozen.url||'')?'This page → '+destinationLabel(state,frozen.context.scanId)+(hostName?' · '+hostName:''):'Open a web page to take a screenshot.';
  $('useDefaultScan').textContent='Use workspace default ('+destinationLabel(state,state.activeScanId)+')';
  controls();
}
function run(operation){return async()=>{if(busy)return;busy=true;controls();status('');try{await operation();}catch(error){status(error.message,true);}finally{busy=false;controls();}};}
function frozen(){if(!snapshot)throw new Error('Wait for the page destination to load.');return structuredClone(snapshot);}
export async function pageToolsContext(){await ready;const chosen=frozen();return {...chosen.context,startedAt:Date.now()};}
async function init(){
  if(!globalThis.chrome?.runtime?.id)return;
  windowId=(await chrome.windows.getCurrent()).id;
  $('captureScan').onchange=run(async()=>{
    const chosen=frozen(),scanId=$('captureScan').value||null;
    try{await request('workspace.assignTab',{tabId:chosen.tabId,scanId});await refresh({reset:true});}
    catch(error){$('captureScan').value=chosen.context.scanId||'';throw error;}
  });
  $('toolbarSubject').onchange=run(async()=>{
    const chosen=frozen(),subjectId=$('toolbarSubject').value||null;
    try{await selectSubject(chosen.context.scanId,subjectId,chosen.context.projectId);snapshot.subjectId=subjectId;subjectAvailable=true;}
    catch(error){$('toolbarSubject').value=chosen.subjectId||'';throw error;}
  });
  for(const b of captureButtons())b.onclick=run(async()=>{
    const chosen=frozen();status('Starting screenshot…');
    await request('capture.start',{mode:b.dataset.captureMode,tabId:chosen.tabId,expectedUrl:chosen.url,destination:chosen.context,subjectId:chosen.subjectId});
    window.close();
  });
  $('savePageLink').onclick=run(async()=>{
    const chosen=frozen(),r=await request('workspace.capture',{tabId:chosen.tabId,expectedUrl:chosen.url,scanId:chosen.context.scanId,destination:chosen.context,subjectId:chosen.subjectId});
    status('Page link saved to '+r.result.destinationLabel+'.');
  });
  $('useDefaultScan').onclick=run(async()=>{await request('workspace.detachTab',{tabId:frozen().tabId});await refresh({reset:true});});
  $('viewCaptures').onclick=run(()=>chrome.tabs.create({url:workspaceLink(frozen().context.scanId)}));
  $('openDashboard').onclick=run(()=>chrome.tabs.create({url:workspaceLink(frozen().context.scanId,'research')}));
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>refresh().catch(e=>status(e.message,true)),50);};
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[WORKSPACE_KEY]||area==='session'&&Object.keys(changes).some(k=>k.startsWith('gather.case.')))schedule();});
  chrome.tabs.onActivated.addListener(schedule);
  chrome.tabs.onUpdated.addListener((id,change)=>{if(id===snapshot?.tabId&&(change.url||change.status))schedule();});
  if(globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.onmessage=schedule;window.addEventListener('pagehide',()=>channel.close());}
  await refresh();
}
if(host)ready=init().catch(error=>status(error.message,true));
