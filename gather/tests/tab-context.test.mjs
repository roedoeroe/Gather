import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,reduceWorkspace,validateWorkspace,mergeWorkspace} from '../account-id-tool/workspace-model.js';
import {cleanLookupContext} from '../account-id-tool/lookup-context.js';
let session={},local={},tabs=new Map(),nextTabId=10,navigate;
const area=db=>({async get(key){return key===null?structuredClone(db()):{[key]:structuredClone(db()[key])};},async set(value){Object.assign(db(),structuredClone(value));}});
globalThis.chrome={storage:{session:area(()=>session),local:area(()=>local)},tabs:{
  async query(){return [...tabs.values()];},async get(id){if(!tabs.has(id))throw new Error('No tab');return tabs.get(id);},
  async create(options){const tab={id:nextTabId++,...options};tabs.set(tab.id,tab);return tab;},
  async update(id,options){await navigate?.(id,options);Object.assign(tabs.get(id),options);return tabs.get(id);},async remove(id){tabs.delete(id);}
}};
const tc=await import('../account-id-tool/tab-context.js');
const store=await import('../account-id-tool/workspace-store.js');
function fixture(){session={};local={};tabs=new Map();nextTabId=10;navigate=undefined;let state=emptyState();const run=a=>{const r=reduceWorkspace(state,a,1780000000000);state=r.state;return r.result;};const a=run({type:'project.create',name:'Northbridge',scanName:'October review'}).scanId,b=run({type:'project.create',name:'Southridge',scanName:'Intake'}).scanId,search=run({type:'search.prepare',scanId:a,query:'Alex Example',provider:'google'}).id;local['gather.workspace.v1']=state;return {state,a,b,search,projectId:state.scans[0].projectId};}
const bind=(f,id=10)=>tc.bindTabContext(id,{scanId:f.a,projectId:f.projectId,originatingSearchId:f.search},'search');

test('browser opener relationship inherits the search while global destination differs',async()=>{
  const f=fixture();await bind(f);await tc.inheritTabContext({id:11,openerTabId:10,url:'https://example.test/result'});
  const r=await tc.resolveTabContext(f.state,11);assert.equal(r.context.scanId,f.a);assert.equal(r.context.originatingSearchId,f.search);assert.equal(r.context.source,'related');assert.match(r.label,/Northbridge/);
  assert.deepEqual(Object.keys(session[tc.TAB_CONTEXT_KEY][11]).sort(),['originatingSearchId','projectId','scanId','source']);
});
test('unknown or missing opener never invents a relationship from matching URLs',async()=>{
  const f=fixture();await bind(f);for(const tab of [{id:11,url:'https://www.google.com/search?q=Alex'}, {id:12,openerTabId:999}]){await tc.inheritTabContext(tab);const r=await tc.resolveTabContext(f.state,tab.id);assert.equal(r.context.scanId,f.b);assert.equal(r.assigned,false);assert.equal(r.context.originatingSearchId,null);}
});
test('explicit reassignment clears originating search and detachment stops inheritance',async()=>{
  const f=fixture();await bind(f);await store.handleWorkspace({type:'workspace.assignTab',tabId:10,scanId:f.b}).catch(()=>{});
  tabs.set(10,{id:10});const moved=await store.handleWorkspace({type:'workspace.assignTab',tabId:10,scanId:f.b});assert.equal(moved.context.scanId,f.b);assert.equal(moved.context.originatingSearchId,null);
  await tc.detachTabContext(10);await tc.inheritTabContext({id:10,openerTabId:12});await tc.inheritTabContext({id:11,openerTabId:10});assert.equal((await tc.resolveTabContext(f.state,10)).context.source,'detached');assert.equal((await tc.resolveTabContext(f.state,11)).assigned,false);
});
test('worker module restart retains assignment while a browser session reset drops it',async()=>{
  const f=fixture();await bind(f);const restarted=await import('../account-id-tool/tab-context.js?worker-restart');assert.equal((await restarted.resolveTabContext(f.state,10)).context.scanId,f.a);session={};assert.equal((await restarted.resolveTabContext(f.state,10)).context.scanId,f.b);
});
test('closed parent does not retarget child and stale tab IDs are pruned',async()=>{
  const f=fixture();await bind(f);await tc.inheritTabContext({id:11,openerTabId:10});await tc.removeTabContext(10);assert.equal((await tc.resolveTabContext(f.state,11)).context.scanId,f.a);await bind(f,12);tabs.set(11,{id:11});await tc.pruneTabContexts();assert.deepEqual(Object.keys(session[tc.TAB_CONTEXT_KEY]),['11']);
});
test('browser replacement transfers explicit context without inspecting a URL',async()=>{
  const f=fixture();await bind(f);await tc.replaceTabContext(20,10);assert.equal((await tc.resolveTabContext(f.state,20)).context.originatingSearchId,f.search);assert.equal((await tc.resolveTabContext(f.state,10)).assigned,false);
});
test('search is assigned before navigating and immediate result tabs retain origin',async()=>{
  const f=fixture();navigate=async(id,options)=>{assert.equal(tabs.get(id).url,'about:blank');assert.equal(tabs.get(id).active,false);assert.equal((await tc.resolveTabContext(await store.readWorkspace(),id)).context.scanId,f.a);await tc.inheritTabContext({id:99,openerTabId:id});};
  await store.openSearch({scanId:f.a,provider:'google',query:'Alex Example'});const r=await tc.resolveTabContext(await store.readWorkspace(),99);assert.equal(r.context.scanId,f.a);assert.equal(r.context.originatingSearchId,(await store.readWorkspace()).searches.at(-1).id);
});
test('page save uses frozen tab context despite delayed read, reassignment and active switch',async()=>{
  const f=fixture();await bind(f);let release;const oldGet=chrome.tabs.get;chrome.tabs.get=id=>new Promise(resolve=>release=()=>resolve({id,url:'https://example.test/report',title:'Fictional report'}));
  const pending=store.capturePage(f.b,10);while(!release)await new Promise(r=>setImmediate(r));await tc.bindTabContext(10,{scanId:f.b,projectId:f.state.scans[1].projectId});await store.dispatch({type:'context.select',scanId:f.b});release();const result=await pending;chrome.tabs.get=oldGet;
  assert.equal(result.state.items[0].scanId,f.a);assert.equal(result.state.items[0].originatingSearchId,f.search);assert.equal(result.result.scanId,f.a);validateWorkspace(result.state);
});
test('backup merge remaps saved research search references and preserves moved original scope',async()=>{
  const f=fixture();const saved=reduceWorkspace(f.state,{type:'item.save',kind:'source',scanId:f.a,url:'https://example.test',originatingSearchId:f.search},1780000000000);const moved=reduceWorkspace(saved.state,{type:'item.move',id:saved.result.id,scanId:f.b},1780000000001);validateWorkspace(moved.state);const merged=mergeWorkspace(moved.state,moved.state);validateWorkspace(merged);assert.notEqual(merged.items.at(-1).originatingSearchId,f.search);assert.equal(merged.items.at(-1).originatingSearchId,merged.searches.at(-1).id);
});
test('cross-project search references are rejected and quick lookup retains exact reference',()=>{
  const f=fixture();assert.throws(()=>reduceWorkspace(f.state,{type:'item.save',kind:'source',scanId:f.b,url:'https://example.test',originatingSearchId:f.search}),/does not match/);assert.equal(cleanLookupContext({scanId:f.a,projectId:f.projectId,startedAt:1780000000000,originatingSearchId:f.search}).originatingSearchId,f.search);
});
