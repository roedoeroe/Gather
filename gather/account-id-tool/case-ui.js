import {retainFocus} from './workspace-focus.js';
import {clearHistoryDialog} from './history-ui.js';
import {updateCaseSession} from './case-session.js';
import {request,act} from './workspace-client.js';
import {parseIntake,SEED_KINDS,COVERAGE_STATES,FAMILIES,resolveQuery} from './case-model.js';
import {listSubjects,selectSubject,selectedSubject} from './capture-store.js';
import {accountLine,orderAccounts} from './account-state.js';
const panel=new URLSearchParams(location.search).has('panel'),host=document.getElementById('caseTools');
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const status=el('p','','micro');status.setAttribute('role','status');
const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};return b;};
let state,scan,project,subjects=[],serial=0,queueOpen=false,coverageOpen=false,toolsOpen=false;
function field(label,input){const wrap=el('div',undefined,'case-field'),caption=el('label',label);input.id||='case-field-'+crypto.randomUUID();caption.htmlFor=input.id;wrap.append(caption,input);return wrap;}
function input(value='',max=100){const i=el('input');i.value=value;i.maxLength=max;return i;}
function dialog(title){const d=el('dialog'),h=el('h2',title),body=el('div'),error=el('p','','capture-error'),actions=el('div',undefined,'dialog-actions');h.id='dialog-'+crypto.randomUUID();d.setAttribute('aria-labelledby',h.id);error.setAttribute('role','alert');d.append(h,body,error,actions);document.body.append(d);actions.append(button('Cancel',()=>d.close()));d.onclose=()=>d.remove();d.showModal();return {d,body,error,actions};}
function previewClipboard(title,text){const {d,body,actions}=dialog(title),out=el('textarea');out.value=text;out.readOnly=true;out.rows=12;out.setAttribute('aria-label','Clipboard preview');body.append(out,el('p','Review this text before copying. Public page titles and URLs can contain names.','micro'));actions.append(button('Copy',async()=>{await navigator.clipboard.writeText(out.value);d.close();status.textContent='Copied.';}));}
async function startCase(raw=''){
  const {d,body,error,actions}=dialog('New case'),name=input('',100),scanName=input('Initial scan'),mode=el('select'),paste=el('textarea'),preview=el('div'),intake=el('details',undefined,'intake-options');
  mode.append(new Option('Session only — release approved names on restart','ephemeral'),new Option('Keep locally — retain approved names until removed','local'));
  paste.maxLength=100000;paste.rows=7;paste.placeholder='SOC: Alex Example\nSchool: Northbridge School\nUsername: alex.example';paste.value=raw;intake.open=Boolean(raw);
  body.append(field('Case name',name),field('First scan',scanName),el('p','Saved in this browser. Gather does not upload or sync your cases.','micro'));
  intake.append(el('summary','Add intake to prepare searches (optional)'),el('p','Review extracted fields before retaining them. Saved findings and screenshots may contain names regardless of this choice.','micro'),field('Remember approved intake',mode),field('Paste intake for local review',paste));body.append(intake);
  let fields=[],reviewedText=null;const rows=new Map();
  const updateSave=()=>{save.disabled=!name.value.trim()||!scanName.value.trim()||Boolean(paste.value.trim()&&reviewedText!==paste.value);};
  const review=button('Review extracted fields',()=>{fields=parseIntake(paste.value);reviewedText=paste.value;rows.clear();preview.replaceChildren();for(const f of fields){const row=el('div',undefined,'case-review-row'),keep=el('input');keep.type='checkbox';keep.checked=f.keep;keep.setAttribute('aria-label','Retain '+f.label);const kind=el('select');kind.setAttribute('aria-label','Field type');for(const k of SEED_KINDS)kind.append(new Option(k,k));kind.value=f.kind;const value=input(f.value,2000);value.setAttribute('aria-label','Reviewed value');row.append(keep,kind,value,el('small',f.reason));rows.set(f.id,{keep,kind,value});preview.append(row);}updateSave();});intake.append(review,preview);
  const save=button('Create case',async()=>{save.disabled=true;try{
    if(paste.value.trim()&&reviewedText!==paste.value)throw new Error('Review the updated intake before creating the case.');
    const hasIntake=Boolean(paste.value.trim()),reviewed=fields.map(f=>({...f,keep:rows.get(f.id).keep.checked,kind:rows.get(f.id).kind.value,value:rows.get(f.id).value.value}));
    if(hasIntake)await request('workspace.caseCreate',{input:{name:name.value,scanName:scanName.value,mode:mode.value,fields:reviewed}});
    else await act({type:'project.create',name:name.value,scanName:scanName.value});
    d.close();await refresh();status.textContent=hasIntake?'Case created. Your search plan is ready.':'Case created. Start a search or add a finding.';
    document.dispatchEvent(new CustomEvent('gather:navigate',{detail:hasIntake?'case':'research'}));document.dispatchEvent(new Event('gather:captures-changed'));
  }catch(e){error.textContent=e.message;}finally{updateSave();}});save.className='primary';actions.append(save);updateSave();
  name.oninput=scanName.oninput=updateSave;paste.oninput=()=>{reviewedText=null;fields=[];rows.clear();preview.replaceChildren();updateSave();};
  d.onclose=()=>{raw='';paste.value='';fields=[];for(const row of rows.values())row.value.value='';rows.clear();d.remove();};name.focus();
}
const heading=el('div',undefined,'section-heading'),title=el('h2','Search plan & coverage'),summary=el('p','','micro'),actions=el('div',undefined,'case-actions'),content=el('div');
heading.append(title);host.append(heading,summary,actions,content);document.getElementById('workspaceStatus').append(status);status.classList.add('workspace-status');
if(panel)document.querySelector('#view-research .composer').after(host);
async function sessionFor(id){return (await chrome.storage.session.get('gather.case.'+id))['gather.case.'+id]||{};}
async function resumeValues(){const {d,body,actions}=dialog('Resume approved seed values'),seeds=state.research?.seeds.filter(s=>s.projectId===project.id)||[],session=await sessionFor(project.id),rows=[];for(const seed of seeds){const value=input(session.values?.[seed.id]||seed.value||'',2000);body.append(field(seed.token+' · '+seed.kind,value));rows.push({seed,value});}body.append(el('p','Values entered here stay in this browser session. Existing evidence and role IDs remain unchanged.','micro'));const id=project.id;actions.append(button('Use this session',async()=>{await updateCaseSession(id,current=>{const next={...current,values:{...current.values},names:{...current.names}};for(const {seed,value} of rows)if(value.value.trim()){next.values[seed.id]=value.value.trim();if(seed.subjectId)next.names[seed.subjectId]=value.value.trim();}return next;});d.close();await refresh();}));}
async function closeCase(){
  const frozenProject=project.id,frozenName=project.name,{d,body,error,actions}=dialog('Delete case');
  const store=await import('./capture-store.js'),{projectSignature}=await import('./case-close.js');
  const reviewed=(await request('workspace.state')).state,bundle=await store.snapshotCaptureBundle();
  const guard={revision:reviewed.revision,digest:await store.hashBytes(new Blob([projectSignature(bundle,frozenProject)]))};
  body.append(el('p',frozenName),el('p',`${reviewed.items.filter(i=>i.projectId===frozenProject).length} saved findings · ${bundle.captures.filter(c=>c.projectId===frozenProject).length} captures · ${bundle.subjects.filter(s=>s.projectId===frozenProject).length} subjects`),el('p','Deletes this case, scans, saved findings, tasks, searches, subjects, images (including originals and derivatives), case context and associated recent lookups from Gather. Other cases remain.'),el('p','A backup is optional and creates a separate file containing original, unredacted images. Downloaded files, browser history, clipboard contents and external sites are not cleared. This is logical deletion, not forensic erasure.','micro'));
  const verify=input('',100);body.append(field('Type the case name to confirm deletion: '+frozenName,verify));
  let deleting=false;
  const remove=async withBackup=>{if(deleting)return;deleting=true;for(const b of actions.querySelectorAll('.danger'))b.disabled=true;try{
    if(verify.value!==frozenName)throw new Error('Enter the displayed case name before deleting its data.');
    if(withBackup){
      const {createFullBackup,readFullBackup}=await import('./capture-backup.js'),{downloadVerifiedBlob}=await import('./capture-files.js');
      const backup=(await request('workspace.backup')).backup,blob=await createFullBackup(backup,{projectId:frozenProject}),manifest=await readFullBackup(blob);
      if(backup.workspace.revision!==guard.revision||await store.hashBytes(new Blob([projectSignature(manifest.bundle,frozenProject)]))!==guard.digest)throw new Error('Case changed. Reopen Delete case to review it.');
      if(!d.open)return;
      await downloadVerifiedBlob(blob,'Gather/Backups/Project-'+frozenProject+'-'+Date.now()+'.gather');
    }
    if(!d.open)return;
    const removed=await request('workspace.closeProject',{projectId:frozenProject,guard});d.close();await refresh();
    status.textContent=`Deleted case, ${removed.result.captures} captures, ${removed.result.images} image assets, ${removed.result.subjects} subjects and ${removed.result.batches} associated lookups. `+(withBackup?'Downloaded backup retained.':'No backup created.');
    document.dispatchEvent(new Event('gather:captures-changed'));
  }catch(e){error.textContent=e.message;}finally{deleting=false;for(const b of actions.querySelectorAll('.danger'))b.disabled=false;}};
  for(const [label,backup] of [['Back up then delete',true],['Delete without backup',false]]){const b=button(label,()=>remove(backup));b.className='danger';actions.append(b);}
}
const privacyScope=el('p','','quiet');
const privacy=el('section',undefined,'data-privacy'),deleteCase=button('Delete case…',closeCase),clearHistory=button('Clear recent lookup history…',()=>clearHistoryDialog());
deleteCase.className=clearHistory.className='danger';
if(!panel){privacy.setAttribute('aria-label','Data & Privacy');privacy.append(el('h2','Data & Privacy'),el('p','Cases, captures and lookup history stay in this browser on this computer. Gather has no case upload, cloud sync or analytics. Searches and lookups contact your chosen services; exports create separate files.','micro'),privacyScope,deleteCase,clearHistory);document.getElementById('privacyTools').append(privacy);}
async function editQuery(row){const {d,body,actions}=dialog('Edit queued search'),query=input(row.tokenizedQuery,2000),provider=el('select');for(const p of FAMILIES)provider.append(new Option(p,p));provider.value=row.provider;body.append(field('Query template',query),field('Provider',provider),el('p','Keep role/seed tokens to avoid storing friendly names in search history. Literal text here is durable.','micro'));actions.append(button('Save query',async()=>{await act({type:'research.queue',id:row.id,query:query.value,provider:provider.value});d.close();await refresh();}));}
async function associate(){const fresh=(await request('workspace.state')).state,frozenScan=fresh.scans.find(s=>s.id===fresh.activeScanId),selected=await selectedSubject(frozenScan?.id),subject=(await listSubjects(frozenScan?.projectId)).find(s=>s.id===selected);if(!subject)throw new Error('Choose a role in the context selector first.');const {d,body,actions}=dialog('Associate a finding with '+subject.roleId),findings=el('select'),decision=el('select'),reason=input('',2000);for(const item of fresh.items.filter(i=>i.projectId===frozenScan.projectId))findings.append(new Option(item.title,item.id));for(const v of ['candidate','confirmed','rejected'])decision.append(new Option(v,v));body.append(field('Finding',findings),field('Analyst decision',decision),field('Supporting identifiers / reason',reason),el('p','A matching name alone does not establish identity. Gather does not infer this association.','micro'));actions.append(button('Record decision',async()=>{await act({type:'research.associate',itemId:findings.value,subjectId:subject.id,status:decision.value,reason:reason.value});d.close();await refresh();}));}
async function refresh(){
  const ticket=++serial;state=(await request('workspace.state')).state;let scanId=state.activeScanId;
  if(panel){const tab=(await chrome.tabs.query({active:true,currentWindow:true}))[0];if(tab?.id)scanId=(await request('workspace.tabContext',{tabId:tab.id})).context.scanId;}
  scan=state.scans.find(s=>s.id===scanId);project=state.projects.find(p=>p.id===scan?.projectId);subjects=project?await listSubjects(project.id):[];if(ticket!==serial)return;
  const restoreFocus=retainFocus(host);try{
  actions.replaceChildren();content.replaceChildren();
  privacyScope.textContent=project?'Selected case: '+project.name:'Select a case in the library to delete it. Recent lookup history can be cleared independently.';deleteCase.hidden=!project;deleteCase.disabled=!project;
  host.hidden=panel&&!project;document.getElementById('subjectManagement').hidden=!project;
  if(!project){summary.textContent='Inbox works without a case. Select a case from the library, or use New case to organize subjects and research.';return;}
  const seeds=state.research?.seeds.filter(s=>s.projectId===project.id)||[],session=await sessionFor(project.id),selected=await selectedSubject(scan.id);if(ticket!==serial)return;
  summary.textContent=(project.mode==='ephemeral'?'Ephemeral Case · friendly labels and seed values are session-only':project.mode==='local'?'Local Case · approved context retained on this device':'Local project')+(seeds.length?' · '+seeds.length+' approved fields':'');
  if(!seeds.length){host.hidden=panel;summary.textContent+=' · Use Research for searches and findings. Add subjects above when you need them.';return;}
  const chips=el('div',undefined,'case-actions');for(const subject of subjects.slice(0,6)){const chip=button(subject.roleId,async()=>{await selectSubject(scan.id,subject.id,project.id);await refresh();});chip.setAttribute('aria-pressed',String(subject.id===selected));chips.append(chip);}content.append(chips);
  const rows=state.research.queue.filter(q=>q.scanId===scan.id),next=rows.find(q=>q.status==='ready'&&(!selected||q.subjectId===selected))||rows.find(q=>q.status==='ready');
  if(next)actions.append(button('Launch next search ↗',async()=>{await request('workspace.launchQueued',{id:next.id});await refresh();}));
  if(panel){host.hidden=!next;heading.hidden=true;summary.hidden=true;content.replaceChildren();return;}
  const secondary=el('details',undefined,'case-secondary'),secondaryActions=el('div',undefined,'case-actions');secondary.append(el('summary','Case tools'),secondaryActions);secondary.open=toolsOpen;secondary.ontoggle=()=>{if(secondary.isConnected)toolsOpen=secondary.open;};content.append(secondary);
  actions.append(button('Associate / reject finding',associate));
  secondaryActions.append(button('Resume seed values',resumeValues),button('Hide / show friendly labels',async()=>{const old=(await chrome.storage.session.get('gather.hideFriendlyLabels'))['gather.hideFriendlyLabels'];await chrome.storage.session.set({'gather.hideFriendlyLabels':!old});await refresh();status.textContent='This control masks friendly role labels. Saved page content, project titles and URLs may contain names.';}));
  secondaryActions.append(button('Copy role account block',()=>{const ids=state.research.associations.filter(a=>a.subjectId===selected&&a.status!=='rejected').map(a=>a.itemId),accounts=state.items.filter(i=>i.kind==='account'&&ids.includes(i.id));previewClipboard('Account block preview',orderAccounts(accounts.map(i=>i.entry)).map(accountLine).join('\n')||'No explicitly associated accounts for this role.');}),button('Copy coverage summary',()=>previewClipboard('Coverage preview',state.research.coverage.filter(c=>c.scanId===scan.id).map(c=>(subjects.find(s=>s.id===c.subjectId)?.roleId||'Unassigned')+' · '+c.family+' · '+c.status+' · '+new Date(c.checkedAt).toISOString()+(c.note?' · '+c.note:'')).join('\n')||'No coverage checks recorded.')));
  const queue=el('details'),queueTitle=el('summary','Scan queue · '+rows.length);queue.open=queueOpen;queue.ontoggle=()=>{if(queue.isConnected)queueOpen=queue.open;};queue.append(queueTitle);
  const hidden=(await chrome.storage.session.get('gather.hideFriendlyLabels'))['gather.hideFriendlyLabels'];
  for(const row of rows){const card=el('article',undefined,'case-queue-row');card.dataset.focusKey=row.id;let resolved;try{resolved=resolveQuery(state,row,session);}catch{resolved='Session values needed';}card.append(el('p',(hidden?row.tokenizedQuery:resolved)+' · '+row.provider),el('small',row.status));const controls=el('div',undefined,'case-actions');controls.append(button('Launch ↗',async()=>{await request('workspace.launchQueued',{id:row.id});await refresh();}),button('Edit',()=>editQuery(row)));const status=el('select');status.setAttribute('aria-label','Search queue status');for(const s of ['ready','launched','has-findings','reviewed','skipped','blocked'])status.append(new Option(s,s));status.value=row.status;status.onchange=()=>act({type:'research.queue',id:row.id,status:status.value}).then(refresh).catch(e=>{summary.textContent=e.message;});controls.append(status);card.append(controls);queue.append(card);}content.append(queue);
  const coverage=el('details');coverage.open=coverageOpen;coverage.ontoggle=()=>{if(coverage.isConnected)coverageOpen=coverage.open;};coverage.append(el('summary','Coverage · record work and negative results'));const table=el('div',undefined,'case-coverage');
  for(const subject of [...subjects,{id:null,roleId:'Unassigned'}]){const row=el('div',undefined,'case-coverage-row');row.append(el('h3',subject.roleId));for(const family of FAMILIES){const select=el('select');select.setAttribute('aria-label',subject.roleId+' '+family+' coverage');for(const v of COVERAGE_STATES)select.append(new Option(v,v));select.value=state.research.coverage.find(c=>c.scanId===scan.id&&c.subjectId===subject.id&&c.family===family)?.status||'Not searched';const frozenScan=scan.id;select.onchange=()=>act({type:'research.coverage',scanId:frozenScan,subjectId:subject.id,family,status:select.value}).catch(e=>{summary.textContent=e.message;});row.append(field(family,select));}table.append(row);}coverage.append(table,el('p','“No reliable match” describes this search, not proof that no account exists. Gone records a specific unavailable profile.','micro'));content.append(coverage);
  const associations=state.research.associations.filter(a=>a.projectId===project.id);if(associations.length){const detail=el('details');detail.append(el('summary','Analyst associations · '+associations.length));for(const a of associations)detail.append(el('p',(subjects.find(s=>s.id===a.subjectId)?.roleId||a.subjectId)+' · '+a.status+' · '+(state.items.find(i=>i.id===a.itemId)?.title||a.itemId)+(a.reason?' · '+a.reason:'')));content.append(detail);}
  }finally{restoreFocus();}
}
let timer;function schedule(){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(e=>status.textContent=e.message),70);}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes['gather.workspace.v1']||area==='session')schedule();});window.addEventListener('focus',schedule);if(globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.onmessage=schedule;window.addEventListener('pagehide',()=>channel.close());}
let pending=(await chrome.storage.session.get('gather.caseSelection'))['gather.caseSelection'];if(pending&&!panel){await chrome.storage.session.remove('gather.caseSelection');await startCase(pending.text);pending.text='';pending=null;}
refresh().catch(e=>status.textContent=e.message);

document.getElementById('openCaseStart')?.addEventListener('click',()=>startCase().catch(e=>status.textContent=e.message));
