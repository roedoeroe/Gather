import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLookup,normalizeProfile,extractLookup,parseInput,applyLookup} from '../account-id-tool/core.js';
import {extractPostDate,parsePostTimestamp} from '../account-id-tool/post-date.js';
const uid='9007199254740993123',epoch=1790944496,iso='2026-10-02T12:34:56.000Z';
const html=data=>'<script type="application/json">'+JSON.stringify(data)+'</script>';
const fixtures=[
 ['https://instagram.com/p/Fictional123/',{shortcode:'Fictional123',taken_at_timestamp:epoch,owner:{username:'alex.example',id:uid}},'instagram'],
 ['https://tiktok.com/@alex.example/video/123456789',{id:'123456789',createTime:String(epoch),author:{uniqueId:'alex.example',id:uid}},'tiktok'],
 ['https://facebook.com/alex.example/posts/123456789',{post_id:'123456789',creation_time:epoch,actors:[{__typename:'User',id:uid,name:'Alex Example'}]},'facebook'],
 ['https://threads.com/@alex.example/post/Fictional123',{code:'Fictional123',taken_at:epoch,user:{username:'alex.example',id:uid}},'threads'],
 ['https://x.com/alex_example/status/123456789',{__typename:'Tweet',rest_id:'123456789',legacy:{created_at:'Fri Oct 02 12:34:56 +0000 2026'},core:{user_results:{result:{__typename:'User',rest_id:uid,legacy:{screen_name:'alex_example',name:'Alex Example',created_at:'Mon Jan 01 00:00:00 +0000 2001'}}}}},'x']
];
for(const [url,data,platform] of fixtures)test(platform+' reads only the post publication time and bound author ID',()=>{
 const p=normalizeLookup(url),date=extractPostDate(html(data),p,url);assert.equal(date.value,iso);assert.equal(date.timezone,'UTC');assert.equal(date.precision,'second');assert.equal(date.postUrl,p.url);
 const owner=extractLookup(html(data),p,url);assert.equal(owner.id,uid);assert.notEqual(owner.id,p.content.id);
 const entry=parseInput(url).entries[0];applyLookup(entry,owner);assert.equal(entry.sourcePageUrl,url);assert.equal(entry.id,uid);assert.equal(normalizeProfile(entry.url).platform,platform);
 assert.ok(extractPostDate(html(data),p,url.replace(p.content.id,'987654321')).error);
});
test('permalink times ignore recommendations, quotes, relative labels and edit time',()=>{
 const url=fixtures[0][0],p=normalizeLookup(url);
 const unrelated={shortcode:'other',taken_at_timestamp:epoch};assert.ok(extractPostDate(html(unrelated),p,url).error);
 assert.ok(extractPostDate(html({shortcode:p.content.id,dateModified:iso}),p,url).error);
 assert.ok(extractPostDate('<time>1w</time>',p,url,[{url,value:'1w'}]).error);
 const d=extractPostDate('',p,url,[{url:'https://instagram.com/p/other/',value:'2026-09-01T00:00:00Z'},{url,value:iso}]);assert.equal(d.value,iso);
 assert.ok(extractPostDate(html(fixtures[0][1]),p,url,[{url,value:'2026-10-03T12:34:56Z'}]).error);
});
test('YouTube and post-linked structured data retain date-only precision; unbound data fails',()=>{
 const url='https://youtube.com/watch?v=ABCDEFGHIJK',p=normalizeLookup(url),record={videoDetails:{videoId:'ABCDEFGHIJK'},microformat:{playerMicroformatRenderer:{publishDate:'2026-10-02',uploadDate:'2026-09-30'}}};
 const d=extractPostDate(html(record),p,url);assert.equal(d.value,'2026-10-02');assert.equal(d.precision,'date');assert.equal(d.timezone,'not supplied');
 assert.ok(extractPostDate(html(record.microformat),p,url).error);
 assert.equal(extractPostDate(html({'@type':'VideoObject',url,datePublished:iso}),p,url).value,iso);
 assert.ok(extractPostDate(html({'@type':'VideoObject',url:'https://youtube.com/watch?v=ZYXWVUTSRQP',datePublished:iso}),p,url).error);
});
test('absolute timestamp parsing preserves offsets and rejects ambiguous or invalid time',()=>{
 assert.equal(parsePostTimestamp('2026-10-02T05:34:56-07:00').value,iso);
 assert.equal(parsePostTimestamp(epoch*1000).value,iso);
 assert.equal(parsePostTimestamp('2026-10-02T12:34Z').precision,'minute');
 for(const invalid of ['12 days ago','10/02/2026','2026-02-30','2026-10-02T24:00:00Z','2026-10-02T12:34:56','1900-01-01','9999-01-01',NaN,Infinity,0])assert.equal(parsePostTimestamp(invalid),null,String(invalid));
});
test('Facebook ordinary, group, photo and query permalinks are content, never account IDs',()=>{
 for(const url of ['https://facebook.com/alex/posts/pfbidExample123','https://facebook.com/groups/fictional/posts/123456789','https://facebook.com/story.php?story_fbid=123456789&id=456','https://facebook.com/permalink.php?story_fbid=123456789&id=456','https://facebook.com/photo.php?fbid=123456789']){
  const p=normalizeLookup(url);assert.ok(p.content);assert.equal(p.directId,'');assert.equal(normalizeLookup(p.url).key,p.key);
 }
 assert.equal(normalizeLookup('https://tiktok.com/@alex.example/photo/123456789').content.id,'123456789');
 assert.equal(normalizeLookup('https://instagram.com/reels/Fictional123').content.id,'Fictional123');
});
test('X handles normalize across domains; status IDs and unrelated or conflicting users never become author IDs',()=>{
 assert.equal(normalizeLookup('https://twitter.com/alex_example/status/123456789/photo/1').key,normalizeLookup(fixtures[4][0]).key);
 const p=normalizeLookup(fixtures[4][0]),record=fixtures[4][1];
 assert.ok(extractLookup(html({rest_id:'123456789',legacy:{created_at:iso}}),p,p.url).error);
 assert.ok(extractLookup(html([record,{...record,core:{user_results:{result:{rest_id:'444',legacy:{screen_name:'alex_example'}}}}}]),p,p.url).error);
 assert.ok(extractLookup(html({...record,core:{user_results:{result:{rest_id:uid,legacy:{screen_name:'someone_else'}}}}}),p,p.url).error);
 assert.equal(normalizeProfile('https://twitter.com/alex_example').url,'https://x.com/alex_example');
 assert.throws(()=>normalizeLookup('https://x.com/home'));
});
test('comment permalink query timestamps never substitute for publication time',()=>{
 const url=fixtures[0][0],p=normalizeLookup(url);for(const key of ['comment_id','reply_comment_id','reply_id','lc'])assert.ok(extractPostDate('',p,url,[{url:url+'?'+key+'=999',value:iso}]).error);
});

test('Facebook parent-post references in comments cannot supply the author or publication date',()=>{
 const [url,post]=fixtures[2],p=normalizeLookup(url);
 for(const attributes of [{__typename:'Comment'},{comment_id:'987654321'},{}]){
  const comment={...attributes,post_id:p.content.id,creation_time:epoch+86400,author:{__typename:'User',id:'444'}};
  assert.ok(extractLookup(html(comment),p,url).error);assert.ok(extractPostDate(html(comment),p,url).error);
  assert.equal(extractLookup(html([post,comment]),p,url).id,uid);assert.equal(extractPostDate(html([post,comment]),p,url).value,iso);
 }
});
