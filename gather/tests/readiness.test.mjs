import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile} from '../account-id-tool/core.js';
const profile=normalizeProfile('instagram.com/alex.example'),id='9007199254740993123';
let tab,availableAt,files,reads,sourceReads;
function reset(){tab={url:profile.url,status:'loading'};availableAt=Infinity;files=0;reads=0;sourceReads=0;}
globalThis.chrome={runtime:{id:'fictional'},tabs:{async get(){return {...tab};}},scripting:{async executeScript({files:bundle,args}){if(bundle){files++;return [{documentId:'document-a'}];}reads++;if(args[1])sourceReads++;return [{documentId:'document-a',result:Date.now()>=availableAt?{id,method:'fixture'}:{error:'No matching account ID was exposed by this page.'}}];}}};
globalThis.fetch=async()=>{throw new Error('No live network in readiness fixtures');};
const {resolveProfile}=await import('../account-id-tool/resolver.js');
test('ready metadata has no artificial two-second delay even when tab status is loading',async()=>{reset();availableAt=0;const start=Date.now(),r=await resolveProfile(profile,{currentTabId:1});assert.equal(r.id,id);assert.ok(Date.now()-start<1000);assert.equal(reads,1);assert.equal(sourceReads,0);});
test('metadata appearing during the buffer succeeds in one operation and reuses the pinned reader',async()=>{reset();availableAt=Date.now()+450;const r=await resolveProfile(profile,{currentTabId:1});assert.equal(r.id,id);assert.ok(reads>=2&&reads<=9);assert.equal(files,1);assert.equal(sourceReads,0);});
test('an explicitly matching pending URL may settle before the document is read',async()=>{reset();tab={url:'about:blank',pendingUrl:profile.url,status:'loading'};const timer=setTimeout(()=>{tab={url:profile.url,status:'loading'};availableAt=0;},100);try{assert.equal((await resolveProfile(profile,{currentTabId:1})).id,id);assert.equal(files,1);}finally{clearTimeout(timer);}});
test('a different pending profile invalidates even a ready ID',async()=>{reset();availableAt=0;tab.pendingUrl='https://www.instagram.com/other.example/';assert.match((await resolveProfile(profile,{currentTabId:1})).error,/changed/);assert.equal(files,0);});
test('navigation during the buffer cannot produce a result from the old profile',async()=>{reset();availableAt=Date.now()+800;const timer=setTimeout(()=>tab.pendingUrl='https://www.instagram.com/other.example/',100);try{const r=await resolveProfile(profile,{currentTabId:1});assert.match(r.error,/changed/);assert.ok(!r.id);assert.equal(sourceReads,0);}finally{clearTimeout(timer);}});
test('cancellation interrupts the readiness timer without continuing into source fallback',async()=>{reset();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),100);try{await assert.rejects(resolveProfile(profile,{currentTabId:1,signal:controller.signal}),{name:'AbortError'});assert.equal(sourceReads,0);}finally{clearTimeout(timer);}});
