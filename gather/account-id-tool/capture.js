import {captureViewer} from './capture-viewer.js';
import {workspaceLink} from './workspace-links.js';
import {acquireCapture,cropImage,selectionBounds,CaptureStopped} from './capture-engine.js';
import {beginCapture,completeCapture,failCapture,getAsset} from './capture-store.js';
import {exportCapture,preferredCaptureAsset} from './capture-files.js';
import {request} from './workspace-client.js';
const $=id=>document.getElementById(id),abort=new AbortController();
let launch,record,result,objectURL,selecting=false,finished=false,saving=false;
const viewer=captureViewer('Saved screenshot');viewer.image.id='resultImage';$('savedPreview').append(viewer.element);
const status=text=>$('status').textContent=text;
async function release(){if(launch)await request('capture.finished',{launchId:launch.launchId}).catch(()=>{});}
async function fail(error){
  status(error.message||String(error));$('status').className='message error';
  if(record)await failCapture(record.id,{status:abort.signal.aborted?'cancelled':'failed',error:error.message}).catch(()=>{});
  finished=true;$('cancel').textContent='Close';await release();
}
async function save(details){
  if(saving)return;saving=true;$('saveSelection').disabled=true;
  try{record=await completeCapture(record.id,details);finished=true;selecting=false;$('selection').hidden=true;$('completed').hidden=false;$('cancel').hidden=true;
    $('savedState').textContent='Saved in Gather · '+(record.status==='partial'?'Partial capture':({'visible':'Visible area saved','selection':'Selected area saved','full-page':'Full page saved'}[record.mode]));
    $('limitations').textContent=record.limitations.join('\n');status(record.status==='partial'?'Partial screenshot saved — some page content could not be captured.':'Screenshot saved.');$('captureDetails').open=record.status==='partial';
    const asset=await getAsset(preferredCaptureAsset(record).id);if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(asset.blob);viewer.image.src=objectURL;
    await release();await chrome.windows.update((await chrome.windows.getCurrent()).id,{focused:true});
    if(record.automaticExport)await exportSaved();else $('exportState').textContent='Not exported to a folder.';
  }catch(error){if(!finished)await fail(error);else status(error.message);}finally{saving=false;$('saveSelection').disabled=false;}
}
async function exportSaved(){
  $('export').disabled=true;$('exportState').textContent='Saved in Gather · Exporting to Downloads…';
  try{record=await exportCapture(record.id);$('exportState').textContent='Exported to folder: '+record.export.filename;$('export').textContent='Export another copy';}
  catch(error){$('exportState').textContent='Saved in Gather · Folder export failed: '+error.message;$('export').textContent='Retry folder export';}
  finally{$('export').disabled=false;}
}
function crop(){return {x:Number($('cropX').value),y:Number($('cropY').value),width:Number($('cropWidth').value),height:Number($('cropHeight').value)};}
function paint(){const rect=crop(),scale=$('preview').clientWidth/result.dimensions.width;Object.assign($('outline').style,{display:'block',left:rect.x*scale+'px',top:rect.y*scale+'px',width:rect.width*scale+'px',height:rect.height*scale+'px'});}
function setCrop(rect){for(const [key,name] of [['x','X'],['y','Y'],['width','Width'],['height','Height']])$('crop'+name).value=Math.round(rect[key]);paint();}
let drag;
$('imageArea').onpointerdown=event=>{if(event.button!==0)return;const b=$('preview').getBoundingClientRect(),scale=result.dimensions.width/b.width;drag={x:Math.max(0,event.clientX-b.left)*scale,y:Math.max(0,event.clientY-b.top)*scale};$('imageArea').setPointerCapture(event.pointerId);};
$('imageArea').onpointermove=event=>{if(!drag)return;const b=$('preview').getBoundingClientRect(),scale=result.dimensions.width/b.width;try{setCrop(selectionBounds({...drag,width:(event.clientX-b.left)*scale-drag.x,height:(event.clientY-b.top)*scale-drag.y},result.dimensions.width,result.dimensions.height));}catch{}};
$('imageArea').onpointerup=()=>{drag=null;};$('imageArea').onpointercancel=()=>{drag=null;};
for(const id of ['cropX','cropY','cropWidth','cropHeight'])$(id).oninput=paint;window.addEventListener('resize',()=>{if(selecting)paint();});
$('cropForm').onsubmit=async event=>{event.preventDefault();try{const selected=await cropImage(result.assets[0].blob,crop());await save({...result,assets:[...result.assets,{blob:selected.blob,role:'derivative',kind:'selection',dimensions:{width:selected.bounds.width,height:selected.bounds.height},crop:selected.bounds}],crop:selected.bounds,dimensions:{width:selected.bounds.width,height:selected.bounds.height}});}catch(error){status(error.message);}};
$('cancel').onclick=async()=>{if(finished){window.close();return;}if(saving)return;abort.abort();if(selecting){selecting=false;$('selection').hidden=true;await fail(new CaptureStopped());}};
$('close').onclick=()=>window.close();$('export').onclick=exportSaved;$('workspace').onclick=()=>chrome.tabs.create({url:workspaceLink(record.scanId,'captures',record.id)});$('edit').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('capture-edit.html?id='+record.id)});
window.addEventListener('pagehide',()=>{abort.abort();if(objectURL)URL.revokeObjectURL(objectURL);});
async function init(){
  const launchId=new URLSearchParams(location.search).get('launch');if(!/^[\w-]{1,100}$/.test(launchId||''))throw new Error('Start capture from Gather’s toolbar or side panel.');
  const key='gather.captureLaunch.'+launchId;launch=(await chrome.storage.session.get(key))[key];if(!launch)throw new Error('This capture session has expired. Start a new capture.');
  await chrome.storage.session.remove(key);
  $('destination').textContent=[launch.context.projectName,launch.context.scanName,launch.context.subjectName].filter(Boolean).join(' / ');$('source').textContent=launch.source.title+' · '+launch.source.url;
  record=await beginCapture({...launch,id:launch.launchId});result=await acquireCapture({source:launch.source,mode:launch.mode,signal:abort.signal,onProgress:status});
  if(abort.signal.aborted)throw new CaptureStopped();
  if(launch.mode==='selection'){
    selecting=true;objectURL=URL.createObjectURL(result.assets[0].blob);$('preview').src=objectURL;$('selection').hidden=false;status('Choose the rectangle to save.');
    $('cropWidth').max=result.dimensions.width;$('cropHeight').max=result.dimensions.height;$('cropX').max=result.dimensions.width-1;$('cropY').max=result.dimensions.height-1;
    setCrop({x:0,y:0,...result.dimensions});$('preview').onload=paint;await chrome.windows.update((await chrome.windows.getCurrent()).id,{focused:true});$('imageArea').tabIndex=0;$('imageArea').focus();
  }else await save(result);
}
init().catch(fail);
