import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
import {validateMessage,restrictStorageAccess} from '../account-id-tool/message-boundary.js';
import {validatePreferences} from '../account-id-tool/preferences.js';
import {validateProfileResult} from '../account-id-tool/profile-read-client.js';
import {extractId,normalizeProfile} from '../account-id-tool/core.js';
const bundle=fs.readFileSync(new URL('../account-id-tool/profile-reader.js',import.meta.url),'utf8');
const exact='9007199254740993123';
function reader(url,html){const context=vm.createContext({location:{href:url},document:{documentElement:{outerHTML:html}},URL,AbortController,TextDecoder,setTimeout,clearTimeout});vm.runInContext(bundle,context);return context;}
test('generated isolated reader matches the tested parser and returns no source for every platform',async()=>{
  for(const [url,data]of[
    ['https://www.instagram.com/alex.example/',{username:'alex.example',profile_id:exact,full_name:'Alex Example'}],
    ['https://www.facebook.com/alex.example',{userVanity:'alex.example',userID:exact,name:'Alex Example'}],
    ['https://www.threads.com/@alex.example',{username:'alex.example',id:exact}],
    ['https://www.tiktok.com/@alex.example',{uniqueId:'alex.example',id:exact}],
    ['https://www.youtube.com/@alex.example',{channelMetadataRenderer:{externalId:'UCabcdefghijklmnopqrstuv',ownerUrls:['https://www.youtube.com/@alex.example']}}]
  ]){
    const html='<script>'+JSON.stringify({...data,privateUnrelated:'UNRELATED_SENTINEL',cookie:'FICTIONAL_SESSION'})+'</script>',page=reader(url,html),expected=extractId(html,normalizeProfile(url)),actual=await page.__gatherProfileReader(url,false,true);
    assert.equal(actual.id,expected.id);assert.equal(actual.method,expected.method);assert.equal(actual.displayName,expected.displayName);assert.ok(!JSON.stringify(actual).includes('SENTINEL'));assert.ok(!JSON.stringify(actual).includes('SESSION'));assert.ok(!('html'in actual));validateProfileResult(actual);
    assert.ok(!('displayName'in await page.__gatherProfileReader(url,false,false)));
  }
});
test('page reader rejects wrong profile, conflicts, generic IDs, sign-in and challenge; never executes site script',async()=>{
 const url='https://www.instagram.com/alex.example/';
 for(const html of ['<script>{"username":"other.example","id":"123"}</script>','<script>[{"username":"alex.example","id":"123"},{"username":"alex.example","id":"456"}]</script>','<script>{"profile_id":"123"}</script>','<p>Log in to Instagram</p>','<p>Verify you are human</p>','<script>globalThis.compromised=true;</script>']){
  const page=reader(url,html),result=await page.__gatherProfileReader(url,false,true);assert.ok(result.error);assert.ok(!result.id);assert.equal(page.compromised,undefined);
 }
});
test('automatic source read stays in page memory with minimal result, credential scope and navigation guard',async()=>{
 const url='https://www.instagram.com/alex.example/',page=reader(url,'');let options;
 page.fetch=async(link,opts)=>{options=opts;const response=new Response('<script>{"username":"alex.example","id":"'+exact+'","extra":"PRIVATE_SENTINEL"}</script>');Object.defineProperty(response,'url',{value:link});return response;};
 const result=await page.__gatherProfileReader(url,true,false);assert.equal(result.id,exact);assert.equal(options.credentials,'same-origin');assert.ok(!JSON.stringify(result).includes('SENTINEL'));
 page.fetch=async()=>{page.location.href='https://www.instagram.com/other.example/';return new Response('text');};assert.match((await page.__gatherProfileReader(url,true,false)).error,/changed/);
});
test('reader boundary rejects unrequested raw data, oversized results, malformed IDs and status values',()=>{
 for(const value of [null,{id:123},{id:'123',html:'raw'},{id:'123',profileStatus:{privacy:'private'}},{error:'x'.repeat(9000)},{id:'123',error:'both'},JSON.parse('{"id":"123","__proto__":{}}')])assert.throws(()=>validateProfileResult(value));
 assert.equal(validateProfileResult({id:exact,method:'Profile data'}).id,exact);
});
test('storage access is applied to local and session and failures stop privileged operations',async()=>{
 const calls=[],storage=Object.fromEntries(['local','session'].map(area=>[area,{setAccessLevel:async args=>calls.push([area,args.accessLevel])}]));await restrictStorageAccess(storage);assert.deepEqual(calls,[['local','TRUSTED_CONTEXTS'],['session','TRUSTED_CONTEXTS']]);
 storage.session.setAccessLevel=async()=>{throw new Error('denied details');};await assert.rejects(restrictStorageAccess(storage),/could not protect local storage/);await assert.rejects(restrictStorageAccess({}),/could not protect local storage/);
});
test('trusted messages still reject malformed, oversized, recursive and prototype fields',()=>{
 const cyclic={type:'workspace.action'};cyclic.self=cyclic;let deep={};const body=deep;for(let i=0;i<70;i++)deep.next=deep={};
 for(const message of [null,[],{type:2},{type:'x',body:'x'.repeat(16000001)},cyclic,{type:'x',body},JSON.parse('{"type":"workspace.action","action":{"__proto__":{"polluted":true}}}')])assert.throws(()=>validateMessage(message));
 assert.equal(validateMessage({type:'workspace.action',action:{type:'item.save',title:'<script>fictional</script>'}}).action.title,'<script>fictional</script>');
 assert.equal({}.polluted,undefined);
});
test('preferences allow only known settings and types; no arbitrary storage payload',()=>{
 assert.doesNotThrow(()=>validatePreferences({autoCopy:true,copyMode:'ids',includeNames:false,browserFallback:false,separator:'comma'}));
 for(const p of [{rawIntake:'private'},{autoCopy:'true'},{copyMode:'unknown'},[],JSON.parse('{"__proto__":{}}')])assert.throws(()=>validatePreferences(p));
});
test('generated parser cannot drift from module sources',()=>{
 const r=spawnSync('python3',[new URL('../scripts/build-profile-reader.py',import.meta.url).pathname,'--check'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr+r.stdout);
});
test('public pasted-profile request omits credentials and does not launch a tab when it resolves',async()=>{
 globalThis.chrome={runtime:{id:'test'},scripting:{},tabs:{create:async()=>assert.fail('No fallback tab needed')}};let seen;
 globalThis.fetch=async(url,options)=>{seen=options;const response=new Response('<script>{"username":"alex.example","id":"'+exact+'"}</script>');Object.defineProperty(response,'url',{value:url});return response;};
 const {resolveProfile}=await import('../account-id-tool/resolver.js');assert.equal((await resolveProfile(normalizeProfile('instagram.com/alex.example'),{browserFallback:false})).id,exact);assert.equal(seen.credentials,'omit');assert.equal(seen.cache,'no-store');
});
test('release privacy gate rejects seeded credentials, private files, archive traversal and nested private packs',()=>{
 const script=`import sys, io, zipfile\nsys.path.insert(0, ${JSON.stringify(new URL('../scripts',import.meta.url).pathname)})\nfrom privacy_gate import inspect_bytes\ninspect_bytes('tests/fixture.json', b'{"name":"Alex Example","url":"https://example.test"}')\nblocked=0\nfor name,data in [('token.txt', ('ghp_'+'A'*36).encode()), ('local-packs/reference.json', b'{}'), ('case.gather', b'fake'), ('../outside.txt',b'fake'), ('.env.local',b'fake')]:\n try: inspect_bytes(name,data)\n except ValueError: blocked+=1\nassert blocked==5\nbuffer=io.BytesIO()\nwith zipfile.ZipFile(buffer,'w') as z: z.writestr('organization-packs/reference.json','{}')\ntry: inspect_bytes('package.zip',buffer.getvalue())\nexcept ValueError: pass\nelse: raise AssertionError('Nested private pack allowed')\n`;
 const r=spawnSync('python3',['-c',script],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
test('anonymous denial preserves the explicitly enabled browser fallback and closes only its temporary tab',async()=>{
 const url='https://www.instagram.com/alex.example/',closed=[];let opened;
 globalThis.fetch=async()=>new Response('',{status:403});
 globalThis.chrome={runtime:{id:'test',sendMessage:async()=>({ok:true})},tabs:{create:async options=>{opened=options;return {id:42};},get:async()=>({url,status:'complete'}),remove:async id=>closed.push(id)},scripting:{executeScript:async options=>options.files?[{documentId:'fixture'}]:[{documentId:'fixture',result:{id:exact,method:'Profile data',verifiedAt:Date.now()}}]}};
 const {resolveProfile}=await import('../account-id-tool/resolver.js');assert.equal((await resolveProfile(normalizeProfile(url),{browserFallback:true})).id,exact);assert.deepEqual(opened,{url,active:false});assert.deepEqual(closed,[42]);
});
