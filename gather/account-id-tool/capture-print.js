import {shareImage} from './capture-output.js';
const $=id=>document.getElementById(id),urls=[];
$('close').onclick=()=>window.close();$('print').onclick=()=>window.print();$('caption').onchange=()=>document.body.classList.toggle('hide-caption',!$('caption').checked);
window.addEventListener('pagehide',()=>urls.forEach(url=>URL.revokeObjectURL(url)));
async function init(){
  const id=new URLSearchParams(location.search).get('id'),{record,asset}=await shareImage(id),bitmap=await createImageBitmap(asset.blob);
  try{
    const height=Math.max(1,Math.floor(bitmap.width*1.35)),count=Math.ceil(bitmap.height/height);if(count>40||bitmap.width*bitmap.height>48000000)throw new Error('This image exceeds the print preview limit. Save the image instead.');
    for(let i=0;i<count;i++){
      const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=Math.min(height,bitmap.height-i*height);canvas.getContext('2d').drawImage(bitmap,0,i*height,bitmap.width,canvas.height,0,0,canvas.width,canvas.height);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('The browser could not prepare a print page.')),'image/png')),url=URL.createObjectURL(blob);urls.push(url);
      const sheet=document.createElement('article');sheet.className='sheet';const image=document.createElement('img');image.src=url;image.alt='Screenshot page '+(i+1);await image.decode();const caption=document.createElement('p');caption.className='caption';caption.textContent=[record.source.title,record.source.url,record.startedAtISO+' · '+record.timezone,record.evidenceId,'Page '+(i+1)+' of '+count,record.status==='partial'?'Partial capture':''].filter(Boolean).join(' · ');sheet.append(image,caption);$('pages').append(sheet);
    }
    $('status').textContent=count+' page'+(count===1?'':'s')+' ready · '+(record.status==='partial'?'Partial capture':'Selected image');$('print').disabled=false;
  }finally{bitmap.close();}
}
init().catch(error=>{$('status').textContent=error.message;$('status').className='error';$('pages').replaceChildren();});
