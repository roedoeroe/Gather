import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLookup,normalizeProfile,extractLookup,parseInput,applyLookup,formatDetails} from '../account-id-tool/core.js';
import {restoreBatch} from '../account-id-tool/batches.js';
const id='9007199254740993123';
const html=value=>'<script type="application/json">'+JSON.stringify(value)+'</script>';
const video='https://www.tiktok.com/@alex.example/video/123456789?_r=1&_t=example';
const owner={uniqueId:'alex.example',id,nickname:'Alex Example'};
test('TikTok content resolves only its bound author, preserves exact ID and emits clean four-field output',()=>{
 const entry=parseInput(video).entries[0];assert.ok(entry.content);
 const result=extractLookup(html({itemInfo:{itemStruct:{id:'123456789',author:owner}},comments:[{id:'444',uniqueId:'someone.else'}]}),entry,video);
 assert.equal(result.id,id);applyLookup(entry,result);
 assert.equal(entry.url,'https://www.tiktok.com/@alex.example');assert.equal(entry.sourcePageUrl,video);
 assert.equal(formatDetails([entry]),'Display name:  Alex Example\nUsername: @alex.example\nURL: https://www.tiktok.com/@alex.example\nUser ID: '+id);
 const restored=restoreBatch({id:'batch',entries:[entry]});assert.equal(restored.entries[0].id,id);assert.equal(restored.entries[0].url,entry.url);assert.equal(restored.entries[0].sourcePageUrl,video);
 assert.equal(normalizeProfile(normalizeProfile(entry.url).url).url,entry.url);
});
test('Content lookup rejects commenter-only, unrelated item, owner mismatch, conflicting ID and navigation',()=>{
 const input=normalizeLookup(video);
 for(const value of [{comments:[owner]},{id:'different',author:owner},{id:'123456789',author:{...owner,uniqueId:'viewer'}},[{id:'123456789',author:owner},{id:'123456789',author:{...owner,id:'555'}}]])assert.ok(extractLookup(html(value),input,video).error);
 assert.ok(extractLookup(html({id:'123456789',author:owner}),input,video.replace('123456789','987654321')).error);
 assert.ok(extractLookup('Log in to Instagram'+html({id:'123456789',author:owner}),input,video).error);
});
test('Instagram and Threads owners require matching post codes and reject multiple owners',()=>{
 for(const [url,record] of [['https://www.instagram.com/reel/AB_example/?utm_source=test',{shortcode:'AB_example',owner:{username:'alex.example',id,full_name:'Alex Example'}}],['https://www.threads.com/@alex.example/post/AB_example',{code:'AB_example',user:{username:'alex.example',id}}]]){
  const p=normalizeLookup(url),r=extractLookup(html(record),p,url);assert.equal(r.id,id);assert.ok(!r.canonicalProfileUrl.includes('?'));
  assert.ok(extractLookup(html({...record,shortcode:'wrong',code:'wrong'}),p,url).error);
 }
 const url='https://www.instagram.com/p/AB_example/';assert.ok(extractLookup(html([{shortcode:'AB_example',owner:{username:'a',id}},{shortcode:'AB_example',owner:{username:'b',id:'555'}}]),normalizeLookup(url),url).error);
});
test('YouTube only accepts videoDetails tied to the requested video and keeps channel ID exact',()=>{
 const url='https://www.youtube.com/watch?v=ABCDEFGHIJK&utm_source=example',p=normalizeLookup(url),channel='UC1234567890123456789012';
 const data={videoDetails:{videoId:'ABCDEFGHIJK',channelId:channel,author:'Example Channel'}};
 const result=extractLookup('<script>var ytInitialPlayerResponse = '+JSON.stringify(data)+';</script>',p,url);
 assert.equal(result.id,channel);assert.equal(result.canonicalProfileUrl,'https://www.youtube.com/channel/'+channel);
 assert.ok(extractLookup(html({videoDetails:{...data.videoDetails,videoId:'ZYXWVUTSRQP'}}),p,url).error);
});
test('Facebook owner must be a bound User/Page; numeric identity query survives canonicalization',()=>{
 const url='https://www.facebook.com/reel/123456789/?fbclid=tracking',p=normalizeLookup(url);
 const data={video_id:'123456789',owner:{__typename:'Page',id,name:'Example Page'}};
 assert.equal(extractLookup(html(data),p,url).canonicalProfileUrl,'https://www.facebook.com/profile.php?id='+id);
 assert.ok(extractLookup(html({...data,owner:{...data.owner,__typename:'Comment'}}),p,url).error);
 const profile=normalizeProfile('https://www.facebook.com/profile.php?id='+id+'&fbclid=tracking');assert.equal(normalizeProfile(profile.url).url,profile.url);
});
test('Opaque short URLs and arbitrary redirects are unsupported, never guessed',()=>{
 for(const url of ['https://vm.tiktok.com/opaque','https://example.test/@alex/video/123','https://instagram.com/reel/ab/extra'])assert.throws(()=>normalizeLookup(url));
 const p=normalizeLookup(video);assert.ok(extractLookup(html({id:'123456789',author:owner}),p,'https://example.test/').error);
});
