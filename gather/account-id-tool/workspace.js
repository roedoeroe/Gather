import {getCapture} from './capture-store.js';
import {retainFocus} from './workspace-focus.js';
import {initNavigation,selectSection,setCaseAvailable} from './workspace-navigation.js';
import {accountState} from './account-state.js';
import {scanCaptureReport,captureReportMarkdown} from './capture-report.js';
import {createFullBackup,readFullBackup,stageFullRestore,MAX_BACKUP_BYTES} from './capture-backup.js';
import {destinationLabel, PROVIDERS, report, reportMarkdown, itemChecks, WORKSPACE_KEY, MAX_BYTES} from './workspace-model.js';
import {validateBackup} from './workspace-store.js';
import {request,act,downloadFile} from './workspace-client.js';
const $=id=>document.getElementById(id);
const isPanel=new URLSearchParams(location.search).has('panel');
let tabContext=null,tabId=null,tabRefresh=0;
const currentScan=()=>isPanel&&tabContext?tabContext.context.scanId:state.activeScanId;
document.body.classList.toggle('panel',isPanel);
const initialSection=location.hash.slice(1);initNavigation();
let state=null,view='items',draftQueue=Promise.resolve(),editorSave=null,lastScan,windowId=null,undoId=null;
const viewQueries=new Map();let filterScanId;
const formatTime=t=>new Date(t).toLocaleString();
const label=id=>destinationLabel(state,id);
const rows=key=>state[key].filter(x=>x.scanId===currentScan());
const make=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el;};
function message(content,error=false){$('message').textContent=content;$('message').className='message'+(error?' error':'');$('message').hidden=false;}
async function safely(fn){try{return await fn();}catch(error){message(error.message,true);return null;}}
function update(next){if(!state||next.revision>=state.revision){const changed=lastScan!==next.activeScanId;state=next;lastScan=next.activeScanId;render();if(changed)restoreDraft(currentScan());}}
async function action(payload){const response=await act(payload);update(response.state);if(response.result.undoId){undoId=response.result.undoId;$('undoLabel').textContent='Change saved. You can undo it.';$('undoNotice').hidden=false;}return response.result;}
function button(title,fn,cls=''){const b=make('button',cls,title);b.type='button';b.addEventListener('click',()=>safely(fn));return b;}
function empty(target,title,description){const el=make('div','empty');el.append(make('strong','',title),make('span','',description));target.append(el);}
function matches(row){const q=$('localSearch').value.trim().toLowerCase();return !q||JSON.stringify(row).toLowerCase().includes(q);}
function setView(next,{clearFilter=false}={}){viewQueries.set(view,$('localSearch').value);view=isPanel?'tasks':next;if(clearFilter)viewQueries.delete(view);$('localSearch').value=viewQueries.get(view)||'';renderViews();}
function render(){
  const restoreFocus=retainFocus(document.querySelector('main'));const restoreLibraryFocus=retainFocus($('projects'));
  const scan=state.scans.find(x=>x.id===currentScan()),project=state.projects.find(x=>x.id===scan?.projectId);
  $('projectName').textContent=project?.name||'YOUR LIBRARY';$('scanName').textContent=scan?.name||'Inbox';
  $('scanHelp').textContent=scan?'Research saved to this scan.':'Save findings here. A case is optional.';
  $('saveDestination').textContent='In '+label(currentScan());$('savePage').textContent='Save page to '+label(currentScan());if(isPanel)renderTabContext();$('newScan').hidden=!scan;$('renameContext').hidden=!scan;
  setCaseAvailable(Boolean(project));
  $('libraryToggle').textContent='Library · '+(project?.name||'Inbox')+' ▾';
  $('inboxCount').textContent=state.items.filter(x=>x.scanId===null).length;$('inboxCount').hidden=Number($('inboxCount').textContent)===0;$('inbox').classList.toggle('selected',state.activeScanId===null);
  $('projects').replaceChildren();
  for(const p of state.projects){$('projects').append(make('div','project-label',p.name));for(const s of state.scans.filter(s=>s.projectId===p.id))$('projects').append(Object.assign(button(s.name,()=>selectScan(s.id),'scan'+(state.activeScanId===s.id?' selected':'')),{id:'scan-'+s.id}));}
  if(!state.projects.length)$('projects').append(make('p','quiet','No cases yet. Use New case when you need one.'));
  $('reviewCount').textContent=rows('items').filter(x=>['unreviewed','follow-up'].includes(x.review)).length;
  $('taskCount').textContent=rows('tasks').filter(x=>x.status==='open').length;
  $('searchCount').textContent=rows('searches').filter(x=>x.status!=='reviewed').length;
  $('reviewShortcut').hidden=Number($('reviewCount').textContent)===0;
  for(const id of ['taskCount','searchCount'])$(id).hidden=Number($(id).textContent)===0;
  const used=new TextEncoder().encode(JSON.stringify(state)).length;
  $('storageUsage').textContent='Workspace: '+(used/1024).toFixed(0)+' KB / '+(MAX_BYTES/1024/1024)+' MB'+(used>MAX_BYTES*.8?' · Approaching capacity. Back up your work.':'');
  renderViews();restoreFocus();restoreLibraryFocus();
}
function renderViews(){
  if(isPanel)view='tasks';
  if(filterScanId!==currentScan()){filterScanId=currentScan();viewQueries.clear();$('localSearch').value='';$('filter').value='all';}
  for(const name of ['items','tasks','searches','activity'])$(name).hidden=name!==view;
  for(const tab of document.querySelectorAll('.tabs [data-view]')){tab.classList.toggle('selected',(tab.dataset.view===view||(tab.dataset.view==='searches'&&view==='activity')));tab.setAttribute('aria-current',(tab.dataset.view===view||(tab.dataset.view==='searches'&&view==='activity'))?'page':'false');}
  $('historyKindLabel').hidden=!['searches','activity'].includes(view);
  if(['searches','activity'].includes(view))$('historyKind').value=view;
  $('filter').hidden=view!=='items';$('reviewShortcut').hidden=view!=='items'||Number($('reviewCount').textContent)===0;
  $('localSearch').placeholder={items:'Find saved items…',tasks:'Find tasks…',searches:'Find searches…',activity:'Find activity…'}[view];
  ({items:renderItems,tasks:renderTasks,searches:renderSearches,activity:renderActivity}[view])();
}
function cardMeta(card,kind,date){const meta=make('div','meta');meta.append(make('span','badge',kind),make('span','',formatTime(date)));card.append(meta);}
function addLink(card,url,title=url){const a=make('a','url',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
function renderItems(){
  const target=$('items');target.replaceChildren();const filter=$('filter').value;
  const items=rows('items').filter(matches).filter(x=>filter==='all'||filter===x.kind||(filter==='attention'&&['unreviewed','follow-up'].includes(x.review))||(filter==='excluded'&&x.review==='excluded')).slice().reverse();
  if(!items.length){empty(target,rows('items').length?'No matching findings':'No findings yet',rows('items').length?'Try another search or filter.':'Save a page with Gather, or add a link or note here.');return;}
  for(const item of items){
    const card=make('article','card');card.dataset.itemId=item.id;card.dataset.focusKey=item.id;cardMeta(card,item.kind,item.createdAt);card.append(make('h3','',item.title));if(item.evidenceId){const details=make('details','finding-details');details.append(make('summary','','Record details'),make('p','micro',item.evidenceId));card.append(details);}if(item.metadataOnly)card.append(make('p','micro','Metadata only · no image'));if(item.filingRoleId)card.append(make('p','micro','Filed to '+item.filingRoleId));
    if(item.url)addLink(card,item.url);
    if(item.kind==='account'){
      const entry=item.entry;card.append(make('div','account-id',accountState(entry)==='GONE'?'Gone':entry.id||'ID unresolved'),make('p','quiet',item.extraction));
      card.append(make('p','micro',(entry.verifiedAt?'Checked '+formatTime(entry.verifiedAt):'No checked page observation')+(entry.method?' · '+entry.method:'')));
      if(entry.notes?.length)card.append(make('p','','Original account notes: '+entry.notes.join(' ')));
      if(entry.message)card.append(make('p','quiet',entry.message));
      if(item.entityId){const history=state.items.filter(x=>x.entityId===item.entityId);card.append(button(history.length+' observation'+(history.length===1?'':'s'),()=>showHistory(item),'subtle'));}
    }
    if(item.excerpt){card.append(make('p','',item.excerpt));if(item.originUrl!==item.url)addLink(card,item.originUrl,'Selected on '+item.originUrl);}
    if(item.body)card.append(make('p','',item.body));
    if(item.annotation)card.append(make('p','','Analyst note: '+item.annotation));
    const checks=itemChecks(state,item);
    if(checks.length){const details=make('details','mechanical-checks'),summary=make('summary','',checks.length+' mechanical check'+(checks.length===1?'':'s'));details.append(summary);for(const check of checks)details.append(make('p','',check.message));card.append(details);}
    const controls=make('div','card-controls'),select=make('select');select.setAttribute('aria-label','Review '+item.title);
    for(const [value,caption] of [['unreviewed','Unreviewed'],['reviewed','Reviewed'],['follow-up','Needs follow-up'],['excluded','Excluded']])select.append(new Option(caption,value));
    select.value=item.review;select.addEventListener('change',()=>safely(async()=>{await action({type:'item.review',id:item.id,review:select.value});}));controls.append(select);
    const include=make('label','check'),checkbox=make('input');checkbox.type='checkbox';checkbox.checked=item.included;checkbox.disabled=item.review==='excluded';checkbox.addEventListener('change',()=>safely(()=>action({type:'item.include',id:item.id,included:checkbox.checked})));include.append(checkbox,document.createTextNode('Include in report'));controls.append(include);
    controls.append(button(item.annotation?'Edit note':'Add note',()=>editAnnotation(item)),button('Move',()=>moveItem(item)));
    card.append(controls);target.append(card);
  }
}
function renderTasks(){
  const target=$('tasks');target.replaceChildren();const tasks=rows('tasks').filter(t=>!isPanel||t.status==='open').filter(matches).slice().sort((a,b)=>(a.status!=='open')-(b.status!=='open')||b.createdAt-a.createdAt);
  if(!tasks.length){const filtered=!isPanel&&rows('tasks').length;empty(target,filtered?'No matching tasks':'No tasks yet',filtered?'Try another search.':'Add a task for something you want to follow up.');}
  for(const task of (isPanel?tasks.slice(0,3):tasks)){const card=make('article','card');card.dataset.focusKey=task.id;cardMeta(card,task.status,task.createdAt);card.append(make('h3','',task.title));const controls=make('div','card-controls');for(const [status,title] of (task.status==='open'?[['done','Mark done'],['dismissed','Dismiss']]:[['open','Reopen']]))controls.append(button(title,()=>action({type:'task.status',id:task.id,status})));card.append(controls);target.append(card);}
}
function renderSearches(){
  const target=$('searches');target.replaceChildren();const searches=rows('searches').filter(matches).slice().reverse();
  if(!searches.length)empty(target,rows('searches').length?'No matching searches':'No searches yet',rows('searches').length?'Try another search.':'Searches you launch from Gather appear here. They do not imply complete coverage.');
  for(const search of searches){const card=make('article','card');card.dataset.focusKey=search.id;cardMeta(card,search.status,search.createdAt);card.append(make('h3','',search.query),make('p','quiet',PROVIDERS[search.provider]));const controls=make('div','card-controls');controls.append(button('Open search ↗',async()=>{const r=await request('workspace.reopenSearch',{id:search.id});update(r.state);}));if(search.status==='opened')controls.append(button('Mark reviewed',()=>action({type:'search.status',id:search.id,status:'reviewed'})));card.append(controls);target.append(card);}
}
function renderActivity(){const target=$('activity');target.replaceChildren();const events=rows('activity').filter(matches).slice().reverse();if(!events.length)empty(target,rows('activity').length?'No matching activity':'No activity yet',rows('activity').length?'Try another search.':'Your saves, reviews and searches appear here. Browsing history is not collected.');for(const event of events){const card=make('article','card');cardMeta(card,event.kind.replaceAll('.',' · '),event.at);card.append(make('p','',event.label));target.append(card);}}
async function selectScan(id){await action({type:'context.select',scanId:id});$('localSearch').value='';$('filter').value='all';setView('items');document.body.classList.remove('library-open');$('libraryToggle').setAttribute('aria-expanded','false');}
function openEditor(title,fields,save,destination=currentScan(),submit='Save'){
  editorSave=save;$('editorTitle').textContent=title;$('editorDestination').textContent='Destination: '+label(destination);$('submitEdit').textContent=submit;$('fields').replaceChildren();$('editorError').textContent='';
  for(const spec of fields){const label=make('label','',spec.label),input=make(spec.type==='textarea'?'textarea':spec.type==='select'?'select':'input');input.name=spec.name;
    if(spec.type==='select')for(const o of spec.options)input.append(new Option(o.label,o.value));
    else{if(input.tagName==='INPUT')input.type=spec.type||'text';input.maxLength=spec.max||500;input.required=spec.required!==false;}
    input.value=spec.value||'';label.append(input);$('fields').append(label);
  }
  $('editor').showModal();$('fields').querySelector('input,select,textarea')?.focus();
}
function editAnnotation(item){openEditor('Analyst note',[{name:'annotation',label:'Your note',type:'textarea',value:item.annotation,max:20000,required:false}],v=>action({type:'item.annotate',id:item.id,annotation:v.annotation}),item.scanId);}
function moveItem(item){openEditor('Move saved item',[{name:'destination',label:'Move to',type:'select',value:item.scanId||'',options:[{value:'',label:'Inbox'},...state.scans.map(s=>({value:s.id,label:label(s.id)}))]}],v=>action({type:'item.move',id:item.id,scanId:v.destination||null}),item.scanId,'Move');}
function showHistory(item){$('historyContent').replaceChildren();for(const observation of state.items.filter(x=>x.entityId===item.entityId).sort((a,b)=>b.createdAt-a.createdAt)){const card=make('div','card');cardMeta(card,label(observation.scanId),observation.createdAt);card.append(make('h3','',observation.title),make('p','account-id',observation.entry.id),make('p','quiet',observation.extraction));addLink(card,observation.url);$('historyContent').append(card);}$('historyDialog').showModal();}
$('undoAction').onclick=()=>safely(async()=>{const eventId=undoId;$('undoAction').disabled=true;try{await action({type:'undo',eventId});message('Change undone.');}finally{$('undoAction').disabled=false;$('undoNotice').hidden=true;undoId=null;}});
$('closeHistory').onclick=()=>$('historyDialog').close();
$('editorForm').addEventListener('submit',async event=>{event.preventDefault();$('submitEdit').disabled=true;try{await editorSave(Object.fromEntries(new FormData(event.target)));$('editor').close();message('Saved.');}catch(error){$('editorError').textContent=error.message;}finally{$('submitEdit').disabled=false;}});
$('cancelEdit').onclick=()=>$('editor').close();
$('renameContext').onclick=()=>{const scan=state.scans.find(x=>x.id===state.activeScanId),project=state.projects.find(x=>x.id===scan.projectId);openEditor('Rename case and scan',[{name:'projectName',label:'Case name',value:project.name,max:100},{name:'scanName',label:'Scan name',value:scan.name,max:100}],v=>action({type:'context.rename',scanId:scan.id,...v}),scan.id);};
$('newScan').onclick=()=>{const projectId=state.scans.find(s=>s.id===state.activeScanId).projectId;openEditor('New scan',[{name:'name',label:'Scan name',max:100}],values=>action({type:'scan.create',projectId,...values}));};
$('inbox').onclick=()=>safely(()=>selectScan(null));
$('addSource').onclick=()=>{const scanId=currentScan();openEditor('Save a source',[{name:'url',label:'Source URL',type:'url',max:4096},{name:'title',label:'Title',required:false},{name:'excerpt',label:'Selected excerpt (optional)',type:'textarea',max:20000,required:false}],v=>action({type:'item.save',kind:'source',scanId,...v}),scanId);};
$('addNote').onclick=()=>{const scanId=currentScan();openEditor('Add a note',[{name:'title',label:'Title',value:'Note'},{name:'body',label:'Your note',type:'textarea',max:20000}],v=>action({type:'item.save',kind:'note',scanId,...v}),scanId);};
$('addTask').onclick=()=>{const scanId=currentScan();openEditor('New task',[{name:'title',label:'What needs to happen?'}],v=>action({type:'task.create',scanId,...v}),scanId);};
$('savePage').onclick=()=>safely(async()=>{const scanId=currentScan(),sourceTabId=tabId;if(!sourceTabId)throw new Error('Open a web page and use the Gather toolbar button.');const response=await request('workspace.capture',{scanId,tabId:sourceTabId});update(response.state);message('Page saved to '+(response.result?.destinationLabel||label(response.result?.scanId??scanId))+'.');});
$('searchForm').addEventListener('submit',event=>{event.preventDefault();const scanId=currentScan(),query=$('query').value,provider=$('provider').value,submit=event.submitter;submit.disabled=true;safely(async()=>{const r=await request('workspace.search',{action:{scanId,query,provider}});update(r.state);message('Search opened for '+label(scanId)+'. Mark it reviewed when you finish.');setView('searches',{clearFilter:true});}).finally(()=>submit.disabled=false);});
function draftKey(scanId){return 'gather.search-draft.'+(scanId||'inbox');}
function draftStorage(scanId){const projectId=state.scans.find(s=>s.id===scanId)?.projectId;return state.projects.find(p=>p.id===projectId)?.mode==='ephemeral'?chrome.storage.session:chrome.storage.local;}
function saveDraft(){const scanId=currentScan(),value={query:$('query').value,provider:$('provider').value};draftQueue=draftQueue.catch(()=>{}).then(()=>request('workspace.searchDraft',{scanId,value})).catch(error=>message('Search draft could not be saved. '+error.message,true));}
async function restoreDraft(scanId){await draftQueue.catch(()=>{});const key=draftKey(scanId),draft=(await draftStorage(scanId).get(key))[key];if(currentScan()!==scanId)return;$('query').value=draft?.query||'';$('provider').value=draft?.provider||'google';}
document.querySelector('.add-menu').addEventListener('click',event=>{if(event.target.closest('button'))event.currentTarget.open=false;});
$('query').oninput=saveDraft;$('provider').onchange=saveDraft;
$('libraryToggle').onclick=()=>{const open=document.body.classList.toggle('library-open');$('libraryToggle').setAttribute('aria-expanded',String(open));};
$('historyKind').onchange=()=>setView($('historyKind').value);
$('localSearch').oninput=renderViews;$('filter').onchange=renderViews;
for(const el of document.querySelectorAll('[data-view]'))el.onclick=()=>setView(el.dataset.view==='searches'?$('historyKind').value:el.dataset.view);
for(const el of document.querySelectorAll('[data-filter]'))el.onclick=()=>{$('filter').value=el.dataset.filter;setView('items');};
$('exportReport').onclick=()=>safely(async()=>{const scanId=state.activeScanId,data=report(state,scanId);data.captures=await scanCaptureReport(scanId);const readable=$('reportFormat').value==='md';downloadFile('Gather-report-'+new Date().toISOString().slice(0,10)+(readable?'.md':'.json'),readable?reportMarkdown(data)+captureReportMarkdown(data.captures):data,readable?'text/markdown':'application/json');message('Report exported: '+data.items.length+' included findings and '+data.captures.length+' capture records. Images can be exported from Captures.');});
$('backup').onclick=()=>safely(async()=>{const r=await request('workspace.backup'),blob=await createFullBackup(r.backup);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Gather-all-work-'+new Date().toISOString().slice(0,10)+'.gather';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);message('All-work backup downloaded, including unredacted originals, subjects, relationships and legacy batches. Keep it private.');});
$('restore').onclick=()=>$('restoreFile').click();
$('restoreFile').onchange=()=>safely(async()=>{const file=$('restoreFile').files[0];$('restoreFile').value='';if(!file)return;if(file.size>MAX_BACKUP_BYTES)throw new Error('Choose a Gather backup under 560 MiB.');const binary=file.name.endsWith('.gather'),manifest=binary?await readFullBackup(file):null;if(!binary&&file.size>32*1024*1024)throw new Error('Legacy JSON backup exceeds 32 MiB.');const backup=binary?manifest.workspaceBackup:validateBackup(JSON.parse(await file.text()));openEditor('Restore backup',[],async()=>{const r=binary?await request('workspace.importImages',{stageId:await stageFullRestore(manifest)}):await request('workspace.import',{backup});update(r.state);document.dispatchEvent(new Event('gather:captures-changed'));},state.activeScanId,'Import backup');$('editorDestination').textContent=backup.workspace.projects.length+' projects, '+backup.workspace.items.length+' saved findings'+(binary?', '+manifest.bundle.captures.length+' captures and '+manifest.bundle.subjects.length+' subjects':' (legacy backup has no images)')+'. Existing work is retained; conflicting record IDs are remapped into separate copies.';});
$('expand').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('workspace.html')});
function renderTabContext(){
  $('tabContext').hidden=false;$('panelNextActions').hidden=false;
  $('tabDestination').textContent=label(currentScan());
  $('tabContextHelp').textContent=tabContext?.assigned?'This tab keeps its destination when the default changes.':'Using the default destination. Assign this tab to keep its context.';
  $('tabScan').replaceChildren(new Option('Inbox',''));for(const scan of state.scans)$('tabScan').append(new Option(label(scan.id),scan.id));$('tabScan').value=currentScan()||'';
  $('detachTab').disabled=!tabContext?.assigned;$('assignTab').disabled=!tabId;$('savePage').disabled=!tabId;
}
async function refreshTabContext(){
  if(!isPanel)return;const serial=++tabRefresh,[tab]=await chrome.tabs.query({active:true,windowId});
  if(!tab?.id){tabId=null;tabContext=null;if(state)render();return;}
  const next=await request('workspace.tabContext',{tabId:tab.id});if(serial!==tabRefresh)return;
  const previous=state?currentScan():null;tabId=tab.id;tabContext=next;if(state){render();if(previous!==currentScan())restoreDraft(currentScan());}
}
$('assignTab').onclick=()=>safely(async()=>{const assignedTab=tabId;await request('workspace.assignTab',{tabId:assignedTab,scanId:$('tabScan').value||null});await refreshTabContext();message('Tab destination assigned. Research context does not prove how a source was found.');});
$('detachTab').onclick=()=>safely(async()=>{await request('workspace.detachTab',{tabId});await refreshTabContext();message('Tab detached. It now uses the default destination.');});
async function init(){
  if(!globalThis.chrome?.runtime?.id){message('Load Gather as an unpacked browser extension to open your workspace.',true);document.querySelectorAll('button,input,select').forEach(x=>x.disabled=true);return;}
  windowId=(await chrome.windows.getCurrent()).id;$('expand').hidden=!isPanel;
  const currentTab=await chrome.tabs.getCurrent();if(currentTab)$('savePage').hidden=true;
  if(isPanel){await refreshTabContext();chrome.tabs.onActivated.addListener(info=>{if(info.windowId===windowId)safely(refreshTabContext);});chrome.tabs.onUpdated.addListener(id=>{if(id===tabId)safely(refreshTabContext);});}
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[WORKSPACE_KEY]?.newValue){update(changes[WORKSPACE_KEY].newValue);if(isPanel)safely(refreshTabContext);}if(area==='session'&&changes['gather.tabContexts.v1']&&isPanel)safely(refreshTabContext);if(area==='session'&&changes.gatherCaptureError?.newValue)message(changes.gatherCaptureError.newValue,true);});
  let r=await request('workspace.state');
  const link=new URLSearchParams(location.search);
  if(!isPanel&&link.has('scan')){
    const scanId=link.get('scan')==='inbox'?null:link.get('scan');
    const requested=scanId===null||r.state.scans.some(s=>s.id===scanId);
    let captureMatches=true;
    if(link.has('capture')){const capture=await getCapture(link.get('capture'));captureMatches=!!capture&&capture.scanId===scanId;}
    if(requested&&captureMatches)r=await act({type:'context.select',scanId});
    else message('The linked scan or capture is no longer available. Choose a scan from the library.',true);
  }
  update(r.state);selectSection(initialSection||'research');document.querySelector('.layout').inert=false;
  document.dispatchEvent(new Event('gather:workspace-ready'));
  const {gatherCaptureError}=await chrome.storage.session.get('gatherCaptureError');if(gatherCaptureError){message(gatherCaptureError,true);await chrome.storage.session.remove('gatherCaptureError');}chrome.action.setBadgeText({text:''}).catch(()=>{});
}
safely(init);
