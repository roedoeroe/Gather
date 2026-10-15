// Installed sandboxed Edge, real toolbar invocation and clipboard. Only page
// responses are fictional; no extension API or permission replacement.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(process.env.GATHER_EXTENSION_ROOT||new URL('../account-id-tool/',import.meta.url).pathname),out=process.env.GATHER_BROWSER_ARTIFACTS||new URL('../../artifacts/browser-post-tools/',import.meta.url).pathname;
await fs.mkdir(out,{recursive:true});await fs.rm(path.join(out,'results.json'),{force:true});
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'gather-post-'));
const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.GATHER_CHROMIUM_PATH,headless:false,chromiumSandbox:true,viewport:{width:1280,height:800},ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+root,'--load-extension='+root]});
const passed=[],errors=[],requests=[];context.on('weberror',e=>errors.push(e.error().message));
const uid='9007199254740993123',epoch=1790944496,iso='2026-10-02T12:34:56.000Z';
const fixtures=[
 ['instagram','https://www.instagram.com/p/Fictional123/',{shortcode:'Fictional123',taken_at_timestamp:epoch,owner:{username:'alex.example',id:uid}}],
 ['tiktok','https://www.tiktok.com/@alex.example/video/123456789',{id:'123456789',createTime:String(epoch),author:{uniqueId:'alex.example',id:uid}}],
 ['facebook','https://www.facebook.com/alex.example/posts/123456789',{post_id:'123456789',creation_time:epoch,actors:[{__typename:'User',id:uid}]}],
 ['threads','https://www.threads.com/@alex.example/post/Fictional123',{code:'Fictional123',taken_at:epoch,user:{username:'alex.example',id:uid}}],
 ['x','https://x.com/alex_example/status/123456789',{rest_id:'123456789',legacy:{created_at:'Fri Oct 02 12:34:56 +0000 2026'},core:{user_results:{result:{rest_id:uid,legacy:{screen_name:'alex_example'}}}}}],
 ['youtube','https://www.youtube.com/watch?v=ABCDEFGHIJK',{videoDetails:{videoId:'ABCDEFGHIJK',channelId:'UCabcdefghijklmnopqrstuv'},microformat:{playerMicroformatRenderer:{publishDate:'2026-10-02'}}}]
];
let initial='',sourceHTML='',delay=0,sourceDelay=0;
const json=v=>'<script type="application/json">'+JSON.stringify(v)+'</script>';
await context.route(/^https?:\/\//,async route=>{requests.push(route.request().url());const navigation=route.request().isNavigationRequest();if(!navigation&&sourceDelay)await new Promise(r=>setTimeout(r,sourceDelay));try{await route.fulfill({contentType:'text/html',body:navigation?'<!doctype html><title>Fictional post QA</title><style>body{font:20px sans-serif;background:white}</style><h1>Alex Example · fictional post</h1><textarea id="paste" aria-label="Clipboard check"></textarea>'+initial+(delay?`<script>setTimeout(()=>{const s=document.createElement('script');s.type='application/json';s.textContent=${JSON.stringify(JSON.stringify(fixtures[0][2]))};document.head.append(s)},${delay})</script>`:''):sourceHTML});}catch(e){if(!context.pages().length)return;throw e;}});
try{
 let worker=context.serviceWorkers().find(w=>w.url().endsWith('/background.js'));worker||=await context.waitForEvent('serviceworker');const extension='chrome-extension://'+new URL(worker.url()).host;
 const api=await context.newPage();await api.goto(extension+'/popup.html');await api.locator('#captureScan:not([disabled])').waitFor();
 const shortcuts=await context.newPage();await shortcuts.goto('edge://extensions/shortcuts');assert.equal(await shortcuts.evaluate(id=>new Promise(r=>chrome.developerPrivate.updateExtensionCommand({extensionId:id,commandName:'_execute_action',keybinding:'Ctrl+Shift+Y'},()=>r(chrome.runtime.lastError?.message||'set'))),new URL(worker.url()).host),'set');await shortcuts.close();
 const source=await context.newPage(),cdp=await context.newCDPSession(source),apiCDP=await context.newCDPSession(api),apiTarget=(await apiCDP.send('Target.getTargetInfo')).targetInfo.targetId;
 const x=process.env.GATHER_XDOTOOL;const osKey=(...args)=>execFileSync(x,args,{env:process.env});
 async function until(fn){let value;for(let n=0;n<160;n++){value=await fn();if(value)return value;await new Promise(r=>setTimeout(r,50));}throw Error('Timed out waiting for native result');}
 async function open(url,body,options={}){
  initial=body;sourceHTML=options.source??body;delay=options.delay||0;sourceDelay=options.sourceDelay||0;requests.length=0;await source.goto(url);await source.bringToFront();
  const win=execFileSync(x,['search','--onlyvisible','--name','Fictional post QA'],{env:process.env,encoding:'utf8'}).trim().split('\n').at(-1);osKey('windowfocus','--sync',win);osKey('key','--clearmodifiers','ctrl+shift+y');
  const target=await until(async()=>(await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url===extension+'/popup.html'&&t.targetId!==apiTarget));const {sessionId}=await cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:false});let seq=0;const calls=new Map();
  const listener=e=>{if(e.sessionId===sessionId){const m=JSON.parse(e.message);calls.get(m.id)?.(m);}};cdp.on('Target.receivedMessageFromTarget',listener);
  const evaluate=async expression=>{const id=++seq,response=new Promise(r=>calls.set(id,r));await cdp.send('Target.sendMessageToTarget',{sessionId,message:JSON.stringify({id,method:'Runtime.evaluate',params:{expression,returnByValue:true,awaitPromise:true}})});const m=await response;calls.delete(id);assert.ok(!m.error&&!m.result?.exceptionDetails,JSON.stringify(m));return m.result.result.value;};
  await until(()=>evaluate("Boolean(document.querySelector('.post-tools button')?.onclick)"));
  const click=async selector=>{await new Promise(r=>setTimeout(r,350));const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:screenX+r.x+r.width/2,y:screenY+r.y+r.height/2}})()`);osKey('mousemove','--sync',String(Math.round(point.x)),String(Math.round(point.y)),'click','1');};
  return {evaluate,click,async close(){await cdp.send('Target.detachFromTarget',{sessionId});cdp.off('Target.receivedMessageFromTarget',listener);osKey('key','Escape');await source.bringToFront();}};
 }
 async function pasted(){await source.locator('#paste').focus();await source.keyboard.press('Control+V');return source.locator('#paste').inputValue();}
 for(const [name,url,data] of fixtures){
  const p=await open(url,json(data));const expected=name==='youtube'?data.videoDetails.channelId:uid;
  await until(async()=>(await p.evaluate("document.querySelector('#quickList').innerText")).includes(expected));
  await p.click('.post-tools > button');await until(()=>p.evaluate("!document.querySelector('.post-date-result button').hidden"));
  const shown=await p.evaluate("document.querySelector('.post-date-result').innerText");assert.ok(shown.includes('2026-10-02'),shown);assert.match(shown,name==='youtube'?/Date only/:/UTC/);
  await p.click('.post-date-result button');await until(()=>p.evaluate("document.querySelector('.post-date-result button').textContent==='Copied'"));
  if(name==='x')execFileSync('import',['-window','root',path.join(out,'x-post-toolbar.png')]);
  await p.close();assert.equal(await pasted(),name==='youtube'?'2026-10-02 (date only; time/timezone unavailable)':iso);
  const q=await open(url,json(data));await until(()=>q.evaluate("!document.querySelector('#copyQuick').disabled"));await q.click('#copyQuick');await until(async()=>(await q.evaluate("document.querySelector('#quickMessage').textContent")).startsWith('Copied 1 ID'));await q.close();assert.equal(await pasted(),expected);
  passed.push(name+': real toolbar resolves bound author; native Copy IDs and Copy date round-trip through the system clipboard.');
 }
 let p=await open(fixtures[0][1],'<p>Loading metadata</p>',{delay:1400,source:json(fixtures[0][2])});await until(async()=>(await p.evaluate("document.querySelector('#quickList').innerText")).includes(uid));assert.equal(requests.length,1);await p.close();passed.push('Delayed Instagram post owner resolves within the existing two-second buffer without a second user action or source fetch.');
 p=await open(fixtures[4][1],json({...fixtures[4][2],legacy:{}}),{source:json(fixtures[4][2])});await p.click('.post-tools > button');await until(()=>p.evaluate("!document.querySelector('.post-date-result button').hidden"));assert.equal(requests.length,2);await p.close();passed.push('X date source fallback uses one GET of the same authorized post with real activeTab; no X host permission.');
 const u=fixtures[0][1],base={...fixtures[0][2]};delete base.taken_at_timestamp;
 p=await open(u,json(base)+`<a href="${u}?comment_id=999"><time datetime="2026-09-01T00:00:00Z">comment</time></a><a href="${u}"><time datetime="${iso}">1w</time></a>`);await p.click('.post-tools > button');await until(()=>p.evaluate("!document.querySelector('.post-date-result button').hidden"));assert.match(await p.evaluate("document.querySelector('.post-date-result').innerText"),/12:34:56 UTC/);await p.close();passed.push('Generated isolated reader reads exact permalink time and ignores a comment timestamp.');
 p=await open(u,json(fixtures[0][2])+`<a href="${u}"><time datetime="2026-10-03T12:34:56Z">2w</time></a>`);await p.click('.post-tools > button');await until(async()=>(await p.evaluate("document.querySelector('.post-date-result').innerText")).includes('Conflicting'));assert.equal(await p.evaluate("document.querySelector('.post-date-result button').hidden"),true);await p.close();passed.push('Conflicting dates show an explanation with no copyable guessed value.');
 p=await open(u,json(base),{source:json(fixtures[0][2]),sourceDelay:600});await p.click('.post-tools > button');await source.evaluate(()=>history.pushState({},'','/p/DifferentPost/'));await new Promise(r=>setTimeout(r,900));assert.equal(await p.evaluate("document.querySelector('.post-date-result button').hidden"),true);await p.close();passed.push('SPA navigation during date acquisition discards stale results and hides Copy date.');
 p=await open('https://www.instagram.com/alex.example/',json({username:'alex.example',id:uid}));await p.click('.post-tools > button');await until(async()=>(await p.evaluate("document.querySelector('.post-date-result').innerText")).includes('individual post'));await p.close();passed.push('Profile pages explain that post dates require an individual post.');
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'passed',groups:passed.length,passed,errors,scope:'Native sandboxed Linux Edge, real toolbar and clipboard, fictional HTTPS responses; not signed-in live-platform coverage.'},null,2));console.log('PASS '+passed.length+' native post tool groups');
}finally{await context.close();await fs.rm(profile,{recursive:true,force:true});}
