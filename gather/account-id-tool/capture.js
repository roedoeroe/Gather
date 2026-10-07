import {captureViewer} from './capture-viewer.js';
import {workspaceLink} from './workspace-links.js';
import {captureHistoryLink} from './workspace-links.js';
import {selectPageArea,selectionPixels} from './capture-selection.js';
import {copyCaptureImage,saveCaptureImage,printCaptureLink} from './capture-output.js';
import {acquireCapture,cropImage,selectionBounds,CaptureStopped} from './capture-engine.js';
import {beginCapture,completeCapture,failCapture,getAsset,getCapture} from './capture-store.js';
import {exportCapture,preferredCaptureAsset} from './capture-files.js';
import {request} from './workspace-client.js';
const $=id=>document.getElementById(id),abort=new AbortController();
let launch,record,result,objectURL,selecting=false,finished=false,saving=false,previewAssetId,previewSerial=0;
const viewer=captureViewer('Saved screenshot');viewer.image.id='resultImage';$('savedPreview').append(viewer.element);
const status=text=>$('status').textContent=text;
async function release(){if(launch)await request('capture.finished',{launchId:launch.launchId}).catch(()=>{});}
async function fail(error){
  status(error.message||String(error));$('status').className='message error';
  if(record)await failCapture(record.id,{status:abort.signal.aborted||error instanceof CaptureStopped?'cancelled':'failed',error:error.message}).catch(()=>{});
  finished=true;$('cancel').textContent='Close';await release();
}
async function save(details){
  if(saving)return;saving=true;$('saveSelection').disabled=true;
  try{record=await completeCapture(record.id,details);finished=true;selecting=false;$('selection').hidden=true;$('completed').hidden=false;$('cancel').hidden=true;
    $('savedState').textContent='Saved in Gather · '+(record.status==='partial'?'Partial capture':({'visible':'Visible area saved','selection':'Selected area saved','full-page':'Full page saved'}[record.mode]));
    $('limitations').textContent=record.limitations.join('\n');status(record.status==='partial'?'Partial screenshot saved — some page content could not be captured.':'Screenshot saved.');$('captureDetails').open=record.status==='partial';
    const asset=await getAsset(preferredCaptureAsset(record).id);previewAssetId=asset.id;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(asset.blob);viewer.image.src=objectURL;
    await release();await chrome.windows.update((await chrome.windows.getCurrent()).id,{focused:true});
    if(launch.afterCapture==='copy')await copySaved();
    if(record.automaticExport)await exportSaved();else $('exportState').textContent='Not exported to a folder.';
  }catch(error){if(!finished)await fail(error);else status(error.message);}finally{saving=false;$('saveSelection').disabled=false;}
}
async function refreshSavedPreview(){
  if(!finished||record?.savedState!=='saved')return;const ticket=++previewSerial;
  try{
    const current=await getCapture(record.id);if(ticket!==previewSerial)return;
    if(!current){viewer.image.removeAttribute('src');if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;$('outputStatus').textContent='This capture was deleted from Gather.';for(const id of ['copy','saveImage','print','edit','export','workspace'])$(id).disabled=true;return;}
    const chosen=preferredCaptureAsset(current);if(chosen.id!==previewAssetId){const asset=await getAsset(chosen.id,{verify:true});if(ticket!==previewSerial)return;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(asset.blob);viewer.image.src=objectURL;previewAssetId=chosen.id;$('outputStatus').textContent='Updated saved image.';}record=current;
  }catch(error){viewer.image.removeAttribute('src');$('outputStatus').textContent=error.message;}
}
window.addEventListener('focus',refreshSavedPreview);
if(globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.onmessage=refreshSavedPreview;window.addEventListener('pagehide',()=>channel.close());}
async function exportSaved(){
  $('export').disabled=true;$('exportState').textContent='Saved in Gather · Exporting to Downloads…';
  try{record=await exportCapture(record.id);$('exportState').textContent='Exported to folder: '+record.export.filename;$('export').textContent='Export another copy';}
  catch(error){$('exportState').textContent='Saved in Gather · Folder export failed: '+error.message;$('export').textContent='Retry folder export';}
  finally{$('export').disabled=false;}
}
async function copySaved(){
  const work=copyCaptureImage(record.id);$('copy').disabled=true;$('outputStatus').textContent='Copying selected image…';
  try{await work;$('outputStatus').textContent='Image copied to clipboard.';}
  catch(error){$('outputStatus').textContent='Saved in Gather. Clipboard copy failed: '+error.message+' Click Copy image to retry.';}
  finally{$('copy').disabled=false;}
}
$('copy').onclick=copySaved;
$('saveImage').onclick=async()=>{const button=$('saveImage');button.disabled=true;$('outputStatus').textContent='Choose where to save the image…';try{const result=await saveCaptureImage(record.id,$('imageFormat').value);$('outputStatus').textContent='Image downloaded: '+result.basename;}catch(error){$('outputStatus').textContent='Saved in Gather. Image download failed: '+error.message;}finally{button.disabled=false;}};
$('print').onclick=()=>chrome.tabs.create({url:printCaptureLink(record.id)});
$('history').onclick=()=>chrome.tabs.create({url:captureHistoryLink()});
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
  record=await beginCapture({...launch,id:launch.launchId});
  let selection;
  if(launch.mode==='selection'&&launch.selectionMethod!=='screenshot'){
    status('Drag an area on the source page. Release to capture; Esc cancels.');
    selection=await selectPageArea({source:launch.source,signal:abort.signal,destination:$('destination').textContent,token:launch.launchId});
  }
  result=await acquireCapture({source:{...launch.source,...(selection?.documentId?{documentId:selection.documentId}:{})},mode:launch.mode,signal:abort.signal,onProgress:status,token:launch.launchId});
  if(abort.signal.aborted)throw new CaptureStopped();
  if(selection){
    const selected=await cropImage(result.assets[0].blob,selectionPixels(selection,result));
    await save({...result,assets:[...result.assets,{blob:selected.blob,role:'derivative',kind:'selection',dimensions:{width:selected.bounds.width,height:selected.bounds.height},crop:selected.bounds}],crop:selected.bounds,dimensions:{width:selected.bounds.width,height:selected.bounds.height},technical:{selectionMethod:'page',cssSelection:selection.rect,selectionViewport:selection.viewport}});
  }else if(launch.mode==='selection'){
    selecting=true;objectURL=URL.createObjectURL(result.assets[0].blob);$('preview').src=objectURL;$('selection').hidden=false;status('Choose the rectangle to save.');
    $('cropWidth').max=result.dimensions.width;$('cropHeight').max=result.dimensions.height;$('cropX').max=result.dimensions.width-1;$('cropY').max=result.dimensions.height-1;
    setCrop({x:0,y:0,...result.dimensions});$('preview').onload=paint;await chrome.windows.update((await chrome.windows.getCurrent()).id,{focused:true});$('imageArea').tabIndex=0;$('imageArea').focus();
  }else await save(result);
}
init().catch(fail);
