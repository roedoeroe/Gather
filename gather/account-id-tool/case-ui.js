import {retainFocus} from './workspace-focus.js';
import {clearHistoryDialog} from './history-ui.js';
import {updateCaseSession} from './case-session.js';
import {request,act} from './workspace-client.js';
import {parseIntake,SEED_KINDS,COVERAGE_STATES,FAMILIES,resolveQuery} from './case-model.js';
import {listSubjects,selectSubject,selectedSubject} from './capture-store.js';
import {clipboardSnapshot} from './case-clipboard.js';
const panel=new URLSearchParams(location.search).has('panel'),host=document.getElementById('caseTools');
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const status=el('p','','micro');status.setAttribute('role','status');
const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){status.textContent=e.message;}finally{b.disabled=false;}};return b;};
let state,scan,project,subjects=[],serial=0,queueOpen=false,coverageOpen=false,toolsOpen=false;
function field(label,input){const wrap=el('div',undefined,'case-field'),caption=el('label',label);input.id||='case-field-'+crypto.randomUUID();caption.htmlFor=input.id;wrap.append(caption,input);return wrap;}
function input(value='',max=100){const i=el('input');i.value=value;i.maxLength=max;return i;}
function dialog(title){const d=el('dialog'),h=el('h2',title),body=el('div'),error=el('p','','capture-error'),actions=el('div',undefined,'dialog-actions');h.id='dialog-'+crypto.randomUUID();d.setAttribute('aria-labelledby',h.id);error.setAttribute('role','alert');d.append(h,body,error,actions);document.body.append(d);actions.append(button('Cancel',()=>d.close()));d.onclose=()=>d.remove();d.showModal();return {d,body,error,actions};}
const clipboardPreviews=new Set();
async function readClipboard(scope){
  const current=(await request('workspace.state')).state;
  return clipboardSnapshot(current,await listSubjects(scope.projectId),scope);
}
async function previewClipboard(kind,scope){
  let snapshot=await readClipboard({...scope,kind});
  scope={...scope,kind};
  const {d,body,error,actions}=dialog(kind==='accounts'?'Account block preview':'Coverage preview'),out=el('textarea');
  out.value=snapshot.text;out.readOnly=true;out.rows=12;out.setAttribute('aria-label','Clipboard preview');
  body.append(out,el('p',kind==='accounts'?'Candidate and Confirmed are analyst association decisions. Rejected findings are omitted. Saved titles and URLs can contain names. Review before copying.':'Review this text before copying. Saved titles, URLs and notes can contain names.','micro'));
  let invalid=false,checking=0;
  const invalidate=message=>{if(!d.isConnected||!d.open||invalid)return;invalid=true;out.value='';snapshot=null;copy.disabled=true;error.textContent=message;};
  const validate=async()=>{
    if(invalid||!d.isConnected||!d.open)return false;
    const ticket=++checking;
    try{
      const current=await readClipboard(scope);
      if(!d.isConnected||!d.open||invalid)return false;
      if(current.signature!==snapshot.signature){invalidate('These findings or their context changed. Close this preview and reopen it to review the current text.');return false;}
      return true;
    }catch(e){if(ticket===checking)invalidate(e.message);return false;}
  };
  const copy=button('Copy',async()=>{
    if(!await validate()||!d.isConnected||!d.open||invalid)return;
    try{await navigator.clipboard.writeText(out.value);if(d.isConnected&&d.open&&!invalid){d.close();status.textContent='Copied.';}}
    catch{if(d.isConnected&&d.open&&!invalid){error.textContent='Copy was blocked. The text is selected; press Ctrl+C or Cmd+C to copy it, or try Copy again.';out.focus();out.select();}}
  });
  // The shared button wrapper normally re-enables controls; invalid previews
  // must remain disabled even when a delayed Copy action finishes.
  const runCopy=copy.onclick;
  copy.onclick=async()=>{try{await runCopy();}finally{if(invalid)copy.disabled=true;}};
  actions.append(copy);
  const preview={recheck:()=>void validate()};clipboardPreviews.add(preview);
  d.onclose=()=>{clipboardPreviews.delete(preview);out.value='';snapshot=null;d.remove();};
  await validate();
}
async function startCase(){
  const {d,body,error,actions}=dialog('New case'),name=input('',100),rows=el('div',undefined,'soc-entry-list');name.placeholder='e.g. CASE-28175';
  body.append(field('Case name',name),el('p','Use a non-identifying case label. Cases and SOCs stay in this browser.','micro'),rows);
  const subjects=[];
  const updateSave=()=>{save.disabled=!name.value.trim()||subjects.some(row=>!row.value.value.trim());};
  const addSoc=()=>{if(subjects.length>=50)return;const row=el('div',undefined,'soc-entry'),value=input('SOC-'+String(subjects.length+1).padStart(2,'0'),100);value.placeholder='e.g. SOC-01';const item={row,value};subjects.push(item);row.append(field('SOC '+subjects.length,value),button('Remove',()=>{subjects.splice(subjects.indexOf(item),1);row.remove();updateSave();}));rows.append(row);value.oninput=updateSave;updateSave();return value;};
  const add=button('+ Add SOC',()=>addSoc()?.focus());body.append(add);
  const save=button('Create case',async()=>{try{await request('workspace.caseCreate',{input:{workflow:'filing',name:name.value,subjects:subjects.map(s=>s.value.value)}});d.close();await refresh();document.dispatchEvent(new CustomEvent('gather:navigate',{detail:'captures'}));document.dispatchEvent(new Event('gather:captures-changed'));status.textContent='Case created. Choose its SOC when saving a capture.';}catch(e){error.textContent=e.message;}finally{updateSave();}});save.className='primary';actions.append(save);name.oninput=updateSave;addSoc();name.focus();
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
  body.append(el('p',frozenName),el('p',`${reviewed.items.filter(i=>i.projectId===frozenProject).length} saved findings · ${bundle.captures.filter(c=>c.projectId===frozenProject).length} captures · ${bundle.subjects.filter(s=>s.projectId===frozenProject).length} subjects`),el('p','Deletes this case, scans, saved findings, tasks, searches, subjects, images (including originals and derivatives), case context and associated recent lookups from Gather. Other cases remain.'),el('p','A backup is optional and creates a separate, unencrypted file containing case data and original, unredacted images. Anyone with the file can read it. Downloaded files, browser history, clipboard contents and external sites are not cleared. This is logical deletion, not forensic erasure.','micro'));
  const verify=input('',100);verify.placeholder='Enter the exact case name shown above';body.append(field('Type the case name to confirm deletion: '+frozenName,verify));
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
if(!panel){privacy.setAttribute('aria-label','Data & Privacy');privacy.append(el('h2','Data & Privacy'),el('p','Cases, captures and lookup history stay in this browser on this computer. Gather has no case upload, cloud sync or analytics. Web searches open without saving queries or drafts in Gather. Your browser and chosen services may keep their own history. Deliberately saved findings, tasks and case fields remain local; exports create separate files.','micro'),privacyScope,deleteCase,clearHistory);document.getElementById('privacyTools').append(privacy);}
async function editQuery(row){const {d,body,actions}=dialog('Edit queued search'),query=input(row.tokenizedQuery,2000),provider=el('select');for(const p of FAMILIES)provider.append(new Option(p,p));provider.value=row.provider;body.append(field('Query template',query),field('Provider',provider),el('p','This is a deliberately saved search plan. Keep role/seed tokens to avoid storing names in the plan; literal text here stays locally. Launching does not save a separate search log.','micro'));actions.append(button('Save query',async()=>{await act({type:'research.queue',id:row.id,query:query.value,provider:provider.value});d.close();await refresh();}));}
async function associate(){const fresh=(await request('workspace.state')).state,frozenScan=fresh.scans.find(s=>s.id===fresh.activeScanId),selected=await selectedSubject(frozenScan?.id),subject=(await listSubjects(frozenScan?.projectId)).find(s=>s.id===selected);if(!subject)throw new Error('Choose a role in the context selector first.');const {d,body,actions}=dialog('Associate a finding with '+subject.roleId),findings=el('select'),decision=el('select'),reason=input('',2000);reason.placeholder='e.g. A confirmed profile link supplied for this subject';for(const item of fresh.items.filter(i=>i.projectId===frozenScan.projectId))findings.append(new Option(item.title,item.id));for(const v of ['candidate','confirmed','rejected'])decision.append(new Option(v,v));body.append(field('Finding',findings),field('Analyst decision',decision),field('Supporting identifiers / reason',reason),el('p','A matching name alone does not establish identity. Gather does not infer this association.','micro'));actions.append(button('Record decision',async()=>{await act({type:'research.associate',itemId:findings.value,subjectId:subject.id,status:decision.value,reason:reason.value});d.close();await refresh();}));}
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
  if(!seeds.length){host.hidden=true;summary.textContent+=' · Use Research for searches and findings. Add subjects above when you need them.';return;}
  const chips=el('div',undefined,'case-actions');for(const subject of subjects.slice(0,6)){const chip=button(subject.roleId,async()=>{await selectSubject(scan.id,subject.id,project.id);await refresh();});chip.setAttribute('aria-pressed',String(subject.id===selected));chips.append(chip);}content.append(chips);
  const rows=state.research.queue.filter(q=>q.scanId===scan.id),next=rows.find(q=>q.status==='ready'&&(!selected||q.subjectId===selected))||rows.find(q=>q.status==='ready');
  if(next)actions.append(button('Launch next search ↗',async()=>{await request('workspace.launchQueued',{id:next.id});await refresh();}));
  if(panel){host.hidden=!next;heading.hidden=true;summary.hidden=true;content.replaceChildren();return;}
  const secondary=el('details',undefined,'case-secondary'),secondaryActions=el('div',undefined,'case-actions');secondary.append(el('summary','Case tools'),secondaryActions);secondary.open=toolsOpen;secondary.ontoggle=()=>{if(secondary.isConnected)toolsOpen=secondary.open;};content.append(secondary);
  actions.append(button('Associate / reject finding',associate));
  secondaryActions.append(button('Resume seed values',resumeValues),button('Hide / show friendly labels',async()=>{const old=(await chrome.storage.session.get('gather.hideFriendlyLabels'))['gather.hideFriendlyLabels'];await chrome.storage.session.set({'gather.hideFriendlyLabels':!old});await refresh();status.textContent='This control masks friendly role labels. Saved page content, project titles and URLs may contain names.';}));
  const clipboardScope={projectId:project.id,scanId:scan.id,subjectId:selected};
  const accountsCopy=button('Copy role account block',()=>previewClipboard('accounts',clipboardScope));accountsCopy.disabled=!selected;
  secondaryActions.append(accountsCopy,button('Copy coverage summary',()=>previewClipboard('coverage',clipboardScope)));
  const queue=el('details'),queueTitle=el('summary','Scan queue · '+rows.length);queue.open=queueOpen;queue.ontoggle=()=>{if(queue.isConnected)queueOpen=queue.open;};queue.append(queueTitle);
  const hidden=(await chrome.storage.session.get('gather.hideFriendlyLabels'))['gather.hideFriendlyLabels'];
  for(const row of rows){const card=el('article',undefined,'case-queue-row');card.dataset.focusKey=row.id;let resolved;try{resolved=resolveQuery(state,row,session);}catch{resolved='Session values needed';}card.append(el('p',(hidden?row.tokenizedQuery:resolved)+' · '+row.provider),el('small',row.status));const controls=el('div',undefined,'case-actions');controls.append(button('Launch ↗',async()=>{await request('workspace.launchQueued',{id:row.id});await refresh();}),button('Edit',()=>editQuery(row)));const status=el('select');status.setAttribute('aria-label','Search queue status');for(const s of ['ready','launched','has-findings','reviewed','skipped','blocked'])status.append(new Option(s,s));status.value=row.status;status.onchange=()=>act({type:'research.queue',id:row.id,status:status.value}).then(refresh).catch(e=>{summary.textContent=e.message;});controls.append(status);card.append(controls);queue.append(card);}content.append(queue);
  const coverage=el('details');coverage.open=coverageOpen;coverage.ontoggle=()=>{if(coverage.isConnected)coverageOpen=coverage.open;};coverage.append(el('summary','Coverage · record work and negative results'));const table=el('div',undefined,'case-coverage');
  for(const subject of [...subjects,{id:null,roleId:'Unassigned'}]){const row=el('div',undefined,'case-coverage-row');row.append(el('h3',subject.roleId));for(const family of FAMILIES){const select=el('select');select.setAttribute('aria-label',subject.roleId+' '+family+' coverage');for(const v of COVERAGE_STATES)select.append(new Option(v,v));select.value=state.research.coverage.find(c=>c.scanId===scan.id&&c.subjectId===subject.id&&c.family===family)?.status||'Not searched';const frozenScan=scan.id;select.onchange=()=>act({type:'research.coverage',scanId:frozenScan,subjectId:subject.id,family,status:select.value}).catch(e=>{summary.textContent=e.message;});row.append(field(family,select));}table.append(row);}coverage.append(table,el('p','“No reliable match” describes this search, not proof that no account exists. Gone records a specific unavailable profile.','micro'));content.append(coverage);
  const associations=state.research.associations.filter(a=>a.projectId===project.id);if(associations.length){const detail=el('details');detail.append(el('summary','Analyst associations · '+associations.length));for(const a of associations)detail.append(el('p',(subjects.find(s=>s.id===a.subjectId)?.roleId||a.subjectId)+' · '+a.status+' · '+(state.items.find(i=>i.id===a.itemId)?.title||a.itemId)+(a.reason?' · '+a.reason:'')));content.append(detail);}
  }finally{restoreFocus();}
}
let timer;function schedule(){for(const preview of clipboardPreviews)preview.recheck();clearTimeout(timer);timer=setTimeout(()=>refresh().catch(e=>status.textContent=e.message),70);}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes['gather.workspace.v1']||area==='session')schedule();});window.addEventListener('focus',schedule);if(globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.onmessage=schedule;window.addEventListener('pagehide',()=>channel.close());}
let pending=(await chrome.storage.session.get('gather.caseSelection'))['gather.caseSelection'];if(pending&&!panel){await chrome.storage.session.remove('gather.caseSelection');pending.text='';pending=null;}
refresh().catch(e=>status.textContent=e.message);

document.getElementById('openCaseStart')?.addEventListener('click',()=>startCase().catch(e=>status.textContent=e.message));
