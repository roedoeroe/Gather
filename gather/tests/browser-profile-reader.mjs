// Real Chromium isolated world + DOM + same-origin fetch. All HTTPS page/source
// requests are intercepted fictional fixtures; no live platform/extension claim.
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=new URL('../account-id-tool/',import.meta.url),out=process.env.GATHER_BROWSER_ARTIFACTS||new URL('../../artifacts/browser-profile-reader/',import.meta.url).pathname;
await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.GATHER_CHROMIUM_PATH||'/usr/lib/chromium/chromium',headless:true,chromiumSandbox:true});const passed=[];
try{
 const context=await browser.newContext(),url='https://www.instagram.com/alex.example/',requests=[];
 let html='<script type="application/json">{"username":"alex.example","id":"9007199254740993123","full_name":"Alex Example","session":"FICTIONAL_PRIVATE_SENTINEL"}</script>';
 await context.route('**/*',async route=>{requests.push({url:route.request().url(),method:route.request().method()});assert.equal(route.request().url(),url);await route.fulfill({status:200,contentType:'text/html',body:html});});
 const page=await context.newPage();await page.goto(url);const cdp=await context.newCDPSession(page),{frameTree}=await cdp.send('Page.getFrameTree');
 const {executionContextId}=await cdp.send('Page.createIsolatedWorld',{frameId:frameTree.frame.id,worldName:'gather-fixture-reader'});
 const script=await fs.readFile(new URL('profile-reader.js',root),'utf8');await cdp.send('Runtime.evaluate',{contextId:executionContextId,expression:script});
 const read=async(source=false,names=false)=>{const r=await cdp.send('Runtime.evaluate',{contextId:executionContextId,expression:'__gatherProfileReader('+JSON.stringify(url)+','+source+','+names+')',awaitPromise:true,returnByValue:true});assert.ok(!r.exceptionDetails);return r.result.value;};
 const result=await read();assert.equal(result.id,'9007199254740993123');assert.ok(!('displayName'in result));assert.ok(!JSON.stringify(result).includes('SENTINEL'));assert.ok(JSON.stringify(result).length<1024);assert.equal(await page.evaluate(()=>typeof __gatherProfileReader),'undefined');passed.push('Actual isolated-world parser returns exact ID and status only; page main world cannot access reader and no HTML/session sentinel returns.');
 assert.equal((await read(false,true)).displayName,'Alex Example');passed.push('Display name returns only when requested; exact numeric ID remains a string.');
 const fromSource=await read(true,false);assert.equal(fromSource.id,result.id);assert.equal(requests.length,2);assert.ok(requests.every(r=>r.url===url&&r.method==='GET'));passed.push('Automatic source fallback makes only the requested same-origin GET and returns the minimal parsed result; all network is intercepted fictionally.');
 await page.evaluate(()=>document.documentElement.innerHTML='<p>Log in to Instagram</p>');assert.match((await read()).error,/sign in/);passed.push('Real DOM sign-in screen gives a bounded recovery error without an ID.');
 await page.evaluate(()=>document.documentElement.innerHTML='<script type="application/json">[{"username":"alex.example","id":"123"},{"username":"alex.example","id":"456"}]</script>');assert.match((await read()).error,/Multiple account IDs/);passed.push('Conflicting account data is rejected by the same generated adapter running in Chromium.');
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({status:'passed',groups:passed.length,passed,scope:'Real Chromium isolated world; mocked network; no native extension or live platform'},null,2));console.log(JSON.stringify({status:'passed',groups:passed.length}));await context.close();
}finally{await browser.close();}
