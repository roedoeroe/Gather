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
  assert.equal(await page.getByRole('tab').count(), 4);
  await page.getByRole('heading', {name: 'Inbox', exact: true}).waitFor();
  passed.push('Current workspace starts in Inbox with four task tabs and a worker/storage response.');

  const createCase = async (name, scan) => {
    await page.getByRole('button', {name: 'New case', exact: true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Case name', {exact: true}).fill(name);
    await dialog.getByLabel('First scan', {exact: true}).fill(scan);
    await dialog.getByRole('button', {name: 'Create case', exact: true}).click();
    await page.getByRole('heading', {name: scan, exact: true}).waitFor();
    await dialog.waitFor({state: 'detached'});
  };
  await createCase('Northbridge', 'October review');
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

  await page.getByLabel('Search query', {exact: true}).fill('Northbridge fictional search');
  await page.getByRole('button', {name: 'Search ↗', exact: true}).click();
  await page.getByRole('button', {name: 'Mark reviewed', exact: true}).click();
  await page.getByRole('button', {name: 'Mark reviewed', exact: true}).waitFor({state: 'detached'});
  await page.locator('#localSearch').fill('no fictional search matches');
  await page.getByText('No matching searches', {exact: true}).waitFor();
  await page.locator('#historyKind').selectOption('activity');
  await page.locator('#localSearch').fill('no fictional activity matches');
  await page.getByText('No matching activity', {exact: true}).waitFor();
  await page.getByLabel('Search query', {exact: true}).fill('Northbridge second fictional search');
  await page.getByRole('button', {name: 'Search ↗', exact: true}).click();
  await page.getByRole('button', {name: 'Mark reviewed', exact: true}).waitFor();
  assert.equal(await page.locator('#historyKind').inputValue(), 'searches', 'Launching a search from Activity should show its search record.');
  assert.equal(await page.locator('#localSearch').inputValue(), '');
  await page.getByRole('button', {name: 'Mark reviewed', exact: true}).click();
  await page.locator('#historyKind').selectOption('activity');
  assert.equal(await page.locator('#localSearch').inputValue(), 'no fictional activity matches');
  await page.locator('#historyKind').selectOption('searches');
  await page.getByRole('button', {name: 'Mark reviewed', exact: true}).waitFor({state: 'detached'});
  await createCase('Southridge', 'Intake');
  assert.equal(await page.locator('#localSearch').inputValue(), '', 'A new scan must start with clear filters.');
  await page.locator('[data-view="items"]').click();
  await page.locator('#items .empty').waitFor();
  assert.equal(await page.locator('#items .card').count(), 0);
  await page.locator('#projects').getByRole('button', {name: 'October review', exact: true}).click();
  await page.getByRole('heading', {name: 'Northbridge fictional report', exact: true}).waitFor();
  passed.push('Search launch/review and case switching preserve original findings.');

  await page.locator('#reportTools summary').click();
  const downloaded = page.waitForEvent('download');
  await page.locator('#exportReport').click();
  const download = await downloaded;
  const report = await fs.readFile(await download.path(), 'utf8');
  assert.match(report, /Northbridge fictional report/);
  assert.doesNotMatch(report, /Southridge/);
  await page.reload();
  await page.getByRole('heading', {name: 'October review', exact: true}).waitFor();
  assert.equal(await page.locator('#items .card').count(), 1);
  passed.push('Actual file download contains only the selected scan; reload retains work.');

  await page.getByRole('tab', {name: 'Settings', exact: true}).click();
  await page.getByRole('button', {name: 'Delete case…', exact: true}).click();
  const deletion = page.getByRole('dialog');
  await deletion.getByRole('button', {name: 'Delete without backup', exact: true}).waitFor();
  await deletion.getByRole('button', {name: 'Cancel', exact: true}).click();
  await deletion.waitFor({state: 'detached'});
  assert.equal(await page.locator('#projects').getByRole('button', {name: 'October review', exact: true}).count(), 1);
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
