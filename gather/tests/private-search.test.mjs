import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,reduceWorkspace,validateWorkspace,WORKSPACE_KEY,report} from '../account-id-tool/workspace-model.js';
import {forgetSearchText} from '../account-id-tool/search-privacy.js';
import {IMAGE_PROVIDERS,imageSearchUrl} from '../account-id-tool/image-search.js';
let local={},session={},tabs=[],failNavigate=false;
const area=db=>({async get(key){return structuredClone(key===null?db():{[key]:db()[key]});},async set(value){Object.assign(db(),structuredClone(value));},async remove(keys){for(const key of [].concat(keys))delete db()[key];}});
globalThis.chrome={storage:{local:area(()=>local),session:area(()=>session)},tabs:{async create(options){const tab={id:tabs.length+1,...options};tabs.push(tab);return tab;},async update(id,options){if(failNavigate)throw Error('denied');Object.assign(tabs.find(t=>t.id===id),options);},async remove(id){tabs=tabs.filter(t=>t.id!==id);}}};
const store=await import('../account-id-tool/workspace-store.js');
function legacy(){let state=emptyState();const run=action=>{const r=reduceWorkspace(state,action);state=r.state;return r.result;};const {scanId}=run({type:'project.create',name:'Northbridge',scanName:'October review'});const {id}=run({type:'search.prepare',scanId,provider:'google',query:'Fictional private alias'});run({type:'item.save',scanId,kind:'note',title:'Deliberately saved finding',body:'Retain this evidence',originatingSearchId:id});return state;}
test('update removes previous query text, search activity and nested drafts while retaining evidence relationships',async()=>{
 const old=legacy();local={[WORKSPACE_KEY]:old,'gather.search-draft.inbox':{query:'Unsubmitted fictional secret'},'gather.archive.old':{'gather.search-draft.old':{query:'Archived fictional secret'},'gather.prefs':{autoCopy:true}}};session={'gather.search-draft.session':{query:'Session fictional secret'}};
 const state=await store.readWorkspace();validateWorkspace(state);assert.deepEqual(state.items,old.items);assert.equal(state.searches[0].id,state.items[0].originatingSearchId);assert.equal(state.searches[0].queryRetained,false);
 assert.doesNotMatch(JSON.stringify(local)+JSON.stringify(session),/Fictional private alias|fictional secret|gather.search-draft/);assert.deepEqual(local['gather.archive.old'],{'gather.prefs':{autoCopy:true}});
 assert.equal(forgetSearchText(state),state,'Privacy cleanup is idempotent');assert.deepEqual(report(state,state.activeScanId).searches,[]);
});
test('typed searches and stale draft messages do not reach local/session storage or backup',async()=>{
 const state=await store.readWorkspace(),before=structuredClone(local);await store.openSearch({scanId:state.activeScanId,provider:'instagram',query:'"Fictional transient alias"'});await store.saveSearchDraft(null,{query:'Never store this',provider:'google'});
 assert.deepEqual(local,before);assert.match(tabs.at(-1).url,/site%3Ainstagram.com/);assert.match(decodeURIComponent(tabs.at(-1).url),/Fictional transient alias/);
 assert.doesNotMatch(JSON.stringify(await store.backup())+JSON.stringify(session),/Fictional transient alias|Never store this/);
 const context=session['gather.tabContexts.v1'][tabs.at(-1).id];assert.equal(context.scanId,state.activeScanId);assert.equal(context.originatingSearchId,null);
 await assert.rejects(store.dispatch({type:'search.prepare',scanId:state.activeScanId,provider:'google',query:'stale'}),/without a saved log/);
});
test('all requested reverse-image providers launch fixed HTTPS destinations without query or image data',async()=>{
 const state=await store.readWorkspace(),before=structuredClone(local);assert.equal(Object.keys(IMAGE_PROVIDERS).length,8);
 for(const provider of Object.keys(IMAGE_PROVIDERS)){await store.openImageSearch({scanId:state.activeScanId,provider});const url=new URL(tabs.at(-1).url);assert.equal(url.href,imageSearchUrl(provider));assert.equal(url.protocol,'https:');assert.equal(url.search,'');}
 assert.deepEqual(local,before);assert.throws(()=>imageSearchUrl('__proto__'),/provider/);assert.throws(()=>imageSearchUrl('https://example.test'),/provider/);
});
test('failed navigation cleans the temporary tab and context, without keeping a failed query',async()=>{
 const count=tabs.length,contexts=structuredClone(session);failNavigate=true;
 await assert.rejects(store.openSearch({scanId:null,provider:'google',query:'failed fictional query'}),/could not open/);failNavigate=false;
 assert.equal(tabs.length,count);assert.deepEqual(session,contexts);assert.doesNotMatch(JSON.stringify(local),/failed fictional query/);
});
test('restoring an older backup cannot restore search text or archived drafts',async()=>{
 const state=legacy();await store.importBackup({format:'gather-backup',schemaVersion:1,createdAt:1,workspace:state,legacy:{'gather.search-draft.old':{query:'Restored secret'},'gather.archive.restore':{'gather.search-draft.nested':{query:'Restored secret'}}}});
 const saved=await store.backup();validateWorkspace(saved.workspace);assert.doesNotMatch(JSON.stringify(saved),/Fictional private alias|Restored secret|gather.search-draft/);assert.equal(saved.workspace.items.length,2);
});
