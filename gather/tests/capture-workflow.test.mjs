import test from 'node:test';import assert from 'node:assert/strict';
import {selectionPixels} from '../account-id-tool/capture-selection.js';
import {historyScope,filterCaptureHistory,captureHistoryGroups} from '../account-id-tool/capture-history.js';
import {captureDeleteGuard} from '../account-id-tool/capture-store.js';

const viewport={width:800,height:600,scrollX:0,scrollY:90,devicePixelRatio:2,visualScale:1};
const shot={dimensions:{width:1600,height:1200},coordinates:{viewportWidth:800,viewportHeight:600,scrollX:0,scrollY:90,devicePixelRatio:2,visualScale:1}};
test('on-page rectangle maps high-DPI fractional edges outward without losing pixels',()=>{assert.deepEqual(selectionPixels({viewport,rect:{x:10.25,y:20.25,width:100.5,height:90.5}},shot),{x:20,y:40,width:202,height:182});});
test('selection rejects movement, resize, zoom and an inconsistent native screenshot scale',()=>{
  for(const [key,value]of [['scrollY',91],['width',801],['visualScale',1.2],['devicePixelRatio',1]])assert.throws(()=>selectionPixels({viewport:{...viewport,[key]:value},rect:{x:10,y:20,width:100,height:90}},shot),/changed/);
  assert.throws(()=>selectionPixels({viewport,rect:{x:10,y:20,width:100,height:90}},{...shot,dimensions:{width:1600,height:1000}}),/scale/);
});
const records=[
  {id:'a',projectId:'north',scanId:'october',subjectId:'alex',startedAt:3,source:{title:'Example page',url:'https://example.test/a'},mode:'selection',status:'complete',savedState:'saved',export:{status:'not-exported'}},
  {id:'b',projectId:'south',scanId:'october-2',subjectId:'other-alex',startedAt:2,source:{title:'Same title',url:'https://example.test/b'},mode:'visible',status:'complete',savedState:'saved',export:{status:'failed'}},
  {id:'c',projectId:'north',scanId:'november',subjectId:'alex',startedAt:1,source:{title:'Example page',url:'https://example.test/c'},mode:'full-page',status:'partial',savedState:'saved'},
  {id:'d',projectId:null,scanId:null,subjectId:null,startedAt:4,source:{title:'Inbox',url:'https://example.test/d'},mode:'visible',status:'cancelled',savedState:'pending'}
];
test('history browsing is exact by scan, case, subject and Inbox without name-based relationships',()=>{
  const ids=options=>filterCaptureHistory(records,options).map(r=>r.id);
  assert.deepEqual(ids({scope:'scan',scanId:'october'}),['a']);assert.deepEqual(ids({scope:'case',projectId:'north'}),['a','c']);assert.deepEqual(ids({scope:'subject',projectId:'north',subjectId:'alex'}),['a','c']);assert.deepEqual(ids({scope:'all',caseFilter:'inbox'}),['d']);assert.deepEqual(ids({scope:'all',caseFilter:'south'}),['b']);assert.equal(historyScope('untrusted'),'scan');
});
test('history search, attention state, saved-only and grouping stay deterministic',()=>{
  assert.deepEqual(filterCaptureHistory(records,{scope:'all',status:'attention'}).map(r=>r.id),['d','b','c']);assert.deepEqual(filterCaptureHistory(records,{scope:'all',status:'saved',query:'Alex Example',label:r=>r.subjectId==='alex'?'Alex Example':''}).map(r=>r.id),['a','c']);assert.deepEqual(captureHistoryGroups(filterCaptureHistory(records,{scope:'all'})).map(g=>g.scanId),[null,'october','october-2','november']);
});
test('capture deletion uses record snapshots and refuses active exports, duplicates and empty selection',()=>{
  const guard=captureDeleteGuard([records[0]]);assert.equal(guard[0].snapshot,JSON.stringify(records[0]));assert.throws(()=>captureDeleteGuard([]));assert.throws(()=>captureDeleteGuard([records[0],records[0]]));assert.throws(()=>captureDeleteGuard([{...records[0],status:'capturing'}]),/Finish/);assert.throws(()=>captureDeleteGuard([{...records[0],export:{status:'exporting'}}]),/Finish/);
});
