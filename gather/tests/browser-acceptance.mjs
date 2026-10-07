// Real Chromium extension journey. Not a substitute for the toolbar/side-panel manual checks.
// Requires Playwright and a sandbox-capable Chromium runner. Set GATHER_CHROMIUM_PATH for a system Chromium.
// Uses an isolated browser profile, deterministic intercepted pages, and the actual extension.
// Output directory: GATHER_BROWSER_ARTIFACTS or ../../artifacts/browser. Browser security stays enabled.
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const artifacts=process.env.GATHER_BROWSER_ARTIFACTS||'/workspace/Gather/artifacts/browser';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),extension=path.join(root,'account-id-tool'),profile=await fs.mkdtemp(path.join(os.tmpdir(),'gather-synthetic-'));
let context;
try{
  context=await chromium.launchPersistentContext(profile,{...(process.env.GATHER_CHROMIUM_PATH?{executablePath:process.env.GATHER_CHROMIUM_PATH}:{channel:'chromium'}),headless:true,chromiumSandbox:true,ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+extension,'--load-extension='+extension]});
  await context.route(/^https?:\/\//,route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Synthetic search results</title><h1>Northbridge test results</h1>'}));
  let [worker]=context.serviceWorkers();if(!worker)worker=await context.waitForEvent('serviceworker');const id=new URL(worker.url()).host;
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('chrome-extension://'+id+'/workspace.html');
  await page.getByRole('button',{name:'+ New',exact:true}).click();await page.getByLabel('Project name',{exact:true}).fill('Northbridge');await page.getByLabel('First scan',{exact:true}).fill('October review');await page.locator('#submitEdit').click();await page.getByRole('heading',{name:'October review',exact:true}).waitFor();
  await page.getByRole('button',{name:'+ Link / excerpt',exact:true}).click();await page.getByLabel('Source URL',{exact:true}).fill('https://example.test/report');await page.getByLabel('Title',{exact:true}).fill('Northbridge public report');await page.getByLabel('Selected excerpt (optional)').fill('A deterministic synthetic excerpt.');await page.locator('#submitEdit').click();await page.getByRole('heading',{name:'Northbridge public report'}).waitFor();
  await page.getByRole('button',{name:'+ Next action',exact:true}).click();await page.getByLabel('What needs to happen?').fill('Review the source date');await page.locator('#submitEdit').click();
  await page.getByLabel('Search query',{exact:true}).fill('Northbridge synthetic');await page.getByRole('button',{name:'Search ↗',exact:true}).click();await page.getByRole('button',{name:'Mark reviewed',exact:true}).click();
  await page.getByRole('button',{name:'+ New',exact:true}).click();await page.getByLabel('Project name',{exact:true}).fill('Southridge');await page.getByLabel('First scan',{exact:true}).fill('Intake');await page.locator('#submitEdit').click();await page.getByRole('heading',{name:'Intake',exact:true}).waitFor();assert.equal(await page.locator('#items .card').count(),0);
  await page.getByRole('button',{name:'October review',exact:true}).click();await page.getByRole('heading',{name:'Northbridge public report'}).waitFor();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export report',exact:true}).click()]);const report=await fs.readFile(await download.path(),'utf8');assert.match(report,/Northbridge public report/);assert.doesNotMatch(report,/Southridge/);
  await page.reload();await page.getByRole('heading',{name:'October review',exact:true}).waitFor();assert.equal(await page.locator('#items .card').count(),1);
  await fs.mkdir(artifacts,{recursive:true});await page.setViewportSize({width:1360,height:980});await page.screenshot({path:path.join(artifacts,'workspace-desktop.png'),fullPage:true});await page.setViewportSize({width:400,height:900});await page.screenshot({path:path.join(artifacts,'workspace-narrow.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');assert.deepEqual(errors,[]);console.log('PASS: real extension create/save/search/switch/export/reload/responsive journey');
}finally{await context?.close();await fs.rm(profile,{recursive:true,force:true});}
