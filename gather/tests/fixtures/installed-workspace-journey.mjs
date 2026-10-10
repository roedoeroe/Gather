// Shared UI journey; the caller records whether APIs are native or doubles.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function workspaceJourney(context, baseURL, artifacts) {
  const passed = [], errors = [];
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL + '/workspace.html');
  await page.locator('.layout:not([inert])').waitFor();
  assert.equal(await page.getByRole('tab').count(), 5);
  await page.getByRole('heading', {name: 'Inbox', exact: true}).waitFor();
  passed.push('Current workspace starts in Inbox with five task tabs and a worker/storage response.');

  const createCase = async (name, scan) => {
    await page.getByRole('button', {name: 'New case', exact: true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Case name', {exact: true}).fill(name);
    assert.equal(await dialog.getByLabel('First scan', {exact: true}).count(),0);
    await dialog.getByRole('button', {name: 'Create case', exact: true}).click();
    await page.getByRole('heading', {name, exact:true}).waitFor();
    await dialog.waitFor({state:'detached'});await page.getByRole('tab',{name:'Research',exact:true}).click();
  };
  await createCase('Northbridge', 'Northbridge');
  await page.getByText('Add to this scan', {exact: true}).click();
  await page.locator('#addSource').click();
  await page.getByLabel('Source URL', {exact: true}).fill('https://example.test/report');
  await page.getByLabel('Title', {exact: true}).fill('Northbridge fictional report');
  await page.getByLabel('Selected excerpt (optional)', {exact: true}).fill('Deterministic fictional source.');
  await page.locator('#submitEdit').click();
  await page.getByRole('heading', {name: 'Northbridge fictional report', exact: true}).waitFor();
  passed.push('Current New case and Link or excerpt controls create scoped local work.');

  // The current product closes Add after a successful save; reopen it explicitly.
  await page.locator('.add-menu summary').click();
  await page.locator('#addTask').click();
  await page.getByLabel('What needs to happen?', {exact: true}).fill('Review the fictional source date');
  await page.locator('#submitEdit').click();
  await page.locator('#editor').waitFor({state: 'hidden'});
  await page.locator('#localSearch').fill('Northbridge');
  assert.equal(await page.locator('#localSearch').inputValue(), 'Northbridge');
  assert.equal(await page.locator('#items .card').count(), 1);
  await page.locator('[data-view="tasks"]').click();
  assert.equal(await page.locator('#tasks .card').count(), 1, 'A findings filter must not hide tasks after a view switch.');
  assert.equal(await page.locator('#localSearch').inputValue(), '');
  await page.locator('#localSearch').fill('Review');
  await page.locator('[data-view="items"]').click();
  assert.equal(await page.locator('#localSearch').inputValue(), 'Northbridge');
  assert.equal(await page.locator('#items .card').count(), 1);
  await page.locator('[data-view="tasks"]').click();
  assert.equal(await page.locator('#localSearch').inputValue(), 'Review');
  await page.locator('#localSearch').fill('no fictional task matches');
  await page.getByText('No matching tasks', {exact: true}).waitFor();
  await page.locator('#localSearch').fill('Review');
  passed.push('Findings and tasks remember independent filters, so switching views does not conceal unrelated work.');
  await page.getByRole('heading', {name: 'Review the fictional source date', exact: true}).waitFor();
  await page.getByRole('button', {name: 'Mark done', exact: true}).click();
  await page.getByRole('button', {name: 'Reopen', exact: true}).waitFor();
  passed.push('Task creation and completion persist through current controls.');

  const snapshot=await page.evaluate(async()=>({local:await chrome.storage.local.get(null),session:await chrome.storage.session.get(null)}));
  assert.match(await page.getByLabel('Search query',{exact:true}).getAttribute('placeholder'),/alex.example/);
  await page.getByLabel('Search query', {exact: true}).fill('Northbridge fictional search');
  await page.getByRole('button', {name: 'Search ↗', exact: true}).click();
  await page.getByText('Search opened. Query not saved in Gather.',{exact:true}).waitFor();
  assert.equal(await page.locator('#query').inputValue(),'');
  const after=await page.evaluate(async()=>({local:await chrome.storage.local.get(null),session:await chrome.storage.session.get(null),tabs:await chrome.tabs.query({})}));
  assert.deepEqual(after.local,snapshot.local);assert.doesNotMatch(JSON.stringify(after.local)+JSON.stringify(after.session),/Northbridge fictional search/);
  // Without the tabs permission, a native extension cannot read arbitrary search-tab URLs.
  // Observe navigation through browser automation while API doubles expose their test tabs.
  const launched = async match => {
    const deadline=Date.now()+5000;
    do {
      const tabs=await page.evaluate(()=>chrome.tabs.query({}));
      const urls=[...tabs.flatMap(t=>[t.url,t.pendingUrl]),...context.pages().map(p=>p.url())].filter(Boolean);
      if(urls.some(match))return;
      await new Promise(resolve=>setTimeout(resolve,50));
    } while(Date.now()<deadline);
    assert.fail('Expected provider navigation did not occur.');
  };
  await launched(url=>new URL(url).searchParams.get('q')==='Northbridge fictional search');
  await page.getByRole('button',{name:'Changes',exact:true}).click();
  await page.locator('#localSearch').fill('no fictional activity matches');
  await page.getByText('No matching activity', {exact: true}).waitFor();
  await page.getByRole('button',{name:'Reverse image',exact:true}).click();
  assert.equal(await page.locator('#query').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Choose image…');
  const imageProvider=page.getByLabel('Reverse image provider');
  assert.deepEqual(await imageProvider.locator('option').allTextContents(),['Google Lens','Lenso.ai','Bing Visual Search','Yandex Images','Baidu Images','Sogou Images','TinEye','Shutterstock']);
  await imageProvider.selectOption('tineye');
  await page.locator('#reverseImage input[type=file]').setInputFiles({name:'fictional.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAFElEQVR4nGNkYPjPAANMDEgANwcAMdMBB1sLEtoAAAAASUVORK5CYII=','base64')});
  await page.getByText('Selected locally. Nothing uploaded.',{exact:true}).waitFor();
  await page.screenshot({path:path.join(artifacts,'reverse-image.png'),fullPage:true});
  await page.getByText('Upload options',{exact:true}).click();
  await page.getByRole('button',{name:'Open provider without copying ↗',exact:true}).click();
  await page.getByText('Provider opened. Use its image upload control to choose the selected file. Gather did not upload it.',{exact:true}).waitFor();
  await launched(url=>url==='https://tineye.com/');
  await page.getByRole('button',{name:'Search the web',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'query');
  await page.locator('#query').fill('Fictional unsent draft');
  await page.reload();await page.getByRole('heading',{name:'Northbridge',exact:true}).waitFor();
  assert.equal(await page.locator('#query').inputValue(),'');
  assert.doesNotMatch(JSON.stringify(await page.evaluate(()=>chrome.storage.local.get(null))),/Fictional unsent draft/);
  passed.push('Web/image searches open provider tabs without query, draft or launch logs; placeholders, keyboard focus and reload work.');
  await createCase('Southridge', 'Intake');
  assert.equal(await page.locator('#localSearch').inputValue(), '', 'A new scan must start with clear filters.');
  await page.locator('[data-view="items"]').click();
  await page.locator('#items .empty').waitFor();
  assert.equal(await page.locator('#items .card').count(), 0);
  await page.locator('#projects').getByRole('button', {name: 'Northbridge', exact: true}).click();
  await page.getByRole('heading', {name: 'Northbridge fictional report', exact: true}).waitFor();
  passed.push('Case switching clears filters and preserves deliberately saved findings.');

  await page.locator('#reportTools summary').click();
  const downloaded = page.waitForEvent('download');
  await page.locator('#exportReport').click();
  const download = await downloaded;
  const report = await fs.readFile(await download.path(), 'utf8');
  assert.match(report, /Northbridge fictional report/);
  assert.doesNotMatch(report, /Southridge/);
  await page.reload();
  await page.getByRole('heading', {name: 'Northbridge', exact: true}).waitFor();
  assert.equal(await page.locator('#items .card').count(), 1);
  passed.push('Actual file download contains only the selected scan; reload retains work.');

  await page.getByRole('tab', {name: 'Settings', exact: true}).click();
  await page.getByRole('button', {name: 'Delete case…', exact: true}).click();
  const deletion = page.getByRole('dialog');
  await deletion.getByRole('button', {name: 'Delete without backup', exact: true}).waitFor();
  await deletion.getByRole('button', {name: 'Cancel', exact: true}).click();
  await deletion.waitFor({state: 'detached'});
  assert.equal(await page.locator('#projects').getByRole('button', {name: 'Northbridge', exact: true}).count(), 1);
  await page.getByRole('button', {name: 'Clear recent lookup history…', exact: true}).waitFor();
  passed.push('Settings exposes both destructive actions; cancelling preserves the case.');

  await page.getByRole('tab', {name: 'Research', exact: true}).click();
  await page.setViewportSize({width: 1360, height: 980});
  await page.screenshot({path: path.join(artifacts, 'workspace-desktop.png'), fullPage: true});
  await page.setViewportSize({width: 400, height: 900});
  await page.screenshot({path: path.join(artifacts, 'workspace-narrow.png'), fullPage: true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  passed.push('Workspace reflows at 400px without horizontal overflow or page errors.');
  await page.close();
  return passed;
}
