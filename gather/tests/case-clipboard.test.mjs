import test from 'node:test';
import assert from 'node:assert/strict';
import {clipboardSnapshot} from '../account-id-tool/case-clipboard.js';
import {parseIntake,prepareCase} from '../account-id-tool/case-model.js';
import {emptyState,reduceWorkspace} from '../account-id-tool/workspace-model.js';
import {normalizeProfile} from '../account-id-tool/core.js';

const at=1780000000000;
function fixture(){
  const first=prepareCase(emptyState(),{mode:'local',name:'Northbridge',scanName:'October review',fields:parseIntake('SOC: Alex Example')},at);
  let state=first.state;
  const run=action=>{const r=reduceWorkspace(state,action,at);state=r.state;return r.result;};
  const save=(scanId,id='9007199254740993123')=>run({type:'item.save',kind:'account',scanId,entry:{...normalizeProfile('instagram.com/fictional_account'),status:'resolved',id,verifiedAt:at,verificationSource:'live',notes:[],providedIds:[]}}).id;
  return {first,run,save,get state(){return state;},scope:{kind:'accounts',projectId:first.result.id,scanId:first.result.scanId,subjectId:first.subjects[0].id}};
}

test('role clipboard keeps separate dated observations across scans; renames retain their stable relationships',()=>{
  const f=fixture(),oldItem=f.save(f.scope.scanId);
  f.run({type:'research.associate',itemId:oldItem,subjectId:f.scope.subjectId,status:'candidate'});
  const next=f.run({type:'scan.create',projectId:f.scope.projectId,name:'November review'}),newItem=f.save(next.id);
  f.run({type:'research.associate',itemId:newItem,subjectId:f.scope.subjectId,status:'confirmed'});
  const before=clipboardSnapshot(f.state,f.first.subjects,f.scope);
  assert.equal(before.text.match(/9007199254740993123/g).length,2);
  assert.match(before.text,/Candidate.*Scan: October review/);
  assert.match(before.text,/Confirmed.*Scan: November review/);
  const renamed=structuredClone(f.state);renamed.scans.find(s=>s.id===next.id).name='Follow-up';
  const after=clipboardSnapshot(renamed,f.first.subjects,f.scope);
  assert.match(after.text,/Confirmed.*Scan: Follow-up/);
  assert.equal(after.text.match(/9007199254740993123/g).length,2);
  assert.notEqual(after.signature,before.signature);
});

test('role clipboard isolates cases by IDs and ignores an unrelated global destination change',()=>{
  const f=fixture(),item=f.save(f.scope.scanId);
  f.run({type:'research.associate',itemId:item,subjectId:f.scope.subjectId,status:'confirmed'});
  const before=clipboardSnapshot(f.state,f.first.subjects,f.scope);
  const other=f.run({type:'project.create',name:'Northbridge',scanName:'October review'});
  f.save(other.scanId,'9007199254740993999');
  const after=clipboardSnapshot(f.state,f.first.subjects,f.scope);
  assert.equal(after.signature,before.signature);
  assert.doesNotMatch(after.text,/9007199254740993999/);
  assert.throws(()=>clipboardSnapshot(f.state,f.first.subjects,{...f.scope,projectId:other.id}),/removed/);
  assert.throws(()=>clipboardSnapshot(f.state,[],f.scope),/Choose a role/);
  f.run({type:'research.associate',itemId:item,subjectId:f.scope.subjectId,status:'rejected'});
  const rejected=clipboardSnapshot(f.state,f.first.subjects,f.scope);
  assert.doesNotMatch(rejected.text,/9007199254740993123/);
  assert.notEqual(rejected.signature,before.signature);
});
