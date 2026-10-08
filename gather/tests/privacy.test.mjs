import test from 'node:test';
import assert from 'node:assert/strict';
let data={},session={},failWrite=false;
Object.defineProperty(globalThis.navigator,'locks',{value:undefined,configurable:true});
globalThis.chrome={storage:{local:{async get(key){return structuredClone(key===null?data:{[key]:data[key]});},async set(values){if(failWrite)throw Error('Storage full');Object.assign(data,structuredClone(values));},async remove(key){delete data[key];}},session:{async get(key){return key===null?session:{[key]:session[key]};},async set(values){Object.assign(session,structuredClone(values));},async remove(key){delete session[key];}}}};
const {saveBatch,loadBatch,saveLookupDraft,historyEpoch,withHistoryLock,scrubLookupArchive,recentBatches,MAX_BATCHES}=await import('../account-id-tool/batches.js');
const {clearLookups,importBackup,backup,saveSearchDraft}=await import('../account-id-tool/workspace-store.js');
const {emptyState}=await import('../account-id-tool/workspace-model.js');
const batch=(id='fictional',epoch)=>({id,historyEpoch:epoch,entries:[{url:'https://www.instagram.com/alex.example/',id:'9007199254740993123',status:'resolved'}]});
function reset(){data={};session={};failWrite=false;}
test('history clear invalidates old batch/draft writes and removes nested archive copies only',async()=>{
 reset();await saveBatch(batch());await saveLookupDraft('gather.draft','fictional draft');
 data['gather.archive.a']={'gather.prefs':{autoCopy:false},'gather.archive.b':{'gather.batch.copy':batch('copy'),'gather.quick':{input:'fictional'},'gather.search-draft.scan':{query:'saved case search'}}};
 data['gather.workspace.v1']=emptyState();session.quickRun={status:'done'};
 const before=structuredClone(data['gather.workspace.v1']);assert.equal((await clearLookups()).result.batches,1);
 assert.equal(await loadBatch('fictional'),null);assert.equal(data['gather.draft'],null);assert.equal(session.quickRun,undefined);
 assert.deepEqual(data['gather.workspace.v1'],before);assert.deepEqual(data['gather.archive.a'],{'gather.prefs':{autoCopy:false},'gather.archive.b':{'gather.search-draft.scan':{query:'saved case search'}}});
 await assert.rejects(saveBatch(batch()),/cleared/);await assert.rejects(saveLookupDraft('gather.draft','late'),/cleared/);
 const epoch=await historyEpoch();await saveBatch(batch('fresh',epoch));await saveLookupDraft('gather.quick',{input:'new fictional'},epoch);assert.equal((await loadBatch('fresh')).entries[0].id,'9007199254740993123');
});
test('fallback lock serializes delayed writers with clear and recovers after rejection',async()=>{
 reset();let release,started;const gate=new Promise(r=>release=r),start=new Promise(r=>started=r),order=[];
 const first=withHistoryLock(async()=>{order.push('first');started();await gate;order.push('done');});
 await start;const second=withHistoryLock(()=>{order.push('second');throw Error('expected');});const rejected=assert.rejects(second,/expected/);
 assert.deepEqual(order,['first']);release();await first;await rejected;await withHistoryLock(()=>order.push('third'));assert.deepEqual(order,['first','done','second','third']);
});
test('failed clear does not change epoch or lose saved history',async()=>{
 reset();await saveBatch(batch());failWrite=true;await assert.rejects(clearLookups(),/Storage full/);failWrite=false;assert.equal(await historyEpoch(),'');assert.ok(await loadBatch('fictional'));await saveBatch(batch('another'));
});
test('deleted case cannot be resurrected by late lookup writes, unrelated quick lookup remains usable',async()=>{
 reset();data['gather.workspace.v1']=emptyState();await assert.rejects(saveBatch({...batch(),lookupContext:{projectId:'deleted',scanId:'deleted-scan'}}),/deleted/);await saveBatch(batch('unassigned'));assert.ok(await loadBatch('unassigned'));
});
test('restore rebases batch epoch and never restores a foreign runtime epoch',async()=>{
 reset();await clearLookups();const epoch=await historyEpoch();await importBackup({format:'gather-backup',schemaVersion:1,createdAt:1,workspace:emptyState(),legacy:{'gather.lookupEpoch':'foreign','gather.batch.imported':batch('imported','foreign')}});
 assert.equal(await historyEpoch(),epoch);const restored=await loadBatch('imported');assert.equal(restored.historyEpoch,epoch);await saveBatch(restored);assert.ok(!Object.hasOwn((await backup()).legacy,'gather.lookupEpoch'));
});
test('archive recursion is bounded and excessive nesting leaves clear atomic',async()=>{
 reset();let nested={'gather.batch.fictional':batch()};for(let i=0;i<66;i++)nested={'gather.archive.child':nested};data['gather.archive.deep']=nested;await assert.rejects(clearLookups(),/deeply nested/);assert.equal(await historyEpoch(),'');assert.deepEqual(data['gather.archive.deep'],nested);
 assert.deepEqual(scrubLookupArchive({'gather.prefs':{label:'fictional'},'gather.batch.a':batch()},k=>k.startsWith('gather.batch.')),{'gather.prefs':{label:'fictional'}});
});

test('late search drafts and session edits cannot recreate deleted case context',async()=>{
 reset();data['gather.workspace.v1']=emptyState();assert.equal((await saveSearchDraft('deleted-scan',{query:'fictional late query',provider:'google'})).retained,false);
 const {updateCaseSession}=await import('../account-id-tool/case-session.js');await assert.rejects(updateCaseSession('deleted',()=>({names:{role:'Fictional name'}})),/closed/);assert.deepEqual(session,{});assert.equal(data['gather.search-draft.deleted-scan'],undefined);
 await saveSearchDraft(null,{query:'new fictional query',provider:'google'});assert.equal(data['gather.search-draft.inbox'],undefined);
});
test('late quick draft cannot reference a removed batch in the current epoch',async()=>{
 reset();await assert.rejects(saveLookupDraft('gather.quick',{batchId:'removed',input:'fictional'}),/deleted/);assert.equal(data['gather.quick'],undefined);
});


test('Recent retains five newest batches, removes archive copies and blocks late resurrection',async()=>{
 reset();data['gather.workspace.v1']=emptyState();const workspace=structuredClone(data['gather.workspace.v1']);
 for(let i=1;i<=5;i++)await saveBatch({...batch('recent-'+i),createdAt:i,updatedAt:i});
 data['gather.archive.old']={'gather.batch.recent-1':batch('recent-1'),'gather.prefs':{autoCopy:true}};
 data['gather.quick']={batchId:'recent-1',input:'fictional old input',submittedInput:'fictional'};
 await saveBatch({...batch('recent-6'),createdAt:6,updatedAt:6});
 assert.equal(MAX_BATCHES,5);assert.deepEqual((await recentBatches()).map(b=>b.id),[6,5,4,3,2].map(i=>'recent-'+i));
 assert.equal(await loadBatch('recent-1'),null);assert.deepEqual(data['gather.quick'],{input:'',submittedInput:'',batchId:null});
 assert.deepEqual(data['gather.archive.old'],{'gather.prefs':{autoCopy:true}});assert.deepEqual(data['gather.workspace.v1'],workspace);
 await assert.rejects(saveBatch({...batch('recent-1'),createdAt:1,updatedAt:999}),/left Recent/);
 await assert.rejects(saveLookupDraft('gather.quick',{batchId:'recent-1',input:'late'}),/deleted/);
});
test('Recent migrates older storage on read and an unsuccessful trim leaves all contents intact',async()=>{
 reset();for(let i=1;i<=8;i++)data['gather.batch.migrate-'+i]={...batch('migrate-'+i),createdAt:i,updatedAt:i};
 const before=structuredClone(data);failWrite=true;await assert.rejects(recentBatches(),/Storage full/);assert.deepEqual(data,before);failWrite=false;
 assert.deepEqual((await recentBatches()).map(b=>b.id),[8,7,6,5,4].map(i=>'migrate-'+i));
 for(let i=1;i<=3;i++)assert.equal(await loadBatch('migrate-'+i),null);
});
test('Updating an existing batch does not make it newer than a later lookup',async()=>{
 reset();for(let i=1;i<=5;i++)await saveBatch({...batch('order-'+i),createdAt:i,updatedAt:i});
 await saveBatch({...batch('order-1'),createdAt:1,updatedAt:100});await saveBatch({...batch('order-6'),createdAt:6,updatedAt:6});
 assert.equal(await loadBatch('order-1'),null);assert.equal((await recentBatches())[0].id,'order-6');
});

test('restoring older backups enforces five recent batches in the same storage commit',async()=>{
 reset();const legacy={};for(let i=1;i<=8;i++)legacy['gather.batch.backup-'+i]={...batch('backup-'+i),createdAt:i,updatedAt:i};
 await importBackup({format:'gather-backup',schemaVersion:1,createdAt:1,workspace:emptyState(),legacy});
 assert.equal(Object.entries(data).filter(([k,v])=>k.startsWith('gather.batch.')&&v).length,5);
 assert.deepEqual((await recentBatches()).map(b=>b.id),[8,7,6,5,4].map(i=>'backup-'+i));
});
