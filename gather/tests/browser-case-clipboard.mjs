// Actual rendered product modules + native canvas/IndexedDB. Chrome extension APIs
// are controlled doubles: this is NOT native extension/activeTab acceptance.
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import http from 'node:http';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=process.env.GATHER_EXTENSION_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../account-id-tool'),artifacts=process.env.GATHER_BROWSER_ARTIFACTS||path.resolve(root,'../../artifacts/browser-case-clipboard');await fs.mkdir(artifacts,{recursive:true});await fs.rm(path.join(artifacts,'results.json'),{force:true});
const server=http.createServer(async(req,res)=>{try{if(req.url==='/fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><style>html{scroll-behavior:smooth}body{margin:0;font:24px sans-serif;background:#eef4ef}header{position:sticky;top:0;background:#17684b;color:white;padding:20px}.block{height:750px;padding:20px}</style><header>Northbridge — fictional fixture</header><div class="block">Alex Example · October review</div><div class="block">Second section — deterministic data</div><div class="block">Third section — no real people</div>');return;}const name=decodeURIComponent(new URL(req.url,'http://test').pathname).slice(1)||'workspace.html';const full=path.resolve(root,name);if(!full.startsWith(root+path.sep))throw new Error('path');const data=await fs.readFile(full);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(full)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('missing');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,profile=await fs.mkdtemp(path.join(os.tmpdir(),'gather-rendered-'));let context,source;
try{
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.GATHER_CHROMIUM_PATH||'/usr/lib/chromium/chromium',chromiumSandbox:true,headless:true,viewport:{width:1280,height:800}});
  await context.exposeBinding('__gatherInject',async(_,{fn,args})=>source.evaluate(({fn,args})=>{const f=(0,eval)('('+fn+')');return f(...args);},{fn,args}));
  await context.exposeBinding('__gatherScreenshot',async()=>{await source.bringToFront();return 'data:image/png;base64,'+(await source.screenshot()).toString('base64');});
  await context.addInitScript(({origin})=>{
    if(location.pathname==='/fixture')return;origin=location.origin;
    const event=()=>{const listeners=new Set();return {addListener:f=>listeners.add(f),removeListener:f=>listeners.delete(f),emit:(...args)=>{for(const f of listeners)f(...args);}};};
    const changed=event(),area=prefix=>({async get(key){const all=JSON.parse(localStorage.getItem(prefix)||'{}');return key===null?all:{[key]:all[key]};},async set(values){const all=JSON.parse(localStorage.getItem(prefix)||'{}'),changes={};for(const [key,value]of Object.entries(values)){changes[key]={oldValue:all[key],newValue:value};all[key]=value;}localStorage.setItem(prefix,JSON.stringify(all));changed.emit(changes,prefix==='local'?'local':'session');},async remove(key){const all=JSON.parse(localStorage.getItem(prefix)||'{}');delete all[key];localStorage.setItem(prefix,JSON.stringify(all));},async setAccessLevel(){}});
    const readTabs=()=>JSON.parse(localStorage.getItem('mockTabs')||'[]'),writeTabs=rows=>localStorage.setItem('mockTabs',JSON.stringify(rows));
    const tabs={onCreated:event(),onRemoved:event(),onActivated:event(),onUpdated:event(),onReplaced:event(),async query(q){return readTabs().filter(t=>(!q?.active||t.active)&&(!q?.windowId||t.windowId===q.windowId));},async get(id){const t=readTabs().find(t=>t.id===id);if(!t)throw new Error('No tab');return t;},async getCurrent(){return location.pathname==='/workspace.html'&&!location.search?{id:99}:undefined;},async create(options){const t={id:Math.floor(Math.random()*1e8),windowId:1,active:options.active!==false,...options};const rows=readTabs();if(t.active)rows.forEach(r=>r.active=false);rows.push(t);writeTabs(rows);tabs.onCreated.emit(t);return t;},async update(id,options){const rows=readTabs(),t=rows.find(t=>t.id===id);if(options.active)rows.forEach(r=>r.active=false);Object.assign(t,options);writeTabs(rows);tabs.onUpdated.emit(id,options,t);return t;},async remove(id){writeTabs(readTabs().filter(t=>t.id!==id));tabs.onRemoved.emit(id);},async captureVisibleTab(){return __gatherScreenshot();}};
    const windows={onRemoved:event(),async getCurrent(){return {id:location.pathname==='/capture.html'?2:1};},async get(id){if(id===2&&localStorage.getItem('captureOpen')!=='true')throw new Error('No window');return {id};},async update(){return {};},async create({url}){localStorage.setItem('captureOpen','true');window.open(url,'gather-test-capture');return {id:2};}};
    let downloadId=1;const downloads={onChanged:event(),async download(options){if(localStorage.getItem('denyDownloads')==='true')throw new Error('Folder access denied (test double)');const n=downloadId++;localStorage.setItem('lastDownload',JSON.stringify(options));return n;},async search({id}){return [{id,state:'complete'}];}};
    globalThis.chrome={runtime:{id:'gather-test',getURL:f=>origin+'/'+f,onMessage:event(),onInstalled:event(),onStartup:event(),async sendMessage(m){try{if(m.type==='capture.start')return await (await import(origin+'/capture-launch.js')).launchCapture(m);if(m.type==='capture.finished')return await (await import(origin+'/capture-launch.js')).finishCapture(m.launchId);if(m.type.startsWith('quick.'))return await (await import(origin+'/quick-worker.js')).handleQuick(m);return await (await import(origin+'/workspace-store.js')).handleWorkspace(m);}catch(e){return {error:e.message};}}},storage:{local:area('local'),session:area('session'),onChanged:changed},tabs,windows,downloads,scripting:{async executeScript({func,args=[]}){return [{result:await __gatherInject({fn:func.toString(),args}),documentId:'fixture-document'}];}},contextMenus:{update:async()=>{}},action:{setBadgeText:async()=>{}},sidePanel:{open:async()=>{}}};
    globalThis.__seedTabs=rows=>writeTabs(rows);
    addEventListener('storage',event=>{if(['local','session'].includes(event.key)){const before=JSON.parse(event.oldValue||'{}'),after=JSON.parse(event.newValue||'{}'),diff={};for(const key of new Set([...Object.keys(before),...Object.keys(after)]))if(JSON.stringify(before[key])!==JSON.stringify(after[key]))diff[key]={oldValue:before[key],newValue:after[key]};changed.emit(diff,event.key);}});
  },{origin});
  source=await context.newPage();await source.goto(origin+'/fixture');const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/workspace.html');
  await page.evaluate(({origin})=>__seedTabs([{id:10,windowId:1,url:origin+'/fixture',title:'Northbridge fictional page',active:true}]),{origin});
  context.setDefaultTimeout(7000);
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  const events=[],failures=[];
  const check=async(name,fn)=>{try{await fn();events.push(name);console.log('PASS: '+name);}catch(e){failures.push({name,error:e.message});console.error('FAIL: '+name+'\n'+e.message);}};
  const ids=await page.evaluate(async()=>{
    const send=async(type,data={})=>{const r=await chrome.runtime.sendMessage({type,...data});if(r.error)throw new Error(r.error);return r;};
    const {parseIntake}=await import('./case-model.js');
    const first=await send('workspace.caseCreate',{input:{mode:'local',name:'Northbridge',scanName:'October review',fields:parseIntake('SOC: Alex Example')}});
    const projectId=first.result.id,scanId=first.result.scanId,subject=(await(await import('./capture-store.js')).listSubjects(projectId))[0];
    await(await import('./capture-store.js')).selectSubject(scanId,subject.id,projectId);
    const {normalizeProfile}=await import('./core.js');const items={};
    for(const [name,status,id] of [['candidate','candidate','9007199254740993123'],['confirmed','confirmed','9007199254740993124'],['rejected','rejected','9007199254740993125']]){
      const r=await send('workspace.action',{action:{type:'item.save',kind:'account',scanId,entry:{...normalizeProfile('instagram.com/fictional_'+name),status:'resolved',id,verifiedAt:1780000000000,verificationSource:'live',notes:[],providedIds:[]}}});
      items[name]=r.result.id;
      await send('workspace.action',{action:{type:'research.associate',itemId:r.result.id,subjectId:subject.id,status,reason:'Analyst decision on deterministic fictional fixture'}});
    }
    const other=await send('workspace.action',{action:{type:'project.create',name:'Southridge',scanName:'Intake'}});
    await send('workspace.action',{action:{type:'context.select',scanId}});
    return {projectId,scanId,subjectId:subject.id,items,otherScan:other.result.scanId};
  });
  const send=async action=>{const r=await page.evaluate(action=>chrome.runtime.sendMessage({type:'workspace.action',action}),action);assert.ok(!r.error,r.error);return r;};
  const closePreview=async()=>{const d=page.getByRole('dialog');if(await d.count())await d.getByRole('button',{name:'Cancel',exact:true}).click();};
  const openPreview=async(name='Copy role account block')=>{
    await closePreview();await send({type:'context.select',scanId:ids.scanId});
    await page.getByRole('heading',{name:'October review',exact:true}).waitFor();
    await page.getByRole('tab',{name:'Case',exact:true}).click();
    const menu=page.locator('.case-secondary');await menu.waitFor();
    if(!await menu.evaluate(e=>e.open))await menu.locator('summary').click();
    await page.getByRole('button',{name,exact:true}).click();
    await page.getByLabel('Clipboard preview').waitFor();return page.getByRole('dialog');
  };
  const spy=async()=>page.evaluate(()=>{globalThis.__originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);globalThis.__writes=[];navigator.clipboard.writeText=async text=>{__writes.push(text);};});
  const unspy=async()=>page.evaluate(()=>{if(globalThis.__originalWrite)navigator.clipboard.writeText=__originalWrite;});
  await check('Copied role observations preserve Candidate/Confirmed, check date and exact IDs; rejected accounts stay omitted.',async()=>{
    const d=await openPreview(),text=await page.getByLabel('Clipboard preview').inputValue();
    assert.match(text,/Candidate.*9007199254740993123/);assert.match(text,/Confirmed.*9007199254740993124/);
    assert.doesNotMatch(text,/9007199254740993125/);assert.match(text,/Checked: 2026-05-28T20:26:40.000Z/);
    await d.getByRole('button',{name:'Copy',exact:true}).click();await d.waitFor({state:'detached'});
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),text);
  });
  await check('A clipboard denial is visible inside the preview and selects the text for manual copy.',async()=>{
    const d=await openPreview();await page.evaluate(()=>{globalThis.__originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new DOMException('Denied fictional clipboard','NotAllowedError');};});
    try{await d.getByRole('button',{name:'Copy',exact:true}).click();await d.locator('[role="alert"]').filter({hasText:/copy.*blocked|could not copy/i}).waitFor();
      assert.equal(await page.getByLabel('Clipboard preview').evaluate(e=>e.selectionEnd-e.selectionStart), (await page.getByLabel('Clipboard preview').inputValue()).length);
      assert.equal(await d.getByRole('button',{name:'Copy',exact:true}).isEnabled(),true);
      await page.screenshot({path:path.join(artifacts,'clipboard-denied.png'),fullPage:true});
      await page.setViewportSize({width:400,height:900});
      const bounds=await d.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=400);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(artifacts,'clipboard-denied-narrow.png'),fullPage:true});
      await page.setViewportSize({width:1280,height:800});
    }finally{await unspy();}
  });
  await check('Changing an analyst association clears the old preview and blocks stale copying.',async()=>{
    const d=await openPreview();await spy();
    try{await send({type:'research.associate',itemId:ids.items.candidate,subjectId:ids.subjectId,status:'rejected',reason:'Changed analyst decision'});
      await page.waitForFunction(()=>document.querySelector('[aria-label="Clipboard preview"]')?.value==='');
      assert.equal(await d.getByRole('button',{name:'Copy',exact:true}).isDisabled(),true);
      assert.deepEqual(await page.evaluate(()=>__writes),[]);
    }finally{await unspy();await closePreview();await send({type:'research.associate',itemId:ids.items.candidate,subjectId:ids.subjectId,status:'candidate',reason:'Analyst decision on deterministic fictional fixture'});}
  });
  await check('Switching the global case during preview keeps the originally reviewed Northbridge block.',async()=>{
    const d=await openPreview(),text=await page.getByLabel('Clipboard preview').inputValue();
    await send({type:'context.select',scanId:ids.otherScan});await page.getByRole('heading',{name:'Intake',exact:true}).waitFor();
    assert.equal(await page.getByLabel('Clipboard preview').inputValue(),text);
    await d.getByRole('button',{name:'Copy',exact:true}).click();await d.waitFor({state:'detached'});
    const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(copied,text);assert.match(copied,/Northbridge/);assert.doesNotMatch(copied,/Southridge/);
  });
  await check('Cancel while freshness validation is delayed does not write to the clipboard afterwards.',async()=>{
    const d=await openPreview();await spy();await page.evaluate(()=>{
      globalThis.__originalSend=chrome.runtime.sendMessage;let held=false;
      chrome.runtime.sendMessage=async m=>{if(m.type==='workspace.state'&&!held){held=true;globalThis.__readWaiting=true;await new Promise(r=>globalThis.__releaseRead=r);}return __originalSend(m);};
    });
    try{await d.getByRole('button',{name:'Copy',exact:true}).click();await page.waitForFunction(()=>globalThis.__readWaiting);
      await d.getByRole('button',{name:'Cancel',exact:true}).click();await page.evaluate(()=>__releaseRead());
      await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>__writes),[]);
    }finally{await page.evaluate(()=>{if(globalThis.__releaseRead)__releaseRead();chrome.runtime.sendMessage=__originalSend;});await unspy();}
  });
  await check('An updated coverage result invalidates its open clipboard preview too.',async()=>{
    await send({type:'research.coverage',scanId:ids.scanId,subjectId:ids.subjectId,family:'instagram',status:'Searched — no reliable match'});
    const d=await openPreview('Copy coverage summary');assert.match(await page.getByLabel('Clipboard preview').inputValue(),/Searched — no reliable match/);
    await send({type:'research.coverage',scanId:ids.scanId,subjectId:ids.subjectId,family:'instagram',status:'Candidate'});
    await page.waitForFunction(()=>document.querySelector('[aria-label="Clipboard preview"]')?.value==='');assert.equal(await d.getByRole('button',{name:'Copy',exact:true}).isDisabled(),true);
  });
  await check('Deleting the case in another workspace releases preview text and disables Copy.',async()=>{
    const d=await openPreview();await spy();const other=await context.newPage();await other.goto(origin+'/workspace.html');
    try{await other.getByRole('tab',{name:'Settings',exact:true}).click();await other.getByRole('button',{name:'Delete case…',exact:true}).click();
      await other.getByLabel('Type the case name to confirm deletion: Northbridge',{exact:true}).fill('Northbridge');
      await other.getByRole('dialog').getByRole('button',{name:'Delete without backup',exact:true}).click();await other.getByRole('dialog').waitFor({state:'detached'});
      await page.waitForFunction(()=>document.querySelector('[aria-label="Clipboard preview"]')?.value==='');assert.equal(await d.getByRole('button',{name:'Copy',exact:true}).isDisabled(),true);assert.deepEqual(await page.evaluate(()=>__writes),[]);
      await page.screenshot({path:path.join(artifacts,'deleted-case-preview.png'),fullPage:true});
    }finally{await unspy();await other.close();}
  });
  await closePreview();assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(artifacts,'results.json'),JSON.stringify({kind:'rendered-browser-with-extension-api-doubles',nativeExtension:false,passed:events,failures,errors},null,2)+'\n');
  assert.deepEqual(failures,[]);console.log('PASS: '+events.length+' case clipboard groups.');
}finally{await context?.close();server.close();await fs.rm(profile,{recursive:true,force:true});}
