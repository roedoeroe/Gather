import {destinationLabel, PROVIDERS, report, reportMarkdown, WORKSPACE_KEY, MAX_BYTES} from './workspace-model.js';
import {validateBackup} from './workspace-store.js';
import {request,act,downloadFile} from './workspace-client.js';
const $=id=>document.getElementById(id);
let state=null,view='items',draftQueue=Promise.resolve(),editorSave=null,lastScan,windowId=null;
const formatTime=t=>new Date(t).toLocaleString();
const label=id=>destinationLabel(state,id);
const rows=key=>state[key].filter(x=>x.scanId===state.activeScanId);
const make=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el;};
function message(content,error=false){$('message').textContent=content;$('message').className='message'+(error?' error':'');$('message').hidden=false;}
async function safely(fn){try{return await fn();}catch(error){message(error.message,true);return null;}}
function update(next){if(!state||next.revision>=state.revision){const changed=lastScan!==next.activeScanId;state=next;lastScan=next.activeScanId;render();if(changed)restoreDraft(next.activeScanId);}}
async function action(payload){const response=await act(payload);update(response.state);return response.result;}
function button(title,fn,cls=''){const b=make('button',cls,title);b.type='button';b.addEventListener('click',()=>safely(fn));return b;}
function empty(target,title,description){const el=make('div','empty');el.append(make('strong','',title),make('span','',description));target.append(el);}
function matches(row){const q=$('localSearch').value.trim().toLowerCase();return !q||JSON.stringify(row).toLowerCase().includes(q);}
function setView(next){view=next;renderViews();}
function render(){
  const scan=state.scans.find(x=>x.id===state.activeScanId),project=state.projects.find(x=>x.id===scan?.projectId);
  $('projectName').textContent=project?.name||'READY WHEN YOU ARE';$('scanName').textContent=scan?.name||'Inbox';
  $('scanHelp').textContent=scan?'Your sources, observations and next steps, together.':'Save something now. Organize it when you’re ready.';
  $('saveDestination').textContent='Saving to '+label(state.activeScanId);$('newScan').hidden=!scan;$('renameContext').hidden=!scan;
  $('inboxCount').textContent=state.items.filter(x=>x.scanId===null).length;$('inbox').classList.toggle('selected',state.activeScanId===null);
  $('projects').replaceChildren();
  for(const p of state.projects){$('projects').append(make('div','project-label',p.name));for(const s of state.scans.filter(s=>s.projectId===p.id))$('projects').append(button(s.name,()=>selectScan(s.id),'scan'+(state.activeScanId===s.id?' selected':'')));}
  if(!state.projects.length)$('projects').append(make('p','quiet','Create a project when you need one.'));
  $('reviewCount').textContent=rows('items').filter(x=>['unreviewed','follow-up'].includes(x.review)).length;
  $('taskCount').textContent=rows('tasks').filter(x=>x.status==='open').length;
  $('searchCount').textContent=rows('searches').filter(x=>x.status!=='reviewed').length;
  const used=new TextEncoder().encode(JSON.stringify(state)).length;
  $('storageUsage').textContent='Workspace: '+(used/1024).toFixed(0)+' KB / '+(MAX_BYTES/1024/1024)+' MB'+(used>MAX_BYTES*.8?' · Approaching capacity. Back up your work.':'');
  renderViews();
}
function renderViews(){
  for(const name of ['items','tasks','searches','activity'])$(name).hidden=name!==view;
  for(const tab of document.querySelectorAll('.tabs [data-view]')){tab.classList.toggle('selected',tab.dataset.view===view);tab.setAttribute('aria-current',tab.dataset.view===view?'page':'false');}
  $('filter').hidden=view!=='items';
  ({items:renderItems,tasks:renderTasks,searches:renderSearches,activity:renderActivity}[view])();
}
function cardMeta(card,kind,date){const meta=make('div','meta');meta.append(make('span','badge',kind),make('span','',formatTime(date)));card.append(meta);}
function addLink(card,url,title=url){const a=make('a','url',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
function renderItems(){
  const target=$('items');target.replaceChildren();const filter=$('filter').value;
  const items=rows('items').filter(matches).filter(x=>filter==='all'||filter===x.kind||(filter==='attention'&&['unreviewed','follow-up'].includes(x.review))||(filter==='excluded'&&x.review==='excluded')).slice().reverse();
  if(!items.length){empty(target,'A clear place for your findings.','Save a page, include an account result, or add a note. Your choices stay with this scan.');return;}
  for(const item of items){
    const card=make('article','card');card.dataset.itemId=item.id;cardMeta(card,item.kind,item.createdAt);card.append(make('h3','',item.title));
    if(item.url)addLink(card,item.url);
    if(item.kind==='account'){
      const entry=item.entry;card.append(make('div','account-id',entry.id||'ID unresolved'),make('p','quiet',item.extraction));
      card.append(make('p','micro',(entry.verifiedAt?'Checked '+formatTime(entry.verifiedAt):'No checked page observation')+(entry.method?' · '+entry.method:'')));
      if(entry.notes?.length)card.append(make('p','','Original account notes: '+entry.notes.join(' ')));
      if(entry.message)card.append(make('p','quiet',entry.message));
      if(item.entityId){const history=state.items.filter(x=>x.entityId===item.entityId);card.append(button(history.length+' observation'+(history.length===1?'':'s'),()=>showHistory(item),'subtle'));}
    }
    if(item.excerpt){card.append(make('p','',item.excerpt));if(item.originUrl!==item.url)addLink(card,item.originUrl,'Selected on '+item.originUrl);}
    if(item.body)card.append(make('p','',item.body));
    if(item.annotation)card.append(make('p','','Analyst note: '+item.annotation));
    const controls=make('div','card-controls'),select=make('select');select.setAttribute('aria-label','Review '+item.title);
    for(const [value,caption] of [['unreviewed','Unreviewed'],['reviewed','Reviewed'],['follow-up','Needs follow-up'],['excluded','Excluded']])select.append(new Option(caption,value));
    select.value=item.review;select.addEventListener('change',()=>safely(async()=>{await action({type:'item.review',id:item.id,review:select.value});}));controls.append(select);
    const include=make('label','check'),checkbox=make('input');checkbox.type='checkbox';checkbox.checked=item.included;checkbox.disabled=item.review==='excluded';checkbox.addEventListener('change',()=>safely(()=>action({type:'item.include',id:item.id,included:checkbox.checked})));include.append(checkbox,document.createTextNode('Include in report'));controls.append(include);
    controls.append(button(item.annotation?'Edit note':'Add note',()=>editAnnotation(item)),button('Move',()=>moveItem(item)));
    card.append(controls);target.append(card);
  }
}
function renderTasks(){
  const target=$('tasks');target.replaceChildren();const tasks=rows('tasks').filter(matches).slice().sort((a,b)=>(a.status!=='open')-(b.status!=='open')||b.createdAt-a.createdAt);
  if(!tasks.length)empty(target,'Know what comes next.','Add an unresolved question or action. Done and dismissed actions stay in the record.');
  for(const task of tasks){const card=make('article','card');cardMeta(card,task.status,task.createdAt);card.append(make('h3','',task.title));const controls=make('div','card-controls');for(const [status,title] of (task.status==='open'?[['done','Mark done'],['dismissed','Dismiss']]:[['open','Reopen']]))controls.append(button(title,()=>action({type:'task.status',id:task.id,status})));card.append(controls);target.append(card);}
}
function renderSearches(){
  const target=$('searches');target.replaceChildren();const searches=rows('searches').filter(matches).slice().reverse();
  if(!searches.length)empty(target,'Your searches, with context.','Prepared, opened and reviewed describe your actions. Search history never implies complete coverage or absence.');
  for(const search of searches){const card=make('article','card');cardMeta(card,search.status,search.createdAt);card.append(make('h3','',search.query),make('p','quiet',PROVIDERS[search.provider]));const controls=make('div','card-controls');controls.append(button('Open search ↗',async()=>{const r=await request('workspace.reopenSearch',{id:search.id});update(r.state);}));if(search.status==='opened')controls.append(button('Mark reviewed',()=>action({type:'search.status',id:search.id,status:'reviewed'})));card.append(controls);target.append(card);}
}
function renderActivity(){const target=$('activity');target.replaceChildren();const events=rows('activity').filter(matches).slice().reverse();if(!events.length)empty(target,'Only your Gather actions.','Saving, reviewing and searches appear here. Browsing history is not collected.');for(const event of events){const card=make('article','card');cardMeta(card,event.kind.replaceAll('.',' · '),event.at);card.append(make('p','',event.label));target.append(card);}}
async function selectScan(id){await action({type:'context.select',scanId:id});$('localSearch').value='';$('filter').value='all';setView('items');message('Active destination: '+label(id));}
function openEditor(title,fields,save,destination=state.activeScanId,submit='Save'){
  editorSave=save;$('editorTitle').textContent=title;$('editorDestination').textContent='Destination: '+label(destination);$('submitEdit').textContent=submit;$('fields').replaceChildren();$('editorError').textContent='';
  for(const spec of fields){const label=make('label','',spec.label),input=make(spec.type==='textarea'?'textarea':spec.type==='select'?'select':'input');input.name=spec.name;
    if(spec.type==='select')for(const o of spec.options)input.append(new Option(o.label,o.value));
    else{input.type=spec.type||'text';input.maxLength=spec.max||500;input.required=spec.required!==false;}
    input.value=spec.value||'';label.append(input);$('fields').append(label);
  }
  $('editor').showModal();$('fields').querySelector('input,select,textarea')?.focus();
}
function editAnnotation(item){openEditor('Analyst note',[{name:'annotation',label:'Your note',type:'textarea',value:item.annotation,max:20000,required:false}],v=>action({type:'item.annotate',id:item.id,annotation:v.annotation}),item.scanId);}
function moveItem(item){openEditor('Move saved item',[{name:'destination',label:'Move to',type:'select',value:item.scanId||'',options:[{value:'',label:'Inbox'},...state.scans.map(s=>({value:s.id,label:label(s.id)}))]}],v=>action({type:'item.move',id:item.id,scanId:v.destination||null}),item.scanId,'Move');}
function showHistory(item){$('historyContent').replaceChildren();for(const observation of state.items.filter(x=>x.entityId===item.entityId).sort((a,b)=>b.createdAt-a.createdAt)){const card=make('div','card');cardMeta(card,label(observation.scanId),observation.createdAt);card.append(make('h3','',observation.title),make('p','account-id',observation.entry.id),make('p','quiet',observation.extraction));addLink(card,observation.url);$('historyContent').append(card);}$('historyDialog').showModal();}
$('closeHistory').onclick=()=>$('historyDialog').close();
$('editorForm').addEventListener('submit',async event=>{event.preventDefault();$('submitEdit').disabled=true;try{await editorSave(Object.fromEntries(new FormData(event.target)));$('editor').close();message('Saved.');}catch(error){$('editorError').textContent=error.message;}finally{$('submitEdit').disabled=false;}});
$('cancelEdit').onclick=()=>$('editor').close();
$('newProject').onclick=()=>openEditor('New project',[{name:'name',label:'Project name',max:100},{name:'scanName',label:'First scan',value:'Initial review',max:100}],values=>action({type:'project.create',...values}));
$('renameContext').onclick=()=>{const scan=state.scans.find(x=>x.id===state.activeScanId),project=state.projects.find(x=>x.id===scan.projectId);openEditor('Rename project and scan',[{name:'projectName',label:'Project name',value:project.name,max:100},{name:'scanName',label:'Scan name',value:scan.name,max:100}],v=>action({type:'context.rename',scanId:scan.id,...v}),scan.id);};
$('newScan').onclick=()=>{const projectId=state.scans.find(s=>s.id===state.activeScanId).projectId;openEditor('New scan',[{name:'name',label:'Scan name',max:100}],values=>action({type:'scan.create',projectId,...values}));};
$('inbox').onclick=()=>safely(()=>selectScan(null));
$('addSource').onclick=()=>{const scanId=state.activeScanId;openEditor('Save a source',[{name:'url',label:'Source URL',type:'url',max:4096},{name:'title',label:'Title',required:false},{name:'excerpt',label:'Selected excerpt (optional)',type:'textarea',max:20000,required:false}],v=>action({type:'item.save',kind:'source',scanId,...v}),scanId);};
$('addNote').onclick=()=>{const scanId=state.activeScanId;openEditor('Add a note',[{name:'title',label:'Title',value:'Note'},{name:'body',label:'Your note',type:'textarea',max:20000}],v=>action({type:'item.save',kind:'note',scanId,...v}),scanId);};
$('addTask').onclick=()=>{const scanId=state.activeScanId;openEditor('Next action',[{name:'title',label:'What needs to happen?'}],v=>action({type:'task.create',scanId,...v}),scanId);};
$('savePage').onclick=()=>safely(async()=>{const scanId=state.activeScanId,[tab]=await chrome.tabs.query({active:true,windowId});if(!tab?.id)throw new Error('Open a web page and use the Gather toolbar button.');const response=await request('workspace.capture',{scanId,tabId:tab.id});update(response.state);message('Page saved to '+label(scanId)+'.');});
$('searchForm').addEventListener('submit',event=>{event.preventDefault();const scanId=state.activeScanId,query=$('query').value,provider=$('provider').value,submit=event.submitter;submit.disabled=true;safely(async()=>{const r=await request('workspace.search',{action:{scanId,query,provider}});update(r.state);message('Search opened for '+label(scanId)+'. Mark it reviewed when you finish.');setView('searches');}).finally(()=>submit.disabled=false);});
function draftKey(scanId){return 'gather.search-draft.'+(scanId||'inbox');}
function saveDraft(){const scanId=state.activeScanId,value={query:$('query').value,provider:$('provider').value};draftQueue=draftQueue.catch(()=>{}).then(()=>chrome.storage.local.set({[draftKey(scanId)]:value})).catch(error=>message('Search draft could not be saved. '+error.message,true));}
async function restoreDraft(scanId){await draftQueue.catch(()=>{});const key=draftKey(scanId),draft=(await chrome.storage.local.get(key))[key];if(state.activeScanId!==scanId)return;$('query').value=draft?.query||'';$('provider').value=draft?.provider||'google';}
$('query').oninput=saveDraft;$('provider').onchange=saveDraft;
$('localSearch').oninput=renderViews;$('filter').onchange=renderViews;
for(const el of document.querySelectorAll('[data-view]'))el.onclick=()=>setView(el.dataset.view);
for(const el of document.querySelectorAll('[data-filter]'))el.onclick=()=>{$('filter').value=el.dataset.filter;setView('items');};
$('exportReport').onclick=()=>safely(async()=>{const scanId=state.activeScanId,data=report(state,scanId);const readable=$('reportFormat').value==='md';downloadFile('Gather-report-'+new Date().toISOString().slice(0,10)+(readable?'.md':'.json'),readable?reportMarkdown(data):data,readable?'text/markdown':'application/json');message('Report exported: '+data.items.length+' included items. Excluded items stay in Gather.');});
$('backup').onclick=()=>safely(async()=>{const r=await request('workspace.backup');downloadFile('Gather-backup-'+new Date().toISOString().slice(0,10)+'.json',r.backup);message('Backup downloaded. Keep it somewhere private.');});
$('restore').onclick=()=>$('restoreFile').click();
$('restoreFile').onchange=()=>safely(async()=>{const file=$('restoreFile').files[0];$('restoreFile').value='';if(!file)return;if(file.size>32*1024*1024)throw new Error('Choose a Gather backup under 32 MB.');const backup=validateBackup(JSON.parse(await file.text()));openEditor('Restore backup',[],async()=>{const r=await request('workspace.import',{backup});update(r.state);},state.activeScanId,'Import backup');$('editorDestination').textContent=backup.workspace.projects.length+' projects, '+backup.workspace.items.length+' saved items and '+Object.keys(backup.legacy).filter(k=>k.startsWith('gather.batch.')).length+' legacy batches. Existing work is kept; imported records are added as separate copies when needed.';});
$('expand').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('workspace.html')});
async function init(){
  if(!globalThis.chrome?.runtime?.id){message('Load Gather as an unpacked browser extension to open your workspace.',true);document.querySelectorAll('button,input,select').forEach(x=>x.disabled=true);return;}
  windowId=(await chrome.windows.getCurrent()).id;$('expand').hidden=!new URLSearchParams(location.search).has('panel');
  const currentTab=await chrome.tabs.getCurrent();if(currentTab)$('savePage').hidden=true;
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[WORKSPACE_KEY]?.newValue)update(changes[WORKSPACE_KEY].newValue);if(area==='session'&&changes.gatherCaptureError?.newValue)message(changes.gatherCaptureError.newValue,true);});
  const r=await request('workspace.state');update(r.state);
  const {gatherCaptureError}=await chrome.storage.session.get('gatherCaptureError');if(gatherCaptureError){message(gatherCaptureError,true);await chrome.storage.session.remove('gatherCaptureError');}chrome.action.setBadgeText({text:''}).catch(()=>{});
}
safely(init);
