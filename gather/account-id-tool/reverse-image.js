import {IMAGE_PROVIDERS,imageSearchUrl} from './image-search.js';
import {shareImage,imageFormat,saveCaptureImage} from './capture-output.js';
import {sourceImageType,SOURCE_IMAGE_TYPES} from './source-image.js';
import {downloadVerifiedBlob} from './capture-files.js';
// Selection is memory-only. Reading a file or saved asset never starts a request.
export function mountReverseImage(host,{captureId=null}={}){
 const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
 const button=(text,fn)=>{const node=el('button',text);node.type='button';node.onclick=fn;return node;};
 let selected=null,serial=0,previewURL=null,busy=false,loading=false;
 const file=el('input');file.type='file';file.accept='image/png,image/jpeg,image/webp,image/avif,image/gif';file.hidden=true;
 const choose=button('Choose image…',()=>file.click()),remove=button('Remove',clear),drop=el('div');drop.className='reverse-drop';
 const preview=el('img');preview.alt='Selected reverse-search image';preview.hidden=true;
 const label=el('p','Choose an image, or drop one here.');label.className='quiet';
 const provider=el('select');provider.setAttribute('aria-label','Reverse image provider');for(const [key,value] of Object.entries(IMAGE_PROVIDERS))provider.append(new Option(value.name,key));
 const providerLabel=el('label','Provider');providerLabel.append(provider);
 const search=button('Copy & open search ↗',launch);search.className='primary';
 const save=button('Save selected image…',()=>run(async()=>{const item=selected;if(!item)throw Error('Choose an image first.');if(item.captureId)await saveCaptureImage(item.captureId,'original');else await downloadVerifiedBlob(item.blob,'Gather-reverse-image.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif','image/gif':'gif'}[item.blob.type]),{saveAs:true});}));
 const open=button('Open provider without copying ↗',()=>run(async()=>{const item=selected;await bytes(item);if(item!==selected)throw Error('Image selection changed. Try again.');await chrome.tabs.create({url:imageSearchUrl(provider.value)});status.textContent='Provider opened. Use its image upload control to choose the selected file. Gather did not upload it.';}));
 const status=el('p');status.className='micro';status.setAttribute('role','status');
 const help=el('p');help.className='micro';
 const tools=el('div');tools.className='reverse-actions';tools.append(choose,remove);
 const actions=el('div');actions.className='reverse-actions';actions.append(providerLabel,search);
 const fallback=el('details');fallback.append(el('summary','Upload options'),save,open);
 drop.append(preview,label,tools);host.classList.add('reverse-image');host.append(drop,file,actions,help,fallback,status);
 function render(){remove.hidden=!selected;choose.disabled=busy;remove.disabled=busy;search.disabled=busy||loading||!selected;save.disabled=busy||loading||!selected;open.disabled=busy||loading||!selected;choose.textContent=selected?'Change image…':'Choose image…';help.textContent=IMAGE_PROVIDERS[provider.value].guidance||'Paste or upload on the provider’s site. Availability can vary; Gather has not submitted this image.';}
 function clear(){serial++;loading=false;selected=null;if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;preview.removeAttribute('src');preview.hidden=true;label.textContent='Choose an image, or drop one here.';status.textContent='';render();}
 async function bytes(item){if(!item)throw Error('Choose an image first.');if(!item.captureId)return item.blob;const current=await shareImage(item.captureId);if(current.asset.id!==item.assetId)throw Error('This saved image changed. Reopen Reverse search from its inspector.');return current.asset.blob;}
 async function select(blob,name,extra={},ticket=++serial){
  loading=true;render();try{
  if(!(blob instanceof Blob)||!blob.size||blob.size>64*1024*1024)throw Error('Choose a PNG, JPEG, WebP, AVIF or GIF under 64 MiB.');
  const type=sourceImageType(new Uint8Array(await blob.slice(0,64).arrayBuffer()));if(!SOURCE_IMAGE_TYPES.includes(type))throw Error('Unsupported image. Choose PNG, JPEG, WebP, AVIF or GIF.');
  const bitmap=await createImageBitmap(blob);const dimensions={width:bitmap.width,height:bitmap.height};bitmap.close();if(dimensions.width*dimensions.height>48000000)throw Error('Choose an image under 48 million pixels.');
  if(ticket!==serial)return;
  if(previewURL)URL.revokeObjectURL(previewURL);const original=blob.type===type?blob:blob.slice(0,blob.size,type);selected={blob:original,...extra};previewURL=URL.createObjectURL(original);preview.src=previewURL;preview.hidden=false;label.textContent=name+' · '+dimensions.width+' × '+dimensions.height+' · '+(blob.size<1024?blob.size+' bytes':(blob.size/1024).toFixed(0)+' KB');status.textContent='Selected locally. Nothing uploaded.';
  }finally{if(ticket===serial){loading=false;render();}}
 }
 async function run(fn){if(busy)return;busy=true;render();try{await fn();}catch(error){status.textContent=error.message;}finally{busy=false;render();}}
 function launch(){
  if(busy||loading||!selected)return;const item=selected,key=provider.value;
  run(async()=>{
   if(!navigator.clipboard?.write||!globalThis.ClipboardItem)throw Error('Image clipboard unavailable. Use Upload options to save this image and open the provider.');
   const prepared=bytes(item).then(async blob=>{const png=await imageFormat(blob,'png');await bytes(item);if(item!==selected)throw Error('Image selection changed. Try again.');return png;});prepared.catch(()=>{});
   try{await navigator.clipboard.write([new ClipboardItem({'image/png':prepared})]);}catch(error){throw Error('Image was not copied. Use Upload options, or retry with this window focused. '+error.message);}
   if(item!==selected)throw Error('Image selection changed. Try again.');
   await chrome.tabs.create({url:imageSearchUrl(key)});status.textContent='Selected image copied. Provider opened; paste where supported, or use its upload control. No automatic upload.';
  });
 }
 file.onchange=()=>{const candidate=file.files[0];file.value='';if(candidate)select(candidate,candidate.name).catch(error=>status.textContent=error.message);};
 drop.addEventListener('dragover',event=>{event.preventDefault();});drop.addEventListener('drop',event=>{event.preventDefault();if(busy)return;const files=[...event.dataTransfer.files];if(files.length!==1){status.textContent='Drop one image at a time.';return;}select(files[0],files[0].name).catch(error=>status.textContent=error.message);});
 provider.onchange=render;
 const channel=new BroadcastChannel('gather-captures');channel.onmessage=()=>{const item=selected;if(item?.captureId)bytes(item).catch(()=>{if(item===selected){clear();status.textContent='The saved image changed or was deleted. Reopen it from Captures.';}});};
 window.addEventListener('pagehide',()=>{clear();channel.close();});render();
 if(captureId){const ticket=++serial;shareImage(captureId).then(({record,asset})=>select(asset.blob,record.mode==='source-image'?'Saved source image':'Saved screenshot',{captureId,assetId:asset.id},ticket)).catch(error=>status.textContent=error.message);}
 return {focus:()=>choose.focus(),clear};
}
