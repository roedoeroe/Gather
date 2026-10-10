import {imageSearchControl} from './image-search-ui.js';
import {retrieveSourceImage} from './source-image.js';
import {beginCapture,completeCapture,failCapture,getCapture} from './capture-store.js';
import {copyCaptureImage,saveCaptureImage,shareImage} from './capture-output.js';
import {exportCapture} from './capture-files.js';
import {captureViewer} from './capture-viewer.js';
import {workspaceLink} from './workspace-links.js';
const $=id=>document.getElementById(id),controller=new AbortController();
let record,previewURL,finished=false;
const status=text=>$('sourceStatus').textContent=text;
$('cancelSource').onclick=()=>{if(finished)window.close();else controller.abort();};
window.addEventListener('pagehide',()=>{controller.abort();if(previewURL)URL.revokeObjectURL(previewURL);});
async function action(fn){try{await fn();}catch(error){$('sourceCopyStatus').textContent=error.message;}}
$('sourceCopy').onclick=()=>action(async()=>{await copyCaptureImage(record.id);$('sourceCopyStatus').textContent='Image copied to clipboard.';});
$('sourceDownload').onclick=()=>action(()=>saveCaptureImage(record.id,'original'));
$('sourceEdit').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('capture-edit.html?id='+record.id)});
$('sourceHistory').onclick=()=>chrome.tabs.create({url:workspaceLink(record.scanId,'captures',record.id)});
async function refresh(){
  if(!record||!finished)return;
  const current=await getCapture(record.id);
  if(!current){$('sourceActions').hidden=true;$('sourcePreview').replaceChildren();if(previewURL)URL.revokeObjectURL(previewURL);status('This source image was deleted from Gather.');return;}
  if(current.savedState!=='saved')return;
  const {asset}=await shareImage(record.id);if(previewURL)URL.revokeObjectURL(previewURL);
  previewURL=URL.createObjectURL(asset.blob);const viewer=captureViewer('Saved source image');viewer.image.src=previewURL;$('sourcePreview').replaceChildren(viewer.element);
}
async function run(){
  const id=new URL(location.href).searchParams.get('job');if(!/^[\w-]{1,100}$/.test(id||''))throw new Error('This image save is no longer available. Right-click the source image again.');
  const key='gather.sourceImage.'+id,job=(await chrome.storage.session.get(key))[key];
  if(!job)throw new Error('This image save has expired. Right-click the source image again.');
  await chrome.storage.session.remove(key);
  $('sourceDestination').textContent=[job.context.projectName,job.context.subjectName].join(' › ');
  try{
    record=await beginCapture({id:job.id,mode:'source-image',context:job.context,source:job.source,startedAt:job.startedAt});
    const image=await retrieveSourceImage(job.imageUrl,{signal:controller.signal});
    if(controller.signal.aborted)throw new Error('Source image save cancelled.');
    record=await completeCapture(record.id,{status:'complete',dimensions:image.dimensions,scale:1,technical:{imageUrl:image.imageUrl,originalFilename:image.filename,mime:image.mime,acquisition:'browser context-menu srcUrl',urlMayExpire:true},assets:[{role:'original',blob:image.blob,dimensions:image.dimensions}]});
    $('sourceActions').append(imageSearchControl(record.id,text=>$('sourceCopyStatus').textContent=text));
    finished=true;$('cancelSource').textContent='Done';$('sourceActions').hidden=false;status('Saved in Gather · '+$('sourceDestination').textContent);
    await refresh();
    if(job.automaticCopy)await action(async()=>{await copyCaptureImage(record.id);$('sourceCopyStatus').textContent='Image copied to clipboard.';});
    if(record.automaticExport)await action(()=>exportCapture(record.id));
  }catch(error){if(record&&!finished)await failCapture(record.id,{status:controller.signal.aborted?'cancelled':'failed',error:error.message});throw error;}
}
const channel=new BroadcastChannel('gather-captures');channel.onmessage=()=>refresh().catch(error=>status(error.message));
window.addEventListener('focus',()=>refresh().catch(error=>status(error.message)));
run().catch(error=>{status(error.message);$('sourceStatus').classList.add('error');$('cancelSource').textContent='Close';finished=true;});
