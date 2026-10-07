import {request} from './workspace-client.js';
import {listCaptures,getAsset} from './capture-store.js';
import {preferredCaptureAsset,captureExportRecord,downloadVerifiedBlob} from './capture-files.js';
const $=id=>document.getElementById(id),make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const urls=[];let included=[];window.addEventListener('pagehide',()=>urls.forEach(u=>URL.revokeObjectURL(u)));
async function load(){
 const scanId=new URLSearchParams(location.search).get('scan'),state=(await request('workspace.state')).state,scan=state.scans.find(s=>s.id===scanId);
 if(!scan)throw new Error('Choose a current scan in Gather.');
 const records=(await listCaptures({scanId})).filter(c=>c.savedState==='saved'&&c.included!==false&&c.review!=='excluded').reverse();
 const total=records.reduce((n,r)=>n+(preferredCaptureAsset(r)?.bytes||0),0);if(records.length>40||total>64*1024*1024)throw new Error('Review sheets support up to 40 captures and 64 MiB of selected images. Reduce inclusion or export images to folders.');
 for(const [index,record]of records.entries()){
  const summary=preferredCaptureAsset(record),asset=await getAsset(summary.id,{verify:true}),sheet=make('article');sheet.className='evidence-sheet';
  const evidence=record.evidenceId||'E-'+record.id,crosswalk=make('p','Sheet '+(index+1)+' · '+evidence);crosswalk.className='crosswalk';sheet.append(crosswalk,make('h2',record.source.title||'Saved capture'));
  const img=make('img');img.loading='lazy';img.alt='Included '+record.mode+' capture';img.src=URL.createObjectURL(asset.blob);urls.push(img.src);sheet.append(img);
  const link=make('a',record.source.url);link.href=record.source.url;link.rel='noopener noreferrer';sheet.append(make('p',record.context.roleId||record.context.subjectName||'Unassigned'),link,make('p','Captured '+record.startedAtISO+' · '+record.timezone+' · '+record.mode+' · '+record.status),make('p','Review: '+(record.review||'unreviewed')),make('p','Export image SHA-256: '+asset.sha256));
  if(summary.annotation)sheet.append(make('p',summary.annotation));for(const limitation of record.limitations||[])sheet.append(make('p','Limitation: '+limitation));sheet.append(make('p','Hash verifies byte integrity, not authenticity or identity.'));
  $('evidenceSheets').append(sheet);included.push({sheet,blob:asset.blob,record:captureExportRecord(record,summary),number:index+1,evidenceId:evidence});
 }
 $('evidenceStatus').textContent=records.length+' included capture(s). Sheet numbers map to stable Evidence IDs; browser print pagination can differ.';$('exportSheet').disabled=$('printSheet').disabled=!records.length;
}
$('printSheet').onclick=()=>window.print();
$('exportSheet').onclick=async()=>{try{
 const doc=document.implementation.createHTMLDocument('Gather evidence review sheet'),style=doc.createElement('style');style.textContent='body{font:14px system-ui;margin:24px}article{break-after:page;margin-bottom:40px}img{max-width:100%;max-height:700px}p,h2,a{overflow-wrap:anywhere}@media print{img{max-height:160mm}}';doc.head.append(style);doc.body.append(make('h1','Gather · reviewed evidence sheet'),make('p','Selected capture images and source metadata. Review before sharing; source pixels, URLs and titles may contain names. Unselected originals are excluded.'));
 for(const item of included){const copy=item.sheet.cloneNode(true);copy.querySelector('img').src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(item.blob);});doc.body.append(copy);}
 const manifest=make('pre',JSON.stringify({format:'gather-evidence-sheet',version:1,createdAt:new Date().toISOString(),crosswalk:included.map(i=>({sheet:i.number,evidenceId:i.evidenceId,captureId:i.record.captureId})),captures:included.map(i=>i.record)},null,2));doc.body.append(manifest);
 await downloadVerifiedBlob(new Blob(['<!doctype html>\n'+doc.documentElement.outerHTML],{type:'text/html'}),'Gather/Review/Gather-evidence-'+Date.now()+'.html');$('evidenceStatus').textContent='Exported the selected review sheet. Originals are excluded when a derivative is selected.';
 }catch(e){$('evidenceStatus').textContent=e.message;}};
load().catch(e=>{$('evidenceStatus').textContent=e.message;});
