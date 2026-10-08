import {shareImage} from './capture-output.js';
import {getCapture} from './capture-store.js';
import {preferredCaptureAsset} from './capture-files.js';
const $=id=>document.getElementById(id),urls=[],id=new URLSearchParams(location.search).get('id');
let selectedAssetId,invalidated=false;
function clearPages(){urls.splice(0).forEach(url=>URL.revokeObjectURL(url));$('pages').replaceChildren();$('print').disabled=true;}
function invalidate(message){invalidated=true;clearPages();$('status').textContent=message;$('status').className='error';}
async function validatePreview(){
  if(invalidated||!selectedAssetId)return false;
  try{const record=await getCapture(id);if(!record){invalidate('This capture was deleted from Gather.');return false;}if(preferredCaptureAsset(record)?.id!==selectedAssetId){invalidate('The selected image changed. Reopen Print / Save PDF to use the updated image.');return false;}return !invalidated;}
  catch(error){invalidate(error.message);return false;}
}
$('close').onclick=()=>window.close();$('print').onclick=async()=>{if(await validatePreview()){try{const {asset}=await shareImage(id);if(asset.id===selectedAssetId&&!invalidated)window.print();else invalidate('The selected image changed. Reopen Print / Save PDF.');}catch(error){invalidate(error.message);}}};$('caption').onchange=()=>document.body.classList.toggle('hide-caption',!$('caption').checked);
window.addEventListener('focus',validatePreview);
window.addEventListener('beforeprint',()=>{if(invalidated||!selectedAssetId)clearPages();});
if(globalThis.BroadcastChannel){const channel=new BroadcastChannel('gather-captures');channel.onmessage=validatePreview;window.addEventListener('pagehide',()=>channel.close());}
window.addEventListener('pagehide',clearPages);
async function init(){
  const {record,asset}=await shareImage(id);selectedAssetId=asset.id;const bitmap=await createImageBitmap(asset.blob);
  try{
    const height=Math.max(1,Math.floor(bitmap.width*1.35)),count=Math.ceil(bitmap.height/height);if(count>40||bitmap.width*bitmap.height>48000000)throw new Error('This image exceeds the print preview limit. Save the image instead.');
    for(let i=0;i<count;i++){
      const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=Math.min(height,bitmap.height-i*height);canvas.getContext('2d').drawImage(bitmap,0,i*height,bitmap.width,canvas.height,0,0,canvas.width,canvas.height);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('The browser could not prepare a print page.')),'image/png'));if(invalidated)return;const url=URL.createObjectURL(blob);urls.push(url);
      const sheet=document.createElement('article');sheet.className='sheet';const image=document.createElement('img');image.src=url;image.alt='Screenshot page '+(i+1);await image.decode();if(invalidated)return;const caption=document.createElement('p');caption.className='caption';caption.textContent=[record.source.title,record.source.url,record.startedAtISO+' · '+record.timezone,record.evidenceId,'Page '+(i+1)+' of '+count,record.status==='partial'?'Partial capture':''].filter(Boolean).join(' · ');sheet.append(image,caption);$('pages').append(sheet);
    }
    if(!await validatePreview())return;$('status').textContent=count+' page'+(count===1?'':'s')+' ready · '+(record.status==='partial'?'Partial capture':'Selected image');$('print').disabled=false;
  }finally{bitmap.close();}
}
document.body.classList.toggle('hide-caption',!$('caption').checked);
init().catch(error=>invalidate(error.message));
