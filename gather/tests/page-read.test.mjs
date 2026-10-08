import test from 'node:test';
import assert from 'node:assert/strict';
import {extractId,normalizeProfile,pageAccessIssue} from '../account-id-tool/core.js';
const profile=normalizeProfile('instagram.com/alex.example');
test('challenge libraries, comments and unused login links do not imply an authentication failure',()=>{
  const result=extractId('<script>const captcha="checkpoint";const login_required=false;</script><!-- challenge_required --><a href="/accounts/login/">Log in</a><p>Profile is loading</p>',profile);
  assert.match(result.error,/No matching account ID/);assert.doesNotMatch(result.error,/sign in|security check/i);assert.ok(!result.accountState);
});
test('observed sign-in text, structured errors and known redirect screens have specific recovery advice',()=>{
  assert.match(extractId('<p>Log in to Instagram</p>',profile).error,/page asks you to sign in/);
  assert.match(extractId('<script type="application/json">{"message":"challenge_required"}</script>',profile).error,/reports a security check/);
  assert.match(extractId('',profile,'https://www.instagram.com/accounts/login/').error,/opened a sign-in screen/);
  assert.match(pageAccessIssue('','https://www.instagram.com/challenge/'),/opened a security check/);
  assert.doesNotMatch(extractId('',profile,'https://www.instagram.com/').error,/sign in|security check/);
});
let source={url:profile.url,html:''},fetched={url:profile.url,html:''},reads=[],denied=false,tabUrl=profile.url,afterSource;
globalThis.chrome={runtime:{id:'fictional'},tabs:{async get(){return {url:tabUrl};}},scripting:{async executeScript(options){reads.push(options);if(denied)throw new Error('denied');if(options.files)return [{documentId:'document-one'}];const isSource=options.args[1];if(isSource)afterSource?.();const data=isSource?fetched:source;return [{documentId:'document-one',result:data.error?data:extractId(data.html,profile,data.url)}];}}};
globalThis.fetch=async()=>{throw new Error('No live network in fixture');};
const {resolveProfile}=await import('../account-id-tool/resolver.js');
const html='<script type="application/json">{"username":"alex.example","profile_id":"9007199254740993123"}</script>';
function reset(){reads=[];denied=false;tabUrl=profile.url;source={url:profile.url,html:''};fetched={url:profile.url,html};afterSource=null;}
test('missing hydrated ID automatically reads source in the same document and preserves exact ID',async()=>{
 reset();const result=await resolveProfile(profile,{currentTabId:10});assert.equal(result.id,'9007199254740993123');assert.match(result.method,/Current profile source/);assert.equal(reads.length,4);assert.deepEqual(reads[3].target,{tabId:10,documentIds:['document-one']});
});
test('hydrated success is fast: no second source request',async()=>{
 reset();source.html=html;assert.equal((await resolveProfile(profile,{currentTabId:10})).id,'9007199254740993123');assert.equal(reads.length,2);
});
test('sign-in, security check and ambiguous IDs do not trigger repeated source requests',async()=>{
 for(const body of ['<p>Log in to Instagram</p>','<p>Verify you are human</p>','<script>[{"username":"alex.example","id":"123"},{"username":"alex.example","id":"456"}]</script>']){reset();source.html=body;assert.ok((await resolveProfile(profile,{currentTabId:10})).error);assert.equal(reads.length,2);}
});
test('navigation, wrong-source profile, denied source and cancellation never return a guessed ID',async()=>{
 reset();afterSource=()=>tabUrl='https://www.instagram.com/southridge/';assert.match((await resolveProfile(profile,{currentTabId:10})).error,/changed/);
 reset();fetched.url='https://www.instagram.com/southridge/';assert.match((await resolveProfile(profile,{currentTabId:10})).error,/different profile/);
 reset();denied=true;assert.match((await resolveProfile(profile,{currentTabId:10})).error,/toolbar button/);assert.equal(reads.length,1);
 reset();const controller=new AbortController();afterSource=()=>controller.abort();await assert.rejects(resolveProfile(profile,{currentTabId:10,signal:controller.signal}),{name:'AbortError'});
 reset();fetched={error:'Source timed out'};assert.match((await resolveProfile(profile,{currentTabId:10})).error,/timed out/);
});
