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
 reset();const result=await resolveProfile(profile,{currentTabId:10});assert.equal(result.id,'9007199254740993123');assert.match(result.method,/Current profile source/);assert.equal(reads.filter(r=>r.files).length,2);assert.equal(reads.filter(r=>r.args?.[1]).length,1);assert.deepEqual(reads.at(-1).target,{tabId:10,documentIds:['document-one']});
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

let publicReads=[],afterPublic;
globalThis.fetch=async(url,options)=>{
 publicReads.push({url,options});const response=new Response(publicHTML);Object.defineProperty(response,'url',{value:publicURL||url});afterPublic?.();return response;
};
let publicHTML=html,publicURL;
function missingSignedIn(){reset();source.html='<p>Fictional loaded profile</p>';fetched.html=source.html;publicReads=[];publicHTML=html;publicURL=null;afterPublic=null;}
test('first current-page operation checks the public profile once when signed-in markup omits the ID',async()=>{
 missingSignedIn();const result=await resolveProfile(profile,{currentTabId:10});assert.equal(result.id,'9007199254740993123');assert.match(result.method,/Public profile source/);assert.equal(publicReads.length,1);assert.equal(publicReads[0].url,profile.url);assert.equal(publicReads[0].options.credentials,'omit');assert.equal(publicReads[0].options.cache,'no-store');assert.equal(reads.filter(r=>r.files).length,3);assert.deepEqual(reads.at(-1).target,{tabId:10,documentIds:['document-one']});assert.ok(!('displayName'in result));
});
test('profile hydration completing during the public request returns the now-loaded current page',async()=>{
 missingSignedIn();afterPublic=()=>source.html=html;const result=await resolveProfile(profile,{currentTabId:10});assert.equal(result.id,'9007199254740993123');assert.match(result.method,/Current page/);assert.equal(publicReads.length,1);
});
test('public fallback never overrides a newly conflicting ID, authentication screen, or navigation',async()=>{
 for(const body of [html.replace('9007199254740993123','123'),'<p>Log in to Instagram</p>','<p>Verify you are human</p>']){missingSignedIn();afterPublic=()=>source.html=body;const result=await resolveProfile(profile,{currentTabId:10});assert.ok(result.error);assert.ok(!result.id);assert.equal(publicReads.length,1);}
 missingSignedIn();afterPublic=()=>tabUrl='https://www.instagram.com/other.example/';assert.match((await resolveProfile(profile,{currentTabId:10})).error,/changed/);
});
test('public fallback rejects wrong profiles and unbound IDs without looping',async()=>{
 for(const body of [html.replace('alex.example','other.example'),'<script>{"recommendations":[{"profile_id":"123"}]}</script>']){missingSignedIn();publicHTML=body;const result=await resolveProfile(profile,{currentTabId:10});assert.ok(result.error);assert.ok(!result.id);assert.equal(publicReads.length,1);}
 missingSignedIn();publicURL='https://www.instagram.com/other.example/';assert.ok((await resolveProfile(profile,{currentTabId:10})).error);
});
test('explicit sign-in, conflicting IDs and successful initial reads never request public fallback',async()=>{
 for(const body of [html,'<p>Log in to Instagram</p>','<script>[{"username":"alex.example","id":"123"},{"username":"alex.example","id":"456"}]</script>']){missingSignedIn();source.html=body;await resolveProfile(profile,{currentTabId:10});assert.equal(publicReads.length,0);}
});
test('cancelling during the public request prevents a result from being returned',async()=>{
 missingSignedIn();const controller=new AbortController();afterPublic=()=>controller.abort();await assert.rejects(resolveProfile(profile,{currentTabId:10,signal:controller.signal}),{name:'AbortError'});assert.equal(publicReads.length,1);
});

test('an ambiguous public response stays unresolved even if late hydration exposes one of its IDs',async()=>{
 missingSignedIn();publicHTML='<script>[{"username":"alex.example","id":"123"},{"username":"alex.example","id":"456"}]</script>';afterPublic=()=>source.html=html.replace('9007199254740993123','123');const result=await resolveProfile(profile,{currentTabId:10});assert.match(result.error,/Multiple account IDs/);assert.ok(!result.id);
});
