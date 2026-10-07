import {parseInput, normalizeProfile, formatIds, formatDetails, accountTitle, suppliedIds, idCheck, isCopyableId} from './core.js';
import {notesInfo} from './profile-status.js';
import {recoverPastedLinks} from './paste.js';
import {patchPreferences, onPreferencesChanged} from './preferences.js';

const $ = id => document.getElementById(id);
// Viewport-relative height feeds back into Chrome's popup auto-sizing. Use the
// screen instead, leaving space for the browser toolbar on smaller displays.
document.documentElement.style.setProperty('--panel-limit',Math.max(360,Math.min(580,screen.availHeight-120))+'px');
let state = {batch:null,busy:false}, submitting=false, initialized=false, requestNumber=0, appliedNumber=0;
let currentPage='', currentTabId=null, pageRequest=0, checkingPage=false, lastRun=null, messageTimer, inputDirty=false, copying=false, prefsPending=Promise.resolve();
const entries = () => state.batch?.entries || [];
async function send(message) {
  const result = await chrome.runtime.sendMessage(message);
  if (!result || result.error) throw new Error(result?.error || 'Reload Gather from your browser’s Extensions page and try again.');
  return result;
}
function notice(message, success=false) {
  clearTimeout(messageTimer);$('quickMessage').textContent=message;$('quickMessage').hidden=false;
  $('quickMessage').classList.toggle('success',success);
  if(success)messageTimer=setTimeout(()=>{$('quickMessage').hidden=true;},4000);
}
function renderInput() {
  const parsed=parseInput($('quickLinks').value), count=parsed.entries.length;
  $('quickCount').textContent=count?count+' account'+(count===1?'':'s')+(parsed.duplicates?' · duplicates merged':'')+(parsed.invalid.length?' · '+parsed.invalid.length+' items skipped':''): $('quickLinks').value.trim()?'No supported profile links found':'Instagram, Facebook, Threads, TikTok, YouTube';
  renderSummary();
  $('getIds').disabled=!initialized||submitting||state.busy||checkingPage||!count;
  $('getIds').textContent=state.busy?'Getting UserIDs…':'Get UserIDs';
  $('quickLinks').readOnly=submitting||state.busy||checkingPage;
  $('usePage').disabled=!initialized||submitting||state.busy||checkingPage||!currentPage;
}
function line(className, text) { const el=document.createElement('div');el.className=className;el.textContent=text;return el; }
function renderSummary() {
  const rows=entries(), n=rows.filter(e=>e.status==='resolved').length;
  const previous=!state.busy&&$('quickLinks').value.trim()!==''&&state.submittedInput!==null&&state.submittedInput!==undefined&&$('quickLinks').value!==state.submittedInput;
  $('quickSummary').textContent=(previous?'Previous results · ':'')+(state.busy?n+' of '+rows.length+' found · Looking up…':n+' of '+rows.length+' found'+(state.interrupted?' · Interrupted':''));
}
function render() {
  document.body.classList.toggle('omit-display-names',$('quickMode').value==='details'&&!$('quickNames').checked);
  renderInput();const rows=entries();
  $('quickResults').hidden=!rows.length;document.body.classList.toggle('has-results',Boolean(rows.length));
  $('stopQuick').hidden=!state.busy;$('stopQuick').disabled=state.stopping||submitting;$('stopQuick').textContent=state.stopping?'Stopping…':'Stop';
  $('retryQuick').hidden=state.busy||!rows.some(e=>e.status!=='resolved');$('retryQuick').disabled=submitting;
  const ids=$('quickMode').value==='ids';$('quickSeparator').hidden=!ids;
  $('quickNamesOption').hidden=ids;
  $('copyQuick').textContent=ids?'Copy IDs':'Copy list';$('copyQuick').disabled=submitting||state.busy||!rows.length||(ids&&!rows.some(isCopyableId));
  $('quickSaved').textContent=state.warning||(state.batch?.invalid?.length?state.batch.invalid.length+' items skipped · Review in the full tool.':'Saved in Recent batches · Edit notes in the full tool.');
  const list=$('quickList'),scroll=list.scrollTop;list.replaceChildren();
  for(const entry of rows) {
    const row=document.createElement('li');row.className='account-row';
    const name=line('account-name','');const caption=document.createElement('span');caption.className='name-caption';caption.textContent='Display name:  ';
    name.append(caption,document.createTextNode(entry.displayName||entry.suppliedName||(entry.status==='loading'?'Finding…':'Unavailable')));row.append(name);
    if(!entry.displayName&&entry.suppliedName)row.append(line('name-note','Supplied · not checked'));
    const annotation=notesInfo(entry),linkLine=line('link-line',''),link=document.createElement('a');
    link.className='account-link';link.textContent=entry.originalUrl||entry.url;link.href=/^https?:\/\//i.test(entry.originalUrl||'')?entry.originalUrl:'https://'+(entry.originalUrl||entry.url.replace(/^https:\/\//,''));link.target='_blank';link.rel='noopener noreferrer';linkLine.append(link);
    if(annotation.notes.length){const note=document.createElement('span');note.className='account-notes';note.textContent=' '+annotation.notes.join(' ');linkLine.append(note);}row.append(linkLine);
    const check=idCheck(entry),provided=suppliedIds(entry);
    if(provided.length&&check.state!=='matched')row.append(line('supplied-line',(check.state==='corrected'?'Previously supplied: ':provided.length>1?'Supplied IDs: ':'Supplied ID: ')+provided.join(', ')));
    const idLine=line('id-line',''),label=document.createElement('span');label.className='id-caption';label.textContent=provided.length&&!['matched','corrected'].includes(check.state)?'Found ID':'User ID';
    const value=document.createElement('span');value.className='id-value';value.textContent=entry.status==='resolved'?entry.id:entry.status==='loading'?'Finding…':entry.status==='ready'?'Waiting…':entry.status==='stopped'?'Stopped':'Not found';idLine.append(label,value);
    if(isCopyableId(entry)){const copy=document.createElement('button');copy.className='copy-id';copy.textContent='Copy';copy.setAttribute('aria-label','Copy user ID for '+accountTitle(entry));copy.addEventListener('click',()=>copyText(entry.id,'User ID copied'));idLine.append(copy);}row.append(idLine);
    if(check.label){
      const status=line('id-check '+check.state,check.label);
      if(entry.verifiedAt)status.title='Checked '+new Date(entry.verifiedAt).toLocaleString();
      if(!state.busy&&['mismatch','conflict'].includes(check.state)&&entry.status==='resolved'&&entry.verifiedAt&&['live','source'].includes(entry.verificationSource)){
        const accept=document.createElement('button');accept.className='text-button accept-id';accept.textContent='Use found ID';accept.disabled=submitting;
        accept.addEventListener('click',()=>act({type:'quick.accept',batchId:state.batch.id,key:entry.key,id:entry.id},true));status.append(accept);
      }row.append(status);
    }
    if(entry.status==='resolved'&&entry.directId===entry.id&&!entry.verifiedAt)row.append(line('note-context','ID from link · page not verified'));
    if(annotation.hint)row.append(line('note-context',annotation.hint));
    if(['error','stopped'].includes(entry.status))row.append(line('row-issue',entry.message||'Open the profile, sign in if needed, then retry.'));
    list.append(row);
  }
  list.scrollTop=scroll;
}
async function copyText(text, message) {
  if(!text){notice('No checked IDs to copy yet. Account details keeps supplied IDs.');return false;}
  try {await navigator.clipboard.writeText(text);notice(message,true);return true;}
  catch {
    $('quickCopyText').value=text;$('manualCopy').hidden=false;document.body.classList.add('has-manual');
    $('quickCopyText').focus();$('quickCopyText').select();
    return false;
  }
}
async function copyAll(automatic=false) {
  const ids=$('quickMode').value==='ids', eligible=entries().filter(isCopyableId);
  const count=ids?new Set(eligible.map(e=>e.platform+':'+e.id)).size:entries().length, excluded=entries().length-eligible.length;
  const text=ids?formatIds(entries(),null,$('quickSeparator').value):formatDetails(entries(),null,{includeNames:$('quickNames').checked});
  const batchId=state.batch?.id;
  if(await copyText(text,(automatic?'Auto-copied ':'Copied ')+count+(ids?' ID':' account')+(count===1?'':'s')+(ids&&excluded?' · '+excluded+' unchecked excluded':''))) {
    await send({type:'quick.copied',batchId}).catch(()=>{});
  }
}
async function refresh(restore=false) {
  const number=++requestNumber;
  try {
    const next=await send({type:'quick.state'});
    if(number<appliedNumber)return;appliedNumber=number;
    const finished=lastRun===next.batch?.id&&!next.busy&&state.busy;
    const clearCompleted=state.busy&&!next.busy&&next.input===''&&$('quickLinks').value===next.submittedInput;
    state=next;
    if((restore&&!inputDirty)||clearCompleted){$('quickLinks').value=next.input;inputDirty=false;}
    if(next.busy)lastRun=next.batch?.id;
    initialized=true;render();
    if(clearCompleted&&$('manualCopy').hidden)$('quickLinks').focus();
    if(!copying&&$('quickAuto').checked&&(next.copyPending||finished)&&!next.interrupted&&!next.stopping&&entries().every(e=>e.status!=='stopped')){
      copying=true;try{await copyAll(true);}finally{copying=false;}
    }
  }catch(error){notice(error.message);}
}
async function act(message, copyAfter=false) {
  if(submitting)return;
  const number=++requestNumber;
  submitting=true;render();$('quickMessage').hidden=true;
  if(['quick.start','quick.retry'].includes(message.type))closeManual();
  try {
    await prefsPending;
    const next=await send(message);
    if(message.type==='quick.start'&&!next.busy&&next.input===''&&$('quickLinks').value===message.input){$('quickLinks').value='';inputDirty=false;}
    if(number>=appliedNumber){appliedNumber=number;state=next;}
    if(state.busy)lastRun=state.batch?.id;render();if(copyAfter&&$('quickAuto').checked)await copyAll(true);
  }
  catch(error){notice(error.message);}
  finally{submitting=false;render();await refresh();}
}
function saveDraft() {
  inputDirty=true;renderInput();send({type:'quick.draft',input:$('quickLinks').value}).catch(error=>notice('Draft could not be saved. '+error.message));
}
function insertText(text) {
  const input=$('quickLinks');input.focus();
  if(!document.execCommand('insertText',false,text)){input.setRangeText(text,input.selectionStart,input.selectionEnd,'end');saveDraft();}
}
function savePrefs(patch) {
  prefsPending=prefsPending.catch(()=>{}).then(()=>patchPreferences(patch)).catch(()=>notice('Copy settings could not be saved.'));
  return prefsPending;
}
function applyPrefs(prefs={}) {
  if(['details','ids'].includes(prefs.copyMode))$('quickMode').value=prefs.copyMode;
  if(['newline','comma','space'].includes(prefs.separator))$('quickSeparator').value=prefs.separator;
  if(typeof prefs.autoCopy==='boolean')$('quickAuto').checked=prefs.autoCopy;
  $('quickNames').checked=prefs.includeNames!==false;
}
function closeManual() {
  $('manualCopy').hidden=true;document.body.classList.remove('has-manual');$('quickCopyText').value='';
}
async function updateCurrentPage() {
  const request=++pageRequest;
  let tab, url='', hint='Open a supported profile or channel to use this';
  try {
    [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(tab?.status==='loading')hint='Wait for this page to finish loading';
    else {normalizeProfile(tab?.url);url=tab.url;hint='Find and copy IDs from '+url;}
  }catch{}
  if(request===pageRequest){currentPage=url;currentTabId=tab?.id??null;$('usePage').title=hint;renderInput();}
  return request===pageRequest?{url:currentPage,tabId:currentTabId}:null;
}
async function runCurrentPage() {
  if(submitting||state.busy||checkingPage)return;
  checkingPage=true;renderInput();
  try {
    const page=await updateCurrentPage();
    if(!page?.url){notice('This page is not a supported profile. Open a profile or paste its link.');return;}
    $('quickLinks').readOnly=false;$('quickLinks').focus();$('quickLinks').select();insertText(page.url);
    await act({type:'quick.start',input:page.url,currentTabId:page.tabId});
  }catch{notice('Could not read this page. Paste its profile link to continue.');}
  finally{checkingPage=false;renderInput();}
}
$('quickLinks').addEventListener('input',saveDraft);
$('quickLinks').addEventListener('paste',event=>{
  const clipboard=event.clipboardData;if(!clipboard||$('quickLinks').readOnly)return;
  const plain=clipboard.getData('text/plain'), recovered=recoverPastedLinks(clipboard.getData('text/html'),plain);
  const input=$('quickLinks'),text=recovered??plain;
  if(input.value.length-(input.selectionEnd-input.selectionStart)+text.length>100000){event.preventDefault();notice('This paste is too large. Split it into lists under 100,000 characters.');return;}
  if(recovered!==null){event.preventDefault();insertText(recovered);}
});
$('quickLinks').addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.isComposing||event.keyCode===229||event.altKey)return;
  if(event.shiftKey&&!event.ctrlKey&&!event.metaKey)return;
  event.preventDefault();
  if(!event.repeat)$('getIds').click();
});
$('getIds').addEventListener('click',()=>act({type:'quick.start',input:$('quickLinks').value}));
$('stopQuick').addEventListener('click',()=>act({type:'quick.stop'}));
$('retryQuick').addEventListener('click',()=>act({type:'quick.retry',batchId:state.batch?.id}));
$('copyQuick').addEventListener('click',()=>copyAll());
$('quickMode').addEventListener('change',()=>{render();savePrefs({copyMode:$('quickMode').value});});
$('quickSeparator').addEventListener('change',()=>savePrefs({separator:$('quickSeparator').value}));
$('quickNames').addEventListener('change',()=>{render();savePrefs({includeNames:$('quickNames').checked});});
$('quickAuto').addEventListener('change',()=>savePrefs({autoCopy:$('quickAuto').checked}));
onPreferencesChanged(prefs=>{applyPrefs(prefs);render();});
$('openFull').addEventListener('click',async()=>{try{await send({type:'quick.open',batchId:state.busy?null:state.batch?.id});window.close();}catch(error){notice(error.message);}});
$('usePage').addEventListener('click',runCurrentPage);
$('closeManual').addEventListener('click',closeManual);
async function init() {
  if(!globalThis.chrome?.runtime?.id){notice('Install Gather in Chrome or Edge to use this panel.');return;}
  chrome.storage.onChanged.addListener((changes,area)=>{
    if((area==='session'&&changes.quickRun)||(area==='local'&&Object.keys(changes).some(k=>k.startsWith('gather.batch.')||k==='gather.quick')))refresh();
  });
  try {
    const prefs=(await chrome.storage.local.get('gather.prefs'))['gather.prefs']||{};
    applyPrefs(prefs);
    chrome.tabs.onUpdated.addListener((id,change)=>{if(id===currentTabId&&(change.url||change.status))updateCurrentPage();});
    chrome.tabs.onActivated.addListener(()=>updateCurrentPage());
    await updateCurrentPage();
  }catch{notice('Settings could not be restored.');}
  await refresh(true);if($('manualCopy').hidden)$('quickLinks').focus();
}
init();
