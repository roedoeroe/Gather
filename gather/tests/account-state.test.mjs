import test from 'node:test';import assert from 'node:assert/strict';
import {extractId,normalizeProfile,applyLookup,formatIds,formatDetails,parseInput} from '../account-id-tool/core.js';
import {accountState,orderAccounts,accountSummary} from '../account-id-tool/account-state.js';
import {restoreBatch} from '../account-id-tool/batches.js';
import {emptyState,reduceWorkspace,validateWorkspace,itemChecks} from '../account-id-tool/workspace-model.js';
const goneHTML='<script>var ytInitialData = {"alerts":[{"alertRenderer":{"type":"ERROR","text":{"simpleText":"This channel does not exist."}}}]};</script>';
function gone(handle='fictional-gone'){const p=normalizeProfile('https://www.youtube.com/@'+handle),e={...p,notes:[],providedIds:[]};applyLookup(e,extractId(goneHTML,p));return e;}
test('adapter positively confirms exact channel absence, while missing markup, login and redirect remain unknown',()=>{
 assert.equal(accountState(gone()),'GONE');
 for(const html of ['<html>No ID</html>','This channel does not exist.','<p>login_required</p>'+goneHTML]){const p=normalizeProfile('youtube.com/@fictional-gone'),e={...p};applyLookup(e,extractId(html,p));assert.equal(accountState(e),'UNKNOWN_TECHNICAL');}
 const p=normalizeProfile('youtube.com/@fictional-gone');assert.ok(extractId(goneHTML,p,'https://youtube.com/@other').error);
 assert.ok(extractId(goneHTML,normalizeProfile('instagram.com/example')).error);
});
test('five usable, one technical, two gone: ready first, quiet gone last, IDs-only has five exact strings',()=>{
 const ready=Array.from({length:5},(_,i)=>({...normalizeProfile('instagram.com/example'+i),id:'900719925474099312'+i,status:'resolved',verifiedAt:123,verificationSource:'live'}));const unknown={...normalizeProfile('instagram.com/markup'),status:'error'};
 const rows=[gone(),unknown,...ready,gone('another-gone')],ordered=orderAccounts(rows);assert.deepEqual(ordered.slice(0,5),ready);assert.equal(ordered[5],unknown);assert.ok(ordered.slice(6).every(e=>accountState(e)==='GONE'));assert.equal(formatIds(rows,null),ready.map(e=>e.id).join('\n'));assert.match(accountSummary(rows),/2 gone.*1 could not/);const details=formatDetails(rows);assert.match(details,/Accounts no longer available/);assert.doesNotMatch(details.split('Accounts no longer available')[1],/User ID|Needs attention/);
});
test('gone batches survive reload and omit direct URL IDs from current ID output',()=>{const p=normalizeProfile('youtube.com/channel/UCabcdefghijklmnopqrstuv'),e={...p,id:p.directId};applyLookup(e,extractId(goneHTML,p));const b=restoreBatch({id:'fictional',entries:[e]});assert.equal(b.entries[0].status,'gone');assert.equal(b.entries[0].id,'');assert.equal(formatIds(b.entries), '');assert.equal(b.entries[0].priorPermanentId,p.directId);});
test('permanent account record survives handle change and confirmed gone without creating a person association',()=>{
 let state=reduceWorkspace(emptyState(),{type:'project.create',name:'Fictional',scanName:'Review'}).state;const scanId=state.activeScanId,id='UCabcdefghijklmnopqrstuv';
 for(const handle of ['before','after']){const e={...normalizeProfile('youtube.com/@'+handle),id,status:'resolved',verifiedAt:Date.now(),verificationSource:'live',adapterVersion:'1.8.0'};state=reduceWorkspace(state,{type:'item.save',kind:'account',scanId,entry:e}).state;}
 state=reduceWorkspace(state,{type:'item.save',kind:'account',scanId,entry:gone('after')}).state;assert.equal(state.entities.length,1);assert.equal(state.entities[0].accountId,id);assert.deepEqual(state.entities[0].observedAliases,['before','after']);assert.equal(state.entities[0].lifecycleState,'GONE');assert.equal(state.items.at(-1).entityId,state.entities[0].id);assert.equal(state.items.at(-1).entry.priorPermanentId,id);assert.ok(!itemChecks(state,state.items.at(-1)).some(c=>c.code==='unresolved'));validateWorkspace(state);assert.equal(state.research,undefined);
});
test('golden path remains project-free with mixed URL input and exact large IDs',()=>{const p=parseInput('instagram.com/alex\nhttps://facebook.com/profile.php?id=9007199254740993123\nyoutube.com/@alex');assert.equal(p.entries.length,3);assert.equal(p.entries.find(e=>e.platform==='facebook').directId,'9007199254740993123');});
