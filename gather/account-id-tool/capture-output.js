import {getCapture,getAsset} from './capture-store.js';
import {preferredCaptureAsset,captureExportPath,downloadVerifiedBlob} from './capture-files.js';

export async function shareImage(id){
  const record=await getCapture(id);if(record?.savedState!=='saved')throw new Error('This capture is no longer saved in Gather.');
  const chosen=preferredCaptureAsset(record);if(!chosen)throw new Error('This capture has no image. Restore it from backup.');
  const asset=await getAsset(chosen.id,{verify:true}),current=await getCapture(id);
  if(!current||preferredCaptureAsset(current)?.id!==chosen.id)throw new Error('The selected image changed. Open the capture again.');
  return {record:current,asset};
}
export async function imageFormat(blob,format='png'){
  const mime={png:'image/png',jpg:'image/jpeg'}[format];if(!mime)throw new Error('Choose PNG or JPEG.');
  if(blob.type===mime)return blob;
  const bitmap=await createImageBitmap(blob);try{
    if(bitmap.width*bitmap.height>48000000)throw new Error('This image is too large to convert. Save its original format instead.');
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('The browser could not prepare this image.');
    if(format==='jpg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.drawImage(bitmap,0,0);
    return await new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('Image conversion failed.')),mime,0.92));
  }finally{bitmap.close();}
}
export function copyCaptureImage(id){
  if(!navigator.clipboard?.write||!globalThis.ClipboardItem)return Promise.reject(new Error('Image clipboard access is unavailable. Use Save image instead.'));
  // Invoke write during the click; the promised bytes are verified asynchronously.
  const bytes=shareImage(id).then(({asset})=>imageFormat(asset.blob,'png'));
  bytes.catch(()=>{});
  return navigator.clipboard.write([new ClipboardItem({'image/png':bytes})]);
}
export async function saveCaptureImage(id,format='png'){
  const {record,asset}=await shareImage(id),blob=await imageFormat(asset.blob,format);
  const current=await getCapture(id);if(!current||preferredCaptureAsset(current)?.id!==asset.id)throw new Error('The selected image changed. Try Save again.');
  return downloadVerifiedBlob(blob,captureExportPath(record,format).split('/').at(-1),{saveAs:true});
}
export function printCaptureLink(id){return chrome.runtime.getURL('capture-print.html?id='+encodeURIComponent(id));}
