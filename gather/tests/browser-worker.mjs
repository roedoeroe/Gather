// REAL module ServiceWorkerGlobalScope + actual background/router/storage code.
// Chrome APIs are controlled doubles; this is not installed-extension acceptance.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const here=path.dirname(fileURLToPath(import.meta.url));
const root=process.env.GATHER_EXTENSION_ROOT||path.resolve(here,'../account-id-tool');
const artifacts=process.env.GATHER_BROWSER_ARTIFACTS||path.resolve(here,'../../artifacts/browser-worker');
await fs.mkdir(artifacts,{recursive:true});await fs.rm(path.join(artifacts,'results.json'),{force:true});
const fixtures={'/test-worker.js':'worker-entry.js','/test-worker-chrome.js':'worker-chrome.js'};
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://test').pathname;
    if(url==='/harness.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Fictional Gather worker test</title>');return;}
    const file=fixtures[url]?path.join(here,'fixtures',fixtures[url]):path.resolve(root,'.'+url);
    if(!fixtures[url]&&!file.startsWith(root+path.sep))throw new Error('Path');
    res.setHeader('Content-Type',path.extname(file)==='.js'?'text/javascript':path.extname(file)==='.css'?'text/css':'text/html');
    res.setHeader('Cache-Control','no-store');res.end(await fs.readFile(file));
  }catch {res.writeHead(404);res.end('Missing fixture');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'gather-worker-'));
let context;const passed=[];
try {
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.GATHER_CHROMIUM_PATH||'/usr/lib/chromium/chromium',headless:true,chromiumSandbox:true});
  const page=await context.newPage();await page.goto(origin+'/harness.html');
  await page.evaluate(async()=>{
    await navigator.serviceWorker.register('/test-worker.js',{type:'module'});await navigator.serviceWorker.ready;
    globalThis.workerCall=async(command,payload)=>{
      const {active}=await navigator.serviceWorker.ready;
      return new Promise((resolve,reject)=>{
        const channel=new MessageChannel(),timer=setTimeout(()=>reject(new Error('Worker request timed out: '+command)),10000);
        channel.port1.onmessage=({data})=>{clearTimeout(timer);channel.port1.close();data.error?reject(new Error(data.error)):resolve(data.value);};
        active.postMessage({command,payload},[channel.port2]);
      });
    };
  });
  const call=(command,payload)=>page.evaluate(({command,payload})=>workerCall(command,payload),{command,payload});
  const send=async(message,from='workspace.html')=>{const r=await call('runtime',{message,page:from});assert.ok(r,'Message not handled');assert.ok(!r.error,r.error);return r;};
  const environment=await call('environment');assert.equal(environment.scope,'ServiceWorkerGlobalScope');assert.equal(environment.hasDocument,false);assert.equal(environment.hasIndexedDB,true);
  for(const from of ['popup.html','workspace.html?panel=1','workspace.html#captures','workspace.html?scan=fictional#settings','index.html','evidence.html'])assert.equal((await send({type:'workspace.state'},from)).state.schemaVersion,1);
  passed.push('Actual background message router opens workspace state from popup, panel, full tool and evidence in ServiceWorkerGlobalScope with real IndexedDB.');
  // Source-page lookup avoids all live network; the exact large ID is a string.
  await send({type:'quick.start',input:'https://www.instagram.com/alex.example/',currentTabId:10},'popup.html');
  await page.waitForFunction(async()=>{const r=await workerCall('runtime',{message:{type:'quick.state'},page:'popup.html'});return r.batch&&!r.busy;});
  const quick=await send({type:'quick.state'},'popup.html');assert.equal(quick.batch.entries[0].id,'9007199254740993123');assert.equal(quick.batch.entries[0].status,'resolved');assert.equal(quick.batch.lookupContext.scanId,null);
  passed.push('Project-free quick lookup runs through the actual background handler and Web Lock, preserves an exact long fictional ID, and completes without live network.');
  const created=await send({type:'workspace.caseCreate',input:await call('caseInput')});
  const pid=created.result.id,sid=created.result.scanId,role=(await call('roles',pid))[0];
  await call('selectRole',{projectId:pid,scanId:sid,subjectId:role.id});
  assert.doesNotMatch(JSON.stringify(created.state),/Alex Example/);
  await send({type:'workspace.launchQueued',id:created.state.research.queue[0].id});
  await send({type:'workspace.search',action:{scanId:sid,provider:'google',query:'Additional Fictional Alias'}});
  assert.ok((await call('tabs')).some(t=>t.url.includes('Alex%20Example')));
  const searches=(await send({type:'workspace.state'})).state.searches;
  assert.deepEqual(searches,[]);
  await assert.rejects(send({type:'workspace.reopenSearch',id:'old'}),/no longer retained/);
  assert.doesNotMatch(JSON.stringify(searches),/Alex Example|Additional Fictional Alias/);
  passed.push('Case creation and queued/manual searches work in the worker without query logs; retired reopen returns clear advice.');
  await send({type:'workspace.assignTab',tabId:10,scanId:sid});
  const other=await send({type:'workspace.action',action:{type:'project.create',name:'Southridge',scanName:'Intake'}});
  const saved=await send({type:'workspace.capture',tabId:10},'popup.html');
  const item=saved.state.items[0];assert.equal(item.scanId,sid);assert.equal(item.filingSubjectId,role.id);
  await send({type:'workspace.action',action:{type:'research.coverage',scanId:sid,subjectId:role.id,family:'instagram',status:'Searched — no reliable match'}});
  await send({type:'workspace.action',action:{type:'research.associate',itemId:item.id,subjectId:role.id,status:'rejected',reason:'Fictional reviewed mismatch'}});
  const launch=await send({type:'capture.start',mode:'visible',tabId:10},'popup.html');
  assert.equal(launch.context.scanId,sid);assert.equal(launch.context.subjectId,role.id);
  await send({type:'capture.finished',launchId:launch.launchId},'capture.html');
  assert.ok(!(await call('session'))['gather.captureLock']);
  passed.push('Tab context preserves Northbridge/role after Southridge switch; metadata save, capture launch/finish, negative coverage and explicit rejection work in the real worker.');
  const pending=await send({type:'capture.start',mode:'selection',afterCapture:'copy',tabId:10},'popup.html');
  const lock=(await call('session'))['gather.captureLock'];assert.equal(lock.source.tabId,10);assert.equal(lock.launchId,pending.launchId);
  await call('closeCaptureWindow',99);assert.ok((await call('session'))['gather.captureLock']);await call('closeCaptureWindow',2);assert.ok(!(await call('session'))['gather.captureLock']);assert.ok(!(await call('session'))['gather.captureLaunch.'+pending.launchId]);
  passed.push('Worker-owned controller-close cleanup uses the frozen source/token, ignores unrelated windows and removes the session lock/seed; scripting remains an API double.');
  const capture=await call('image',{scanId:sid,subjectId:role.id});
  assert.equal(capture.savedState,'saved');
  const stageId=await call('stageBackup');await send({type:'workspace.importImages',stageId});
  const bundle=await call('bundle');assert.equal(bundle.captures.length,2);assert.equal(bundle.assets.length,2);
  const restored=bundle.captures.find(c=>c.id!==capture.id);assert.notEqual(restored.subjectId,capture.subjectId);assert.equal(restored.assets[0].sha256,capture.assets[0].sha256);
  passed.push('Binary image backup validation/import and workspace journal complete inside the real worker, preserving original bytes and remapped relationships.');
  // CDP stops this actual worker; a subsequent message starts a new instance.
  const expected=await call('pendingWrite',sid),cdp=await context.newCDPSession(page);
  const running=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Running worker is not observable')),10000);
    cdp.on('ServiceWorker.workerVersionUpdated',({versions})=>{
      const version=versions.find(v=>v.scriptURL===origin+'/test-worker.js'&&v.runningStatus==='running');
      if(version){clearTimeout(timer);resolve(version);}
    });
  });
  await cdp.send('ServiceWorker.enable');const version=await running;
  await cdp.send('ServiceWorker.stopWorker',{versionId:version.versionId});
  const restarted=await call('environment');assert.notEqual(restarted.generation,environment.generation);
  const recovered=(await send({type:'workspace.state'})).state;assert.equal(recovered.revision,expected);assert.equal(recovered.tasks.filter(t=>t.title==='Recovered fictional task').length,1);
  assert.equal((await call('bundle')).captures.length,2);assert.equal((await call('session'))['gather.case.'+pid].names[role.id],'Alex Example');
  passed.push('Actual Chromium service-worker stop/restart replays a pending workspace journal once, retaining images and session context through controlled storage APIs.');
  // Privacy actions use the actual worker router while lookup work is delayed.
  await call('pauseLookup');
  const active=await send({type:'quick.start',input:'https://www.instagram.com/alex.example/',currentTabId:10,lookupContext:{projectId:pid,scanId:sid,startedAt:1780000000000}},'popup.html');assert.equal(active.busy,true);
  const clearing=send({type:'workspace.clearLookups'});await call('releaseLookup');await clearing;
  const cleared=await send({type:'quick.state'},'popup.html');assert.equal(cleared.batch,null);assert.equal(cleared.input,'');assert.equal(cleared.busy,false);
  const late=await call('runtime',{message:{type:'history.flush',batch:active.batch},page:'index.html'});assert.match(late.error,/cleared/);
  assert.deepEqual(await call('bundle'),bundle);assert.equal((await send({type:'workspace.state'})).state.revision,expected);
  assert.ok(!(await call('local'))['gather.batch.'+active.batch.id]);
  passed.push('Clear recent history stops delayed quick work, rejects stale full-tool flush and preserves case records, original image hashes and relationships in the real worker.');
  await call('pauseLookup');
  const next=await send({type:'quick.start',input:'https://www.instagram.com/alex.example/',currentTabId:10,historyEpoch:cleared.historyEpoch,lookupContext:{projectId:pid,scanId:sid,startedAt:1780000000000}},'popup.html');assert.equal(next.busy,true);
  const guard=await call('guard',pid),deleting=send({type:'workspace.closeProject',projectId:pid,guard});await call('releaseLookup');await deleting;
  const lateCase=await call('runtime',{message:{type:'history.flush',batch:next.batch},page:'index.html'});assert.match(lateCase.error,/deleted/);
  passed.push('A fresh lookup works after clearing; deleting its case stops delayed work and rejects late case-linked saves without recreating case data.');
  const remaining=(await send({type:'workspace.state'})).state;
  assert.ok(!remaining.projects.some(p=>p.id===pid));assert.ok(remaining.projects.some(p=>p.name==='Southridge'));
  const after=await call('bundle');assert.ok(after.captures.every(c=>c.projectId!==pid));assert.equal(after.captures.length,1);
  assert.ok(!(await call('session'))['gather.case.'+pid]);
  passed.push('Guarded Close Case reaches binary purge and session/context cleanup in ServiceWorkerGlobalScope while preserving other projects and restored images.');
  const result={kind:'real-service-worker-with-chrome-api-doubles',nativeExtension:false,environment,passed};
  await fs.writeFile(path.join(artifacts,'results.json'),JSON.stringify(result,null,2));
  console.log('PASS real Chromium service-worker journey with Chrome API doubles\n'+passed.map((x,i)=>`${i+1}. ${x}`).join('\n'));
} finally {await context?.close();await new Promise(resolve=>server.close(resolve));await fs.rm(profile,{recursive:true,force:true});}
