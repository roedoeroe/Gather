import test from 'node:test';import assert from 'node:assert/strict';
import {WORKSPACE_KEY} from '../account-id-tool/workspace-model.js';
import {captureContext,saveDestination} from '../account-id-tool/lookup-context.js';
const local={},session={};
const area=db=>({async get(key){return key===null?structuredClone(db):{[key]:structuredClone(db[key])};},async set(values){Object.assign(db,structuredClone(values));},async remove(key){delete db[key];}});
globalThis.chrome={runtime:{id:'synthetic-extension'},scripting:{},storage:{local:area(local),session:area(session)},tabs:{remove:async()=>{}}};
if(!navigator.locks)Object.defineProperty(navigator,'locks',{value:{async request(name,options,callback){return (callback||options)({name});}}});
let releaseFetch,requested=false;
globalThis.fetch=async url=>{assert.equal(url,'https://www.instagram.com/northbridge/');requested=true;await new Promise(resolve=>releaseFetch=resolve);const response=new Response('<script>{"username":"northbridge","id":9007199254740993123,"full_name":"Northbridge"}</script>');Object.defineProperty(response,'url',{value:url});return response;};
const {dispatch,readWorkspace,backup,importBackup}=await import('../account-id-tool/workspace-store.js');
const {handleQuick}=await import('../account-id-tool/quick-worker.js');
const {loadBatch}=await import('../account-id-tool/batches.js');
async function until(fn){for(let i=0;i<100;i++){const result=await fn();if(result)return result;await new Promise(r=>setImmediate(r));}throw new Error('Synthetic operation did not finish');}
test('real quick worker resolves a delayed fixture, retains origin after switch, saves to origin and restores batch',async()=>{
  local['gather.prefs']={browserFallback:false};
  const a=(await dispatch({type:'project.create',name:'Northbridge',scanName:'October'})).result.scanId;
  const origin=captureContext(await readWorkspace(),1780000000000);
  const running=await handleQuick({type:'quick.start',input:'instagram.com/northbridge/',lookupContext:origin});assert.ok(running.busy);
  await until(()=>requested);
  const b=(await dispatch({type:'project.create',name:'Southridge',scanName:'Intake'})).result.scanId;releaseFetch();
  const done=await until(async()=>{const r=await handleQuick({type:'quick.state'});return !r.busy&&r;});
  assert.equal(done.batch.entries[0].id,'9007199254740993123');assert.equal(done.batch.entries[0].status,'resolved');assert.equal(done.batch.lookupContext.scanId,a);
  const restored=await loadBatch(done.batch.id);assert.deepEqual(restored.lookupContext,origin);
  const state=await readWorkspace();assert.equal(state.activeScanId,b);
  await dispatch({type:'item.save',kind:'account',scanId:saveDestination(state,restored.lookupContext),entry:restored.entries[0]});assert.equal((await readWorkspace()).items[0].scanId,a);
});
test('backup merged into existing work remaps lookup destination with the imported scan',async()=>{
  const saved=await backup(),sourceBatch=Object.values(saved.legacy).find(x=>x?.lookupContext&&x.entries),origin=sourceBatch.lookupContext.scanId;
  const result=await importBackup(saved),batches=Object.entries(local).filter(([k])=>k.startsWith('gather.batch.')).map(([,v])=>v),imported=batches.find(b=>b.lookupContext?.scanId!==origin);
  assert.ok(imported);assert.notEqual(imported.lookupContext.scanId,origin);assert.ok(result.state.scans.some(s=>s.id===imported.lookupContext.scanId));assert.equal(imported.entries[0].id,'9007199254740993123');
});
test('worker recovery marks interrupted lookup stopped without dropping its starting scan',async()=>{
  const batch=Object.values(local).find(x=>x?.lookupContext&&x.entries);batch.entries[0].status='loading';local['gather.quick']={batchId:batch.id,input:batch.entries[0].url,submittedInput:batch.entries[0].url};session.quickRun={batchId:batch.id,status:'running'};
  const restarted=await import('../account-id-tool/quick-worker.js?synthetic-restart');
  const state=await restarted.handleQuick({type:'quick.state'});assert.equal(state.interrupted,true);assert.equal(state.batch.entries[0].status,'stopped');assert.deepEqual(state.batch.lookupContext,batch.lookupContext);
});
