// Installed-extension smoke test, not native toolbar/activeTab/OS-dialog acceptance.
// Known policy blocks exit promptly; administrator policy and security stay intact.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {workspaceJourney} from './fixtures/installed-workspace-journey.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extension = path.resolve(process.env.GATHER_EXTENSION_ROOT || path.join(root, 'account-id-tool'));
const artifacts = process.env.GATHER_BROWSER_ARTIFACTS || path.resolve(root, '../artifacts/browser-installed');
const resultsPath = path.join(artifacts, 'results.json');
await fs.mkdir(artifacts, {recursive: true});
await fs.rm(resultsPath, {force: true});
const manifest = JSON.parse(await fs.readFile(path.join(extension, 'manifest.json'), 'utf8'));
let context, profile, installed = false;
const passed = [];

async function managedBlock(browserPath) {
  if (process.platform !== 'linux') return null;
  const name = path.basename(browserPath || 'chromium').toLowerCase();
  const policies = name.includes('edge') ? '/etc/opt/edge/policies/managed' :
    name.includes('chrome') && !name.includes('chromium') ? '/etc/opt/chrome/policies/managed' :
    '/etc/chromium/policies/managed';
  let files;
  try { files = await fs.readdir(policies); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  for (const name of files.filter(name => name.endsWith('.json')).sort()) {
    const file = path.join(policies, name);
    const policy = JSON.parse(await fs.readFile(file, 'utf8'));
    // Official Chromium policy: '*' blocks ALL unpacked extensions, even when
    // signed extensions have an allowlist exception.
    if (Array.isArray(policy.ExtensionInstallBlocklist) && policy.ExtensionInstallBlocklist.includes('*')) {
      return {code: 'MANAGED_UNPACKED_EXTENSION_BLOCK', policyFile: file,
        policy: 'ExtensionInstallBlocklist', value: ['*'],
        reason: 'This machine administrator blocks loading unpacked test extensions.',
        action: 'Run in an environment whose administrator permits test extensions. Keep this machine policy intact.'};
    }
  }
  return null;
}

async function record(status, extra = {}) {
  await fs.writeFile(resultsPath, JSON.stringify({kind: 'installed-extension-smoke', status,
    version: manifest.version, nativeExtension: installed, passed,
    nativeToolbarAndCapture: 'not-tested', livePlatforms: 'not-tested', ...extra}, null, 2) + '\n');
}

try {
  const executablePath = process.env.GATHER_CHROMIUM_PATH ||
    (await fs.access('/usr/lib/chromium/chromium').then(() => '/usr/lib/chromium/chromium', () => undefined));
  const blocker = await managedBlock(executablePath);
  if (blocker) {
    await record('blocked', {blocker, browserLaunched: false});
    console.error('BLOCKED: ' + blocker.reason + '\n' + blocker.policyFile + '\n' + blocker.action);
    process.exitCode = 2;
  } else {
    const {chromium} = createRequire(import.meta.url)('playwright');
    profile = await fs.mkdtemp(path.join(os.tmpdir(), 'gather-installed-test-'));
    context = await chromium.launchPersistentContext(profile, {
      ...(executablePath ? {executablePath} : {channel: 'chromium'}),
      headless: true, chromiumSandbox: true, acceptDownloads: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--disable-extensions-except=' + extension, '--load-extension=' + extension],
    });
    context.setDefaultTimeout(15000);
    // Every research destination is a fictional controlled page, not a live platform.
    await context.route(/^https?:\/\//, route => route.fulfill({contentType: 'text/html',
      body: '<!doctype html><title>Fictional research fixture</title><h1>Northbridge fictional results</h1>'}));
    let worker = context.serviceWorkers().find(worker => worker.url().endsWith('/background.js'));
    if (!worker) worker = await context.waitForEvent('serviceworker', {
      predicate: worker => worker.url().endsWith('/background.js'), timeout: 15000,
    }).catch(() => { throw new Error('Gather did not load. Check administrator policy and whether this Chromium build supports unpacked extensions. No installed-extension tests passed.'); });
    const extensionId = new URL(worker.url()).host;
    assert.equal(await worker.evaluate(() => chrome.runtime.getManifest().version), manifest.version);
    installed = true;
    passed.push('Actual installed extension worker starts with the expected manifest version.');
    passed.push(...await workspaceJourney(context, 'chrome-extension://' + extensionId, artifacts));
    assert.equal(passed.length, 8, 'Every smoke scenario must execute.');
    await record('passed');
    console.log('PASS: ' + passed.length + ' installed-extension smoke groups. Toolbar capture, OS dialogs and live profiles need separate checks.');
  }
} catch (error) {
  await record('failed', {error: error.message});
  console.error('FAILED: ' + error.message);
  process.exitCode = 1;
} finally {
  await context?.close();
  if (profile) await fs.rm(profile, {recursive: true, force: true});
}
