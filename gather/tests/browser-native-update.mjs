// Real installed extension update at the SAME folder/profile, with fictional local
// chrome.storage + IndexedDB data. No storage migration or API doubles in harness.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(process.env.GATHER_EXTENSION_ROOT||new URL('../account-id-tool/',import.meta.url).pathname);
const previous=process.env.GATHER_PREVIOUS_PACKAGE||new URL('../../releases/1.8.17/Gather-1.8.17-extension.zip',import.meta.url).pathname;
const out=process.env.GATHER_BROWSER_ARTIFACTS||new URL('../../artifacts/browser-native-update/',import.meta.url).pathname;
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'gather-update-')),installed=path.join(temp,'account-id-tool'),profile=path.join(temp,'profile');
await fs.mkdir(out,{recursive:true});
execFileSync('python3',['-m','zipfile','-e',previous,temp]);
const passed=[],errors=[];let context;
async function open(){context=await chromium.launchPersistentContext(profile,{executablePath:process.env.GATHER_CHROMIUM_PATH,headless:true,chromiumSandbox:true,ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+installed,'--load-extension='+installed]});context.on('weberror',e=>errors.push(e.error().message));let worker=context.serviceWorkers().find(w=>w.url().endsWith('/background.js'));worker||=await context.waitForEvent('serviceworker',{predicate:w=>w.url().endsWith('/background.js')});const base='chrome-extension://'+new URL(worker.url()).host,page=await context.newPage();await page.goto(base+'/workspace.html');await page.locator('.layout:not([inert])').waitFor();return {page,base};}
try{
 let {page,base}=await open();assert.equal(await page.evaluate(()=>chrome.runtime.getManifest().version),'1.8.17');
 const snapshot=await page.evaluate(async()=>{
  const reply=await chrome.runtime.sendMessage({type:'workspace.action',action:{type:'project.create',name:'Northbridge',scanName:'October review'}});if(reply.error)throw new Error(reply.error);
  const {id:projectId,scanId}=reply.result,store=await import('./capture-store.js');const subject=await store.createSubject({projectId,name:'Alex Example'});await store.selectSubject(scanId,subject.id,projectId);
  const workspace=(await chrome.runtime.sendMessage({type:'workspace.state'})).state;
  const destination=await store.resolveCaptureDestination(workspace,scanId,subject.id),canvas=document.createElement('canvas');canvas.width=64;canvas.height=48;canvas.getContext('2d').fillRect(0,0,32,24);const blob=await new Promise(resolve=>canvas.toBlob(resolve));
  const record=await store.beginCapture({context:destination,source:{url:'https://example.test/fictional',title:'Fictional update image'},mode:'visible',startedAt:Date.now()});
  const saved=await store.completeCapture(record.id,{status:'complete',dimensions:{width:64,height:48},scale:1,assets:[{role:'original',blob,dimensions:{width:64,height:48}}]});
  const send=async action=>{const r=await chrome.runtime.sendMessage({type:'workspace.action',action});if(r.error)throw Error(r.error);return r;};
  const inbox=(await send({type:'item.save',kind:'note',scanId:null,title:'Inbox update finding',body:'Fictional retained note'})).result.id;
  const finding=(await send({type:'item.save',kind:'source',scanId,url:'https://example.test/source',title:'Case update finding',filingSubjectId:subject.id,filingRoleId:subject.roleId})).result.id;
  const source=await store.beginCapture({context:destination,source:{url:'https://example.test/source.png',title:'Fictional source image'},mode:'source-image',refs:{sourceId:finding}});
  const sourceSaved=await store.completeCapture(source.id,{assets:[{blob,role:'original'}],dimensions:{width:64,height:48},scale:1});
  const derivative=await store.addCaptureDerivative(source.id,{blob,parentAssetId:sourceSaved.assetIds[0],kind:'annotated',operations:{marks:[]},annotation:'Fictional caption'});
  await store.updateCaptureSettings({automaticCopy:false,automaticSourceCopy:true});
  const reference=await import('./reference-store.js');await reference.saveReferencePack({collection:'Fictional update library',version:'1',files:[{path:'wording.md',text:'# Example\nFictional exact wording.'}]},0);
  await (await import('./batches.js')).saveBatch({id:'update-fixture',title:'Fictional recent',createdAt:1780000000000,entries:[{url:'https://www.instagram.com/alex.example/',id:'9007199254740993123',status:'resolved',verifiedAt:1780000000000}]});
  const supplemental={workspace:(await chrome.runtime.sendMessage({type:'workspace.state'})).state,reference:await reference.readReferenceLibrary(),settings:await store.getCaptureSettings(),batch:(await chrome.storage.local.get('gather.batch.update-fixture'))['gather.batch.update-fixture'],source:await store.getCapture(source.id)};
  return {supplemental,inbox,finding,sourceId:source.id,projectId,scanId,subjectId:subject.id,captureId:saved.id,assetId:saved.assets[0].id,sha:saved.assets[0].sha256};
 });
 passed.push('1.8.17 creates fictional Inbox/case/SOC findings, screenshot/source originals, derivative, Reference, recent lookup and preferences in native storage.');await context.close();context=null;
 for(const entry of await fs.readdir(installed))await fs.rm(path.join(installed,entry),{recursive:true,force:true});
 await fs.cp(root,installed,{recursive:true});
 const next=await open();page=next.page;const refreshed=context.waitForEvent('serviceworker',{predicate:w=>w.url().endsWith('/background.js')});await page.evaluate(()=>{setTimeout(()=>chrome.runtime.reload(),50);});await refreshed;page=await context.newPage();await page.goto(base+'/workspace.html');await page.locator('.layout:not([inert])').waitFor();assert.equal(next.base,base,'Same folder must retain the extension ID');assert.equal(await page.evaluate(()=>chrome.runtime.getManifest().version),'1.8.18');
 const restored=await page.evaluate(async snapshot=>{const workspace=(await chrome.runtime.sendMessage({type:'workspace.state'})).state,store=await import('./capture-store.js'),capture=await store.getCapture(snapshot.captureId),asset=await store.getAsset(snapshot.assetId,{verify:true});return {hasProject:workspace.projects.some(x=>x.id===snapshot.projectId),hasScan:workspace.scans.some(x=>x.id===snapshot.scanId),subjects:await store.listSubjects(snapshot.projectId),capture,sha:await store.hashBytes(asset.blob)};},snapshot);
 assert.ok(restored.hasProject&&restored.hasScan);assert.equal(restored.capture.subjectId,snapshot.subjectId);assert.equal(restored.capture.scanId,snapshot.scanId);assert.ok(restored.subjects.some(s=>s.id===snapshot.subjectId));assert.equal(restored.sha,snapshot.sha);passed.push('Replacing files at the same installed folder and reloading the extension preserves extension ID, case, scan, SOC, capture and original bytes.');
 const supplemental=await page.evaluate(async snapshot=>{const store=await import('./capture-store.js'),reference=await import('./reference-store.js');const source=await store.getCapture(snapshot.sourceId);for(const asset of source.assets)await store.getAsset(asset.id,{verify:true});return {workspace:(await chrome.runtime.sendMessage({type:'workspace.state'})).state,reference:await reference.readReferenceLibrary(),settings:await store.getCaptureSettings(),batch:(await chrome.storage.local.get('gather.batch.update-fixture'))['gather.batch.update-fixture'],source};},snapshot);
 assert.deepEqual(supplemental,snapshot.supplemental,'All saved findings, source bytes/derivative records, Reference, recent/settings must survive exactly');
 await page.locator('#inbox').click();await page.locator('[data-item-id="'+snapshot.inbox+'"]').getByRole('button',{name:'Delete saved finding',exact:true}).click();await page.getByRole('dialog',{name:'Delete this saved finding?',exact:true}).getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await context.close();context=null;({page}=await open());const restarted=(await page.evaluate(()=>chrome.runtime.sendMessage({type:'workspace.state'}))).state;assert.ok(!restarted.items.some(i=>i.id===snapshot.inbox));assert.ok(restarted.items.some(i=>i.id===snapshot.finding));assert.equal(restarted.activeScanId,null);
 await page.reload();await page.locator('.layout:not([inert])').waitFor();assert.equal(await page.evaluate(async id=>(await(await import('./capture-store.js')).getCapture(id)).id,snapshot.captureId),snapshot.captureId);passed.push('After update and actual Edge restart, the deleted Inbox finding stays gone; case finding, images, Reference, Recents and preferences were preserved exactly.');
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'passed',kind:'native-installed-update',from:'1.8.17',to:'1.8.18',passed,errors},null,2));console.log('PASS: '+passed.length+' native update groups.');
}catch(error){await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'failed',passed,error:error.stack},null,2));throw error;}finally{await context?.close();await fs.rm(temp,{recursive:true,force:true});}
