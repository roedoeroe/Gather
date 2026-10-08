import {formerAliasButton} from './account-state-ui.js';
import {saveAccountButton,captureLookupContext} from './workspace-integration.js';
import {accountState,orderAccounts,accountSummary} from './account-state.js';
import {parseInput, extractId, formatIds, formatDetails, accountTitle, LABELS, suppliedIds, idCheck, isCopyableId, applyLookup} from './core.js';
import {resolveProfile, isExtension, closeOwnedTabs} from './resolver.js';
import {storage, recentBatches, loadBatch, saveBatch, removeBatch, flushSavedBatch} from './batches.js';
import {clearHistoryDialog} from './history-ui.js';
import {historyEpoch,saveLookupDraft,HISTORY_EPOCH_KEY} from './batches.js';
import {notesInfo, parseNotes} from './profile-status.js';
import {recoverPastedLinks} from './paste.js';
import {patchPreferences, onPreferencesChanged} from './preferences.js';

const $ = id => document.getElementById(id);
let parsed = parseInput(''), batch = null, busy = false, controller = null, sourceEntry = null;
let saveQueue = Promise.resolve(), saveFailed = false, readOnly = false, releaseLock = null;
let toastTimer, draftTimer, titleTimer, transitioning = false, persistedId = null;
let notesEntry = null, pageEpoch='';
const dateLabel = time => new Date(time).toLocaleString(undefined, {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const entries = () => batch?.entries || [];
function notify(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
  toastTimer = setTimeout(() => $('toast').hidden = true, 4500);
}
function detailsOutput() { return formatDetails(entries(),null,{includeNames:$('includeNames').checked}); }
function output() { return $('copyMode').value === 'ids' ? formatIds(entries(),null,$('separator').value) : detailsOutput(); }
async function copyText(text, message = 'Copied to clipboard') {
  const epoch=pageEpoch;
  if (!text) {notify('No checked IDs to copy yet. Account details keeps all supplied IDs.');return false;}
  try { await navigator.clipboard.writeText(text); notify(message); return true; }
  catch {
    if(epoch!==pageEpoch)return false;
    $('copyText').value=text;
    if(!$('copyDialog').open)$('copyDialog').showModal();
    $('copyText').focus();$('copyText').select();
    return false;
  }
}
async function copyBatch(automatic=false) {
  const eligible=entries().filter(isCopyableId), missing=entries().length-eligible.length;
  const count=new Set(eligible.map(e=>e.platform+':'+e.id)).size, repeats=eligible.length-count;
  const ids=$('copyMode').value==='ids';
  const suffix=ids?(missing?' · '+missing+' unchecked accounts excluded':'')+(repeats?' · '+repeats+' repeated IDs removed':''):'';
  const amount=ids?count+' ID'+(count===1?'':'s'):entries().length+' account'+(entries().length===1?'':'s');
  await copyText(output(), (automatic ? 'Auto-copied ' : 'Copied ') + amount + suffix);
}
async function acquireBatch(id) {
  releaseLock?.(); releaseLock = null;
  if (!navigator.locks) return true;
  return new Promise(resolve => {
    navigator.locks.request('gather-batch-'+id, {ifAvailable:true}, async lock => {
      if (!lock) {resolve(false); return;}
      await new Promise(release => {releaseLock=release;resolve(true);});
    }).catch(()=>resolve(false));
  });
}
function persist() {
  if (!batch || readOnly) return saveQueue;
  batch.updatedAt=Date.now();
  const snapshot=structuredClone(batch); $('saveStatus').textContent='Saving locally…';
  saveQueue=saveQueue.catch(()=>{}).then(async()=>{
    try {
      await saveBatch(snapshot);
      if(batch?.id===snapshot.id){saveFailed=false;persistedId=snapshot.id;$('saveStatus').textContent='Saved in this browser';$('saveStatus').classList.remove('save-error');}
    }catch(error){
      if(batch?.id===snapshot.id){saveFailed=true;$('saveStatus').textContent='Not saved · '+error.message;$('saveStatus').classList.add('save-error');}
    }
  });
  return saveQueue;
}
function renderInput() {
  parsed=parseInput($('links').value);
  const n=parsed.entries.length;
  $('inputCount').textContent=n ? n+' account'+(n===1?'':'s')+(parsed.duplicates?' · '+parsed.duplicates+' duplicates merged':'')+(parsed.ignoredCount?' · extra text ignored':'') : $('links').value.trim()?'No supported profile links found':'Commas, spaces, or new lines';
  $('start').disabled=!n||transitioning||busy;
  $('invalidDetails').hidden=!parsed.invalid.length;
  $('invalidSummary').textContent=parsed.invalid.length+' items will be skipped';
  $('invalidList').replaceChildren();
  for(const item of parsed.invalid){const li=document.createElement('li');li.textContent=item.input+' — '+item.error;$('invalidList').append(li);}
}
function saveDraft() {
  clearTimeout(draftTimer);
  const value=$('links').value,epoch=pageEpoch;
  draftTimer=setTimeout(()=>saveLookupDraft('gather.draft',value,epoch).catch(()=>$('draftStatus').textContent='Draft could not be saved in this browser.'),180);
}
function renderResults() {
  if(!batch)return;
  document.body.classList.toggle('omit-display-names',$('copyMode').value==='details'&&!$('includeNames').checked);
  const rows=entries(), resolved=rows.filter(e=>e.status==='resolved').length, unfinished=rows.filter(e=>!['resolved','gone'].includes(e.status)).length;
  const needsReview=rows.filter(e=>['mismatch','conflict','unverified'].includes(idCheck(e).state)).length;
  $('summary').textContent=busy ? resolved+' of '+rows.length+' found · Looking up…' : accountSummary(rows)+(needsReview?' · '+needsReview+(needsReview===1?' ID needs checking':' IDs need checking'):'');
  $('copyAll').disabled=busy||!rows.length||($('copyMode').value==='ids'&&!rows.some(isCopyableId));
  $('copyAll').textContent=$('copyMode').value==='ids'?'Copy IDs':'Copy list';
  $('separator').hidden=$('copyMode').value!=='ids';
  $('namesOption').hidden=$('copyMode').value!=='details';
  $('stop').hidden=!busy;$('stop').disabled=Boolean(controller?.signal.aborted);$('stop').textContent=controller?.signal.aborted?'Stopping…':'Stop';
  $('retry').hidden=busy||readOnly||!unfinished;
  $('recheck').hidden=busy||readOnly||!resolved;
  $('newBatch').disabled=busy;$('recentButton').disabled=busy;
  $('batchTitle').disabled=readOnly;$('browserFallback').disabled=busy;
  $('download').disabled=busy;
  $('issuesButton').hidden=!batch?.invalid?.length;
  $('issuesButton').textContent=(batch?.invalid?.length||0)+' items skipped — view';
  const list=$('accountList'), scroll=list.scrollTop;list.replaceChildren();
  let goneHeading=false,unknownHeading=false;for(const entry of orderAccounts(rows)){
    const gone=accountState(entry)==='GONE';if(!busy&&accountState(entry)==='UNKNOWN_TECHNICAL'&&!unknownHeading){const heading=document.createElement('li');heading.className='row-issue';heading.textContent='Could not determine — review';list.append(heading);unknownHeading=true;}if(gone&&!goneHeading){const heading=document.createElement('li');heading.className='quiet';heading.textContent='Accounts no longer available';list.append(heading);goneHeading=true;}
    const li=document.createElement('li');li.className='account-row';
    const check=idCheck(entry), supplied=suppliedIds(entry), annotation=notesInfo(entry);
    const content=document.createElement('div');content.className='account-content';
    const name=document.createElement('div');name.className='account-name';
    const caption=document.createElement('span');caption.className='name-caption';caption.textContent='Display name:  ';
    name.append(caption,document.createTextNode(entry.displayName||entry.suppliedName||(entry.status==='loading'?'Finding…':'Unavailable')));
    if(!entry.displayName&&entry.suppliedName){const note=document.createElement('span');note.className='name-note';note.textContent='Supplied · not checked';name.append(note);}
    const linkLine=document.createElement('div');linkLine.className='link-line';
    const link=document.createElement('a');link.className='account-link';link.textContent=entry.originalUrl||entry.url;
    link.href=/^https?:\/\//i.test(entry.originalUrl||'')?entry.originalUrl:'https://'+(entry.originalUrl||entry.url.replace(/^https:\/\//,''));
    link.target='_blank';link.rel='noopener noreferrer';link.title=link.textContent;
    linkLine.append(link);
    if(annotation.notes.length){const note=document.createElement('span');note.className='account-notes';note.textContent=' '+annotation.notes.join(' ');note.title=statusDescription(annotation);linkLine.append(note);}
    content.append(name,linkLine);
    if(supplied.length&&check.state!=='matched'){
      const given=document.createElement('div');given.className='supplied-line';
      const label=document.createElement('span');label.className='id-caption';label.textContent=check.state==='corrected'?'Previously supplied: ':supplied.length>1?'Supplied IDs: ':'Supplied ID: ';
      const value=document.createElement('span');value.className='supplied-value';value.textContent=supplied.join(', ');given.append(label,value);content.append(given);
    }
    const idLine=document.createElement('div');idLine.className='id-line';
    const idLabel=document.createElement('span');idLabel.className='id-caption';idLabel.textContent=supplied.length&&!['matched','corrected'].includes(check.state)?(entry.verificationSource==='url'?'URL ID':'Found ID'):'User ID';
    const value=document.createElement('span');value.className='id-value';
    value.textContent=entry.status==='resolved'?entry.id:entry.status==='loading'?'Finding…':entry.status==='ready'?'Waiting…':entry.status==='stopped'?'Stopped':'Not found';
    if(entry.status!=='resolved')value.classList.add('unresolved');
    idLine.append(idLabel,value);
    if(isCopyableId(entry)){
      const copy=document.createElement('button');copy.className='copy-id';copy.textContent='Copy';copy.title='Copy just this user ID';copy.setAttribute('aria-label','Copy user ID for '+accountTitle(entry));
      copy.addEventListener('click',()=>copyText(entry.id,'User ID copied'));idLine.append(copy);
    }
    if(!gone&&(!supplied.length||['resolved','ready','loading'].includes(entry.status)))content.append(idLine);if(gone){const info=document.createElement('p');info.className='quiet';info.textContent='Gone · '+(entry.handle?'Former / supplied username: @'+entry.handle:'Profile unavailable');content.append(info);}
    if(check.label){
      const status=document.createElement('div');status.className='id-check '+check.state;status.textContent=check.label;
      if(entry.verifiedAt&&entry.status==='resolved')status.title='Checked '+dateLabel(entry.verifiedAt);
      if(!busy&&!readOnly&&['mismatch','conflict'].includes(check.state)&&entry.status==='resolved'&&entry.verifiedAt&&['live','source'].includes(entry.verificationSource)){
        const accept=document.createElement('button');accept.className='text-button accept-id';accept.textContent='Use found ID';
        accept.addEventListener('click',async()=>{entry.reviewedId=entry.id;renderResults();await persist();notify('Found ID selected. Your supplied ID is kept for reference.');if($('autoCopy').checked)await copyBatch(true);});status.append(accept);
      }
      if(check.state==='matched')idLine.append(status);else content.append(status);
    }
    if(entry.status==='resolved'&&entry.directId===entry.id&&!entry.verifiedAt){
      const origin=document.createElement('p');origin.className='note-context';origin.textContent='ID from link · page not verified';content.append(origin);
    }
    if(annotation.hint){const hint=document.createElement('p');hint.className='note-context';hint.textContent=annotation.hint;content.append(hint);}
    if(['error','stopped'].includes(entry.status)){
      const issue=document.createElement('p');issue.className='row-issue';issue.textContent=entry.message||'Retry to finish this account.';
      if(entry.id)issue.textContent+=' Previous ID: '+entry.id+' (not rechecked).';
      content.append(issue);
    }
    const tools=document.createElement('div');tools.className='row-tools';
    const platform=document.createElement('span');platform.className='platform-tag';platform.textContent=LABELS[entry.platform];tools.append(platform);
    const editNotes=document.createElement('button');editNotes.className='text-button notes-button';editNotes.textContent='Notes';editNotes.disabled=busy;editNotes.setAttribute('aria-label','Edit notes for '+(entry.handle||entry.directId));editNotes.addEventListener('click',()=>openNotes(entry));tools.append(editNotes);
    if(!busy&&!readOnly&&(entry.status==='error'||entry.status==='stopped'||['mismatch','conflict','unverified'].includes(check.state)||annotation.warning||(!entry.displayName&&entry.nameChecked))){
      const source=document.createElement('button');source.className='text-button';source.textContent='Source';source.setAttribute('aria-label','Import source for '+(entry.handle||entry.directId));
      source.addEventListener('click',()=>openSource(entry));tools.append(source);
    }
    if(gone&&!busy&&isExtension&&entry.handle)tools.append(formerAliasButton(entry,batch?.lookupContext,notify));
    if(!busy&&isExtension)tools.append(saveAccountButton(entry,notify,batch?.lookupContext));
    li.append(content,tools);list.append(li);
  }
  list.scrollTop=scroll;
}
function showResults(){
  $('inputView').hidden=true;$('resultsView').hidden=false;
  $('batchTitle').value=batch.title||'';
  $('batchDate').textContent=dateLabel(batch.createdAt)+' · '+batch.entries.length+' accounts';
  $('saveStatus').textContent=readOnly?'Open in another tab · read-only here':persistedId===batch.id?'Saved in this browser':'Saving locally…';
  $('saveStatus').classList.toggle('save-error',saveFailed);
  renderResults();
}
async function canLeave(){
  clearTimeout(titleTimer);await persist();
  return !saveFailed||confirm('This batch could not be saved. Copy or download it first if you need it. Leave this batch anyway?');
}
async function newBatch(){
  if(busy||transitioning)return;
  transitioning=true;
  try {
  if(batch&&!await canLeave())return;
  releaseLock?.();releaseLock=null;batch=null;readOnly=false;saveFailed=false;
  $('links').value='';$('draftStatus').textContent='';$('resultsView').hidden=true;$('inputView').hidden=false;
  history.replaceState(null,'',location.pathname);
  $('recentButton').disabled=false;renderInput();saveDraft();$('links').focus();
  } finally {transitioning=false;}
}
async function startBatch(){
  if(busy||transitioning||!parsed.entries.length)return;
  transitioning=true;$('start').disabled=true;
  try {
  const epoch=pageEpoch,lookupContext=await captureLookupContext();
  if(epoch!==pageEpoch)throw new Error('History was cleared. Start again.');
  batch={historyEpoch:epoch,...(lookupContext?{lookupContext}:{}),id:crypto.randomUUID(),title:'',createdAt:Date.now(),updatedAt:Date.now(),entries:structuredClone(parsed.entries),invalid:parsed.invalid,duplicates:parsed.duplicates};
  readOnly=!await acquireBatch(batch.id);saveFailed=false;showResults();await persist();
  clearTimeout(draftTimer);await saveLookupDraft('gather.draft',null,epoch).catch(()=>{});
  await runBatch(false);
  } catch(error){notify(error.message);} finally {transitioning=false;}
}
async function runBatch(force=false){
  if(busy||!batch||readOnly)return;
  busy=true;controller=new AbortController();const signal=controller.signal;
  const queue=entries().filter(e=>force||!['resolved','gone'].includes(e.status)||e.status!=='gone'&&!e.displayName&&!e.nameChecked);
  for(const e of queue){e.status='ready';e.message='';e.verifiedAt=null;e.verificationSource='';e.reviewedId='';e.displayName='';e.nameWarning='';e.profileStatus=null;}
  renderResults();persist();
  async function worker(){
    while(queue.length&&!signal.aborted){
      const entry=queue.shift();entry.status='loading';entry.message='Looking up account…';renderResults();persist();
      try{
        const result=await resolveProfile(entry,{signal,browserFallback:$('browserFallback').checked,includeName:true,onStage:message=>{entry.message=message;}});
        if(signal.aborted)throw new DOMException('Stopped','AbortError');
        applyLookup(entry,result);
      }catch(error){entry.status=signal.aborted?'stopped':'error';entry.message=signal.aborted?'Lookup stopped. Retry to finish.':error.message;}
      renderResults();persist();
    }
  }
  try{await Promise.all([worker(),worker()]);}
  finally{
    for(const e of queue){e.status='stopped';e.message='Lookup stopped. Retry to finish.';}
    await closeOwnedTabs();busy=false;controller=null;renderResults();renderInput();await persist();
  }
  if(!signal.aborted&&$('autoCopy').checked)await copyBatch(true);
}
$('clearLookupHistory').addEventListener('click',()=>clearHistoryDialog().catch(e=>notify(e.message)));
async function openRecent(){
  if(busy||transitioning)return;
  transitioning=true;
  try {
  if(batch&&!await canLeave())return;
  const epoch=pageEpoch;
  const list=$('historyList');list.replaceChildren();$('recentDialog').showModal();
  let history;
  try{history=await recentBatches();}catch{list.textContent='History could not be read from this browser.';return;}
  if(!history.length){list.textContent='No saved batches yet. Your first list will appear here.';return;}
  if(epoch!==pageEpoch)return;
  for(const saved of history){
    const row=document.createElement('div');row.className='history-row';
    const open=document.createElement('button');open.className='history-open';
    const title=document.createElement('strong');title.textContent=saved.title||'Batch · '+dateLabel(saved.createdAt);
    const detail=document.createElement('span');detail.textContent=(saved.title?dateLabel(saved.createdAt)+' · ':'')+saved.entries.length+' accounts · '+saved.entries.filter(e=>e.status==='resolved').length+' found';
    open.append(title,detail);open.addEventListener('click',async()=>{
      if(transitioning)return;
      transitioning=true;
      try {
        if(batch?.id!==saved.id||readOnly)readOnly=!await acquireBatch(saved.id);
        const fresh=await loadBatch(saved.id);
        if(epoch!==pageEpoch){releaseLock?.();releaseLock=null;return;}
        if(!fresh){throw new Error('This batch is no longer available.');}
        batch=fresh;persistedId=fresh.id;saveFailed=false;$('recentDialog').close();showResults();
        if(readOnly)notify('Open in another tab. Reopen from Recent batches after closing that tab to edit here.');
      }catch{
        releaseLock?.();releaseLock=null;readOnly=true;renderResults();
        if(batch)$('saveStatus').textContent='Reopen this batch from Recent batches to continue editing.';
        notify('Could not reopen this batch. It may have been removed. Open Recent batches again.');
      }
      finally{transitioning=false;}
    });
    const remove=document.createElement('button');remove.className='history-delete';remove.textContent='Delete';remove.setAttribute('aria-label','Delete '+(saved.title||'batch from '+dateLabel(saved.createdAt)));
    remove.addEventListener('click',async()=>{
      if(!confirm('Delete this saved batch from this browser?'))return;
      try{
        if(saved.id===batch?.id&&!readOnly)await removeBatch(saved.id);
        else if(navigator.locks){
          let removed=false;
          await navigator.locks.request('gather-batch-'+saved.id,{ifAvailable:true},async lock=>{if(lock){await removeBatch(saved.id);removed=true;}});
          if(!removed){notify('This batch is open in another tab. Close it before deleting.');return;}
        }else await removeBatch(saved.id);
        if(batch?.id===saved.id){releaseLock?.();releaseLock=null;batch=null;readOnly=false;$('resultsView').hidden=true;$('inputView').hidden=false;$('links').value='';window.history.replaceState(null,'',location.pathname);renderInput();}
        row.remove();if(!list.children.length)list.textContent='No saved batches yet.';
      }catch{notify('Could not delete this batch. Try again.');}
    });
    row.append(open,remove);list.append(row);
  }
  } finally {transitioning=false;}
}
function insertInputText(text,replaceAll=false){
  const input=$('links');input.focus();if(replaceAll)input.select();
  if(!document.execCommand('insertText',false,text)){
    input.setRangeText(text,input.selectionStart,input.selectionEnd,'end');renderInput();saveDraft();
  }
}
function statusDescription(annotation){
  const status=annotation.observed;
  if(status.conflicted)return 'The page returned conflicting status data. Your notes are kept.';
  if(status.privacy==='private')return 'The page reports a private or locked profile. Hidden posts are not treated as empty.';
  if(status.content==='empty')return 'The page explicitly reports zero public posts or uploads.';
  if(status.content==='has-posts')return 'The page reports '+status.postCount+' posts or uploads.';
  if(status.privacy==='public')return 'The page reports a public profile. Its post count is unavailable.';
  return 'The page did not provide enough information to check private or empty status.';
}
function openNotes(entry){
  notesEntry=entry;$('notesText').value=(entry.notes||[]).join(' ');$('usePageStatus').checked=entry.usePageStatus!==false;
  $('notesText').readOnly=readOnly;$('usePageStatus').disabled=readOnly;$('saveNotes').hidden=readOnly;
  $('notesProfile').textContent=entry.originalUrl||entry.url;$('notesDetected').textContent=statusDescription(notesInfo(entry));
  $('notesDialog').showModal();$('notesText').focus();
}
function openSource(entry){
  sourceEntry=entry;$('sourceLink').href=entry.url;$('sourceLink').textContent=entry.originalUrl||entry.url;
  $('sourceText').value='';$('sourceMessage').textContent=entry.message||entry.nameWarning||'';
  $('sourceDialog').showModal();$('sourceText').focus();
}
function savePreferences(patch){
  patchPreferences(patch).catch(()=>notify('Preferences could not be saved.'));
}
function applyPreferences(prefs={}){
  if(['details','ids'].includes(prefs.copyMode))$('copyMode').value=prefs.copyMode;
  if(['newline','comma','space'].includes(prefs.separator))$('separator').value=prefs.separator;
  if(typeof prefs.autoCopy==='boolean')$('autoCopy').checked=prefs.autoCopy;
  if(typeof prefs.browserFallback==='boolean')$('browserFallback').checked=prefs.browserFallback;
  $('includeNames').checked=prefs.includeNames!==false;
}
$('links').addEventListener('input',()=>{renderInput();saveDraft();});
$('links').addEventListener('paste',event=>{
  const data=event.clipboardData;if(!data)return;
  const plain=data.getData('text/plain');
  const recovered=recoverPastedLinks(data.getData('text/html'),plain);
  const text=recovered??plain, input=$('links');
  if(input.value.length-(input.selectionEnd-input.selectionStart)+text.length>100000){event.preventDefault();notify('This paste is too large. Split it into smaller lists under 100,000 characters.');return;}
  if(recovered===null)return;
  event.preventDefault();
  // insertText preserves the browser's native Undo history for the paste.
  insertInputText(text);
});
$('links').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!$('start').disabled){event.preventDefault();startBatch();}});
$('start').addEventListener('click',startBatch);
$('newBatch').addEventListener('click',newBatch);
$('recentButton').addEventListener('click',openRecent);
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
$('copyAll').addEventListener('click',()=>copyBatch());
$('copyMode').addEventListener('change',()=>{renderResults();savePreferences({copyMode:$('copyMode').value});});
$('separator').addEventListener('change',()=>savePreferences({separator:$('separator').value}));
$('includeNames').addEventListener('change',()=>{renderResults();savePreferences({includeNames:$('includeNames').checked});});
$('autoCopy').addEventListener('change',()=>savePreferences({autoCopy:$('autoCopy').checked}));
$('browserFallback').addEventListener('change',()=>savePreferences({browserFallback:$('browserFallback').checked}));
onPreferencesChanged(prefs=>{applyPreferences(prefs);if(batch)renderResults();});
$('retry').addEventListener('click',()=>runBatch(false));
$('recheck').addEventListener('click',()=>runBatch(true));
$('stop').addEventListener('click',()=>{controller?.abort();$('stop').disabled=true;});
$('batchTitle').addEventListener('input',()=>{
  if(!batch||readOnly)return;batch.title=$('batchTitle').value;clearTimeout(titleTimer);
  titleTimer=setTimeout(persist,200);
});
$('issuesButton').addEventListener('click',()=>{
  $('issuesList').replaceChildren();
  for(const item of batch.invalid){const li=document.createElement('li');li.textContent=item.input+' — '+item.error;$('issuesList').append(li);}
  $('issuesDialog').showModal();
});
$('saveNotes').addEventListener('click',async()=>{
  if(!notesEntry||readOnly||busy)return;
  notesEntry.notes=parseNotes($('notesText').value);notesEntry.usePageStatus=$('usePageStatus').checked;
  $('notesDialog').close();renderResults();await persist();notify('Notes saved');
  if($('autoCopy').checked)await copyBatch(true);
});
$('notesDialog').addEventListener('close',()=>{notesEntry=null;});
$('extractSource').addEventListener('click',async()=>{
  if(!sourceEntry||readOnly)return;
  const result=extractId($('sourceText').value,sourceEntry);
  if(!result.id){$('sourceMessage').textContent=result.error;return;}
  applyLookup(sourceEntry,{...result,method:'Imported source · '+result.method},'source');
  $('sourceDialog').close();renderResults();await persist();notify('Account extracted');
  if($('autoCopy').checked)await copyBatch(true);
});
$('sourceDialog').addEventListener('close',()=>{sourceEntry=null;$('sourceText').value='';});
$('uploadButton').addEventListener('click',()=>$('uploadFile').click());
$('uploadFile').addEventListener('change',async()=>{
  const file=$('uploadFile').files[0];$('uploadFile').value='';
  if(!file)return;
  if(file.size>100000){notify('Please use a text list under 100 KB.');return;}
  if(busy||transitioning||$('inputView').hidden)return;
  transitioning=true;$('start').disabled=true;$('uploadButton').disabled=true;$('links').readOnly=true;
  const epoch=pageEpoch;
  try{const text=await file.text();if(epoch!==pageEpoch)throw new Error('History was cleared');if(text.includes('\0'))throw Error('binary');$('links').readOnly=false;insertInputText(text,true);}
  catch{notify('Could not read this file. Use a plain .txt, .csv, or .tsv list.');}
  finally{transitioning=false;$('links').readOnly=false;$('uploadButton').disabled=false;renderInput();}
});
$('download').addEventListener('click',()=>{
  if(!batch)return;
  const title=batch.title||'Gather batch';
  const text='Batch: '+title+'\nSaved: '+new Date(batch.updatedAt||batch.createdAt).toLocaleString()+'\n\n'+detailsOutput();
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=title.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').slice(0,80)+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.addEventListener('beforeunload',event=>{
  clearTimeout(titleTimer);
  if(batch&&!readOnly&&persistedId===batch.id)flushSavedBatch(batch).catch(()=>{});
  if(!$('inputView').hidden){clearTimeout(draftTimer);saveLookupDraft('gather.draft',$('links').value,pageEpoch).catch(()=>{});}
  controller?.abort();closeOwnedTabs();
  if(saveFailed){event.preventDefault();event.returnValue='';}
});
$('copyDialog').addEventListener('close',()=>{$('copyText').value='';});
async function init(){
  if(!isExtension)$('previewNotice').hidden=false;
  try{
    pageEpoch=await historyEpoch();
    const prefs=(await storage.get('gather.prefs'))['gather.prefs'];
    applyPreferences(prefs);
    const draft=(await storage.get('gather.draft'))['gather.draft'];
    if(typeof draft==='string'&&!$('links').value){$('links').value=draft.slice(0,100000);if(draft)$('draftStatus').textContent='Unsubmitted draft restored.';}
    const requested=new URL(location.href).searchParams.get('batch');
    if(requested&&/^[\w-]{1,80}$/.test(requested)){
      readOnly=!await acquireBatch(requested);
      const saved=await loadBatch(requested);
      if(saved){batch=saved;persistedId=saved.id;showResults();}
      else{releaseLock?.();releaseLock=null;readOnly=false;notify('That saved batch is no longer available.');}
    }
  }catch{$('draftStatus').textContent='Local history is unavailable. You can still find and copy IDs.';}
  renderInput();
}
if(isExtension)chrome.storage.onChanged.addListener((changes,area)=>{
  if(area!=='local')return;
  if(!changes[HISTORY_EPOCH_KEY]&&!(batch&&changes['gather.batch.'+batch.id]?.newValue===null))return;
  if(changes[HISTORY_EPOCH_KEY])pageEpoch=changes[HISTORY_EPOCH_KEY].newValue||'';
  controller?.abort();clearTimeout(draftTimer);clearTimeout(titleTimer);batch=null;persistedId=null;saveFailed=false;readOnly=false;releaseLock?.();releaseLock=null;
  for(const d of document.querySelectorAll('dialog[open]'))d.close();
  for(const id of ['links','copyText','sourceText','notesText','batchTitle'])$(id).value='';
  $('accountList').replaceChildren();$('historyList')?.replaceChildren();$('resultsView').hidden=true;$('inputView').hidden=false;
  history.replaceState(null,'',location.pathname);renderInput();notify('Local lookup data removed.');
});
init();

