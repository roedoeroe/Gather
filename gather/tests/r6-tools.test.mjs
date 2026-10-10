import test from 'node:test';import assert from 'node:assert/strict';
import {retrieveSourceImage,sourceImageURL,sourceImageType} from '../account-id-tool/source-image.js';
import {searchCompletions} from '../account-id-tool/search-completion.js';
import {buildReferencePack,readReferencePack,searchReferences} from '../account-id-tool/reference-model.js';
const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0]);
test('Source acquisition preserves bytes and dimensions, omits credentials and never follows redirects',async()=>{
 const calls=[];const r=await retrieveSourceImage('https://images.example.test/one.png?signature=fictional',{fetchImage:async(url,options)=>{calls.push({url,options});return new Response(png,{headers:{'Content-Type':'image/png'}});},decode:async()=>({width:120,height:80,close(){}})});
 assert.deepEqual(new Uint8Array(await r.blob.arrayBuffer()),png);assert.deepEqual(r.dimensions,{width:120,height:80});assert.equal(r.mime,'image/png');assert.equal(calls.length,1);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].options.referrerPolicy,'no-referrer');
});
test('Source images reject expired/denied/oversized/invalid bodies and decode failures without success',async()=>{
 for(const status of [401,403,404,410,500])await assert.rejects(retrieveSourceImage('https://images.example.test/a.png',{fetchImage:async()=>new Response('',{status}),decode:async()=>{throw Error('unexpected');}}));
 for(const [body,headers] of [['<html>sign in</html>',{}],[png,{'content-length':String(70*1024*1024)}],[png,{'content-type':'image/webp'}]])await assert.rejects(retrieveSourceImage('https://images.example.test/a.png',{fetchImage:async()=>new Response(body,{headers}),decode:async()=>({width:1,height:1,close(){}})}));
 await assert.rejects(retrieveSourceImage('https://images.example.test/a.png',{fetchImage:async()=>new Response(png),decode:async()=>({width:10000,height:10000,close(){}})}),/pixel limit/);
 for(const url of ['blob:https://example.test/a','javascript:alert(1)','https://user:pass@example.test/a'])assert.throws(()=>sourceImageURL(url));
 assert.equal(sourceImageType(new Uint8Array([255,216,255])),'image/jpeg');assert.equal(sourceImageType(new TextEncoder().encode('RIFF0000WEBP')),'image/webp');assert.equal(sourceImageType(new TextEncoder().encode('GIF89a')),'image/gif');assert.equal(sourceImageType(new TextEncoder().encode('0000ftypavif')),'image/avif');
});
test('Autocomplete respects token boundaries, quotes, provider capabilities and exact accepted tokens',()=>{
 assert.equal(searchCompletions('si',2)[0].text,'site:');assert.equal(searchCompletions('site:inst',9)[0].text,'instagram.com');assert.equal(searchCompletions('file',4)[0].text,'filetype:');assert.equal(searchCompletions('int',3)[0].text,'intitle:');
 for(const [text,position,provider] of [['inside',6,'google'],['"si',3,'google'],['si example',2,'google'],['site:',5,'google'],['si',2,'youtube'],['si',2,'x'],['inu',3,'bing']])assert.deepEqual(searchCompletions(text,position,provider),[]);
 assert.equal(searchCompletions('"fictional name" si',19)[0].text,'site:');
});
const files=[{path:'Client Communications/Follow-up/No Findings.md',text:'# No Findings\nCreated: fictional\n\n## Requesting peers\nPlease provide peer names or usernames.\n'},{path:'Client Communications/Platforms/Snapchat.md',text:'# Snapchat Username\n\n## TEMPLATE\nPlease provide [USERNAME].\n'},{path:'Client Communications/Follow-up/Examples.md',text:'# Replies\n\n## EXAMPLES NOT TEMPLATES\nFictional example wording.\n'},{path:'Client Communications/Login-Info/private.md',text:'password: fictional-secret'},{path:'Client Communications/ARCHIVED-DONT-USE/old.md',text:'no accounts'},{path:'Client Communications/Hidden.md',text:'# Credentials\npassword: fictional-secret'}];
test('Reference import preserves exact wording, paths and example status while excluding hazards',()=>{
 const pack=buildReferencePack({collection:'Client Communication',version:'1',files});assert.equal(pack.files.length,3);assert.equal(pack.excluded.length,3);assert.ok(!JSON.stringify(pack.files).includes('fictional-secret'));
 const hits=searchReferences([pack],'no accounts');assert.equal(hits[0].title,'No Findings');assert.equal(searchReferences([pack],'snap username')[0].title,'Snapchat Username');
 const example=pack.entries.find(x=>x.body.includes('Fictional example wording'));assert.equal(example.type,'example');
 for(const entry of pack.entries){const original=pack.files.find(f=>f.path===entry.path);assert.equal(entry.body,original.text.slice(entry.start,entry.end));}
 const restored=readReferencePack(JSON.stringify(pack));assert.deepEqual(restored.files,pack.files);assert.deepEqual(searchReferences([pack],'fictional-secret'),[]);
});
test('Reference import rejects malformed paths, versions, duplicates and empty or malicious packs',()=>{
 for(const path of ['../escape.md','one/../escape.md','/absolute.md','a\\b.md'])assert.throws(()=>buildReferencePack({collection:'Example',version:'1',files:[{path,text:'# Example'}]}));
 assert.throws(()=>readReferencePack('{"format":"wrong"}'));
 assert.throws(()=>buildReferencePack({collection:'Example',version:'1',files:[files[0],files[0]]}));
 const text='# Safe\n\n<script>fetch("https://example.test/")</script>\n![](https://example.test/track.png)';
 const pack=buildReferencePack({collection:'Example',version:'1',files:[{path:'Safe.md',text}]});assert.equal(pack.files[0].text,text);
});

test('Reference fuzzy matches stay below exact matches and possible templates remain distinct',()=>{
 const pack=buildReferencePack({collection:'Fictional',version:'1',files:[{path:'Peers.md',text:'# Peers\nRequest peer names.\n'},{path:'Possible.md',text:'# Draft\n\n## POSS TEMPLATE\nReview wording.\n'}]});
 assert.equal(searchReferences([pack],'peerrs')[0].title,'Peers');assert.equal(pack.entries.find(e=>e.section==='POSS TEMPLATE').type,'possible-template');
});
