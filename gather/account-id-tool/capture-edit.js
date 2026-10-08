import {getCapture,getAsset,addCaptureDerivative} from './capture-store.js';
import {preferredCaptureAsset} from './capture-files.js';
import {copyCaptureImage} from './capture-output.js';
import {selectionBounds} from './capture-engine.js';
import {resizeCrop} from './capture-crop.js';
import {renderEdits} from './capture-annotations.js';
const $=id=>document.getElementById(id);let record,parent,bitmap,operations=[],tool='arrow',gesture=null,busy=false,stale=false,closing=false,savedEdits='[]',savedNote='',channel,crop=null,cropGesture=null;
const status=text=>$('editStatus').textContent=text;
const canvas=$('editCanvas'),preview=$('editPreview');
function hasUnsavedEdits(){return Boolean(bitmap&&!stale&&(JSON.stringify(operations)!==savedEdits||$('derivativeNote').value!==savedNote||crop&&(crop.x||crop.y||crop.width!==canvas.width||crop.height!==canvas.height)));}
function controls(){closing=false;for(const node of document.querySelectorAll('input,textarea,[data-tool],#cropDerivative,#addArrow,#addCircle,#redactForm button,#cropActions button,[data-crop-handle]'))node.disabled=busy||stale;for(const id of ['saveDerivative','saveAndCopy'])$(id).disabled=busy||stale||!bitmap||!!crop;$('copyEdited').disabled=busy||stale||!record||!!crop||hasUnsavedEdits();$('undoDerivative').disabled=busy||stale||!operations.length;$('closeDerivative').disabled=busy;}
function stroke(){const value=Number($('strokeWidth').value);if(!Number.isFinite(value)||value<1||value>40)throw new Error('Choose a line width from 1 to 40 pixels.');return value;}
function rect(){return selectionBounds({x:Number($('redactX').value),y:Number($('redactY').value),width:Number($('redactWidth').value),height:Number($('redactHeight').value)},canvas.width,canvas.height);}
function render(){renderEdits(canvas,bitmap,operations);preview.setAttribute('viewBox',`0 0 ${canvas.width} ${canvas.height}`);controls();}
function commit(op){if(busy||stale)return;operations.push(op);render();status(operations.length+' edit(s). Save edits or Save & copy image when ready.');}
function add(type){try{const box=rect();if(crop)endCrop();commit(type==='arrow'?{type,x:box.x,y:box.y,endX:box.x+box.width,endY:box.y+box.height,stroke:stroke()}:{type,...box,...(type==='circle'?{stroke:stroke()}:{})});}catch(e){status(e.message);}}
function point(event){const bounds=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(event.clientX-bounds.left)*canvas.width/bounds.width)),y:Math.max(0,Math.min(canvas.height,(event.clientY-bounds.top)*canvas.height/bounds.height))};}
function operation(start,end){if(Math.hypot(start.x-end.x,start.y-end.y)<2)return null;if(tool==='arrow')return {type:tool,x:start.x,y:start.y,endX:end.x,endY:end.y,stroke:stroke()};return {type:tool,...selectionBounds({x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),width:Math.abs(start.x-end.x),height:Math.abs(start.y-end.y)},canvas.width,canvas.height),...(tool==='circle'?{stroke:stroke()}:{})};}
function showPreview(op){preview.replaceChildren();if(!op)return;const svg=document.createElementNS('http://www.w3.org/2000/svg',op.type==='arrow'?'line':op.type==='circle'?'ellipse':'rect');const attrs=op.type==='arrow'?{x1:op.x,y1:op.y,x2:op.endX,y2:op.endY}:op.type==='circle'?{cx:op.x+op.width/2,cy:op.y+op.height/2,rx:op.width/2,ry:op.height/2}:{x:op.x,y:op.y,width:op.width,height:op.height};for(const [key,value]of Object.entries(attrs))svg.setAttribute(key,value);svg.setAttribute('fill',op.type==='redact'?'#000':'none');svg.setAttribute('stroke',op.type==='crop'?'#1463d6':op.type==='redact'?'#000':'#d71920');svg.setAttribute('stroke-width',op.stroke||2);if(op.type==='crop')svg.setAttribute('stroke-dasharray','6 4');preview.append(svg);}
function cancelGesture(){if(gesture&&canvas.hasPointerCapture(gesture.id))canvas.releasePointerCapture(gesture.id);gesture=null;preview.replaceChildren();}
canvas.onpointerdown=event=>{if(event.button!==0||busy||stale||!bitmap||crop)return;event.preventDefault();gesture={id:event.pointerId,start:point(event)};canvas.setPointerCapture(event.pointerId);};
canvas.onpointermove=event=>{if(!gesture||event.pointerId!==gesture.id)return;try{showPreview(operation(gesture.start,point(event)));}catch(e){status(e.message);}};
canvas.onpointerup=event=>{if(!gesture||event.pointerId!==gesture.id)return;try{const op=operation(gesture.start,point(event));cancelGesture();if(op)commit(op);}catch(e){cancelGesture();status(e.message);}};
canvas.onpointercancel=cancelGesture;canvas.onlostpointercapture=()=>{gesture=null;preview.replaceChildren();};
function selectTool(next){tool=next;for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b.dataset.tool===tool));}
function drawCrop(){
  $('cropOverlay').hidden=$('cropActions').hidden=!crop;if(!crop)return;
  Object.assign($('cropBox').style,{left:crop.x/canvas.width*100+'%',top:crop.y/canvas.height*100+'%',width:crop.width/canvas.width*100+'%',height:crop.height/canvas.height*100+'%'});
  $('cropDimensions').textContent=`${crop.width} × ${crop.height} pixels · Left ${crop.x}, top ${crop.y}`;controls();
}
function endCrop(){crop=null;cropGesture=null;$('cropOverlay').hidden=$('cropActions').hidden=true;selectTool('arrow');controls();}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{
  cancelGesture();if(crop)endCrop();selectTool(button.dataset.tool);
  if(tool==='crop'){crop={x:0,y:0,width:canvas.width,height:canvas.height};drawCrop();status('Adjust the crop handles, then choose Apply crop.');}
  else status('Drag on the image to add a '+({arrow:'red arrow',circle:'red circle',redact:'black redaction'}[tool])+'.');
};
const cropOverlay=$('cropOverlay');
cropOverlay.onpointerdown=event=>{if(!crop||busy||stale||event.button!==0)return;const handle=event.target.closest('[data-crop-handle]')?.dataset.cropHandle||(event.target.closest('#cropBox')?'move':null);if(!handle)return;event.preventDefault();cropGesture={id:event.pointerId,start:point(event),rect:{...crop},handle};cropOverlay.setPointerCapture(event.pointerId);};
cropOverlay.onpointermove=event=>{if(!cropGesture||event.pointerId!==cropGesture.id)return;const p=point(event),g=cropGesture;crop=resizeCrop(g.rect,g.handle,p.x-g.start.x,p.y-g.start.y,canvas.width,canvas.height);drawCrop();};
cropOverlay.onpointerup=event=>{if(cropGesture?.id===event.pointerId){cropGesture=null;cropOverlay.releasePointerCapture(event.pointerId);}};
cropOverlay.onpointercancel=()=>{if(cropGesture){crop=cropGesture.rect;cropGesture=null;drawCrop();}};cropOverlay.onlostpointercapture=()=>{cropGesture=null;};
for(const handle of document.querySelectorAll('[data-crop-handle]'))handle.onkeydown=event=>{if(!crop||busy||stale)return;const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!delta)return;event.preventDefault();event.stopPropagation();crop=resizeCrop(crop,handle.dataset.cropHandle,delta[0]*(event.shiftKey?10:1),delta[1]*(event.shiftKey?10:1),canvas.width,canvas.height);drawCrop();};
$('resetCrop').onclick=()=>{crop={x:0,y:0,width:canvas.width,height:canvas.height};drawCrop();};
$('cancelCrop').onclick=()=>{endCrop();status('Crop cancelled. Image unchanged.');};
$('applyCrop').onclick=()=>{if(!crop)return;const box={...crop};endCrop();if(box.x||box.y||box.width!==canvas.width||box.height!==canvas.height)commit({type:'crop',...box});else status('The crop already includes the whole image.');};
$('redactForm').onsubmit=event=>{event.preventDefault();add('redact');};$('cropDerivative').onclick=()=>add('crop');$('addArrow').onclick=()=>add('arrow');$('addCircle').onclick=()=>add('circle');
function undo(){if(busy||stale)return;if(crop){endCrop();status('Crop cancelled.');return;}if(!operations.length)return;cancelGesture();operations.pop();render();status('Undid the last image edit.');}
$('undoDerivative').onclick=undo;
$('closeDerivative').onclick=()=>{if(busy)return;if(hasUnsavedEdits()&&!confirm('Discard unsaved image edits? Your saved screenshot will stay in Gather.'))return;closing=true;window.close();};
$('derivativeNote').oninput=controls;
window.addEventListener('beforeunload',event=>{if(!closing&&(busy||hasUnsavedEdits())){event.preventDefault();event.returnValue='';}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){cancelGesture();if(crop){endCrop();status('Crop cancelled.');}}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.shiftKey&&!event.target.closest('input,textarea')){event.preventDefault();undo();}});
async function copy(){try{await copyCaptureImage(record.id);status('Copied the selected image.');}catch(e){status('Image remains saved in Gather. '+e.message+' Click Copy image to retry.');}}
async function save(andCopy=false){if(busy||!record||crop)return;busy=true;cancelGesture();controls();try{if(stale)throw new Error('The selected image changed. Reopen Edit image to use the newer image.');if(JSON.stringify(operations)===savedEdits&&$('derivativeNote').value===savedNote){status('Image is already saved in Gather.');if(andCopy)await copy();return;}const expectedShareAssetId=record.shareAssetId||null,blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image encoding failed.')),'image/png'));record=await addCaptureDerivative(record.id,{blob,parentAssetId:parent.id,expectedShareAssetId,kind:parent.kind==='redacted'||operations.some(o=>o.type==='redact')?'redacted':operations.some(o=>['arrow','circle'].includes(o.type))?'annotated':operations.some(o=>o.type==='crop')?'cropped':'annotated',operations:{edits:operations,dimensions:{width:canvas.width,height:canvas.height}},annotation:$('derivativeNote').value});savedEdits=JSON.stringify(operations);savedNote=$('derivativeNote').value;status('Saved derivative in Gather. Copy, Save image and folder export now use this image. Private backups retain originals.');if(andCopy)await copy();}catch(e){status(e.message);}finally{busy=false;controls();}}
$('saveDerivative').onclick=()=>save();$('saveAndCopy').onclick=()=>save(true);$('copyEdited').onclick=copy;
async function checkCurrent(){if(!record||busy)return;const current=await getCapture(record.id);if(!current||preferredCaptureAsset(current)?.id!==preferredCaptureAsset(record)?.id){stale=true;cancelGesture();if(crop)endCrop();canvas.width=canvas.height=0;controls();status(current?'The selected image changed. Reopen Edit image to use the newer image.':'This capture was deleted. Close this editor.');}}
async function init(){record=await getCapture(new URLSearchParams(location.search).get('id'));if(!record||record.savedState!=='saved')throw new Error('Choose a saved capture in Workspace.');parent=preferredCaptureAsset(record);bitmap=await createImageBitmap((await getAsset(parent.id,{verify:true})).blob);$('editSource').textContent=record.source.title+' · '+record.source.url;$('derivativeNote').value=parent.annotation||'';savedNote=$('derivativeNote').value;render();if(globalThis.BroadcastChannel){channel=new BroadcastChannel('gather-captures');channel.onmessage=()=>checkCurrent().catch(e=>status(e.message));}window.addEventListener('focus',()=>checkCurrent().catch(e=>status(e.message)));}
window.addEventListener('pagehide',()=>{bitmap?.close();channel?.close();});init().catch(e=>{status(e.message);document.querySelectorAll('button,input,textarea').forEach(n=>n.disabled=n.id!=='closeDerivative');});
