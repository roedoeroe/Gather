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
let source={url:profile.url,html:''},reads=0,fetches=0,denied=false;
globalThis.chrome={runtime:{id:'fictional'},tabs:{async get(){return {url:profile.url};}},scripting:{async executeScript(){reads++;if(denied)throw new Error('denied');return [{result:source}];}}};
globalThis.fetch=async()=>{fetches++;throw new Error('No live network in fixture');};
const {resolveProfile}=await import('../account-id-tool/resolver.js');
test('explicit current-page lookup reports the observed result without silently fetching or opening a different page',async()=>{
  const missing=await resolveProfile(profile,{currentTabId:10});assert.match(missing.error,/No matching account ID/);assert.equal(fetches,0);
  denied=true;const inaccessible=await resolveProfile(profile,{currentTabId:10});assert.match(inaccessible.error,/toolbar button/);assert.equal(fetches,0);
  denied=false;source.html='<script type="application/json">{"username":"alex.example","id":"9007199254740993123"}</script>';
  const retry=await resolveProfile(profile,{currentTabId:10});assert.equal(retry.id,'9007199254740993123');assert.equal(reads,3);assert.equal(fetches,0);
});
