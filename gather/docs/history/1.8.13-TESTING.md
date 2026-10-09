# Gather 1.8.13 validation

All test data is fictional. These checks verify specific behavior, not universal platform reliability or legal compliance.

| Layer | Result | Actual scope |
|---|---|---|
| Node | **201 passed**, zero failed/skipped | Five adapters/exact strings, later assignments/conflicts, bounded selection, crop geometry, context, case/SOC model, five-recents migration/restore, history locks, privacy and package gate. |
| Rendered workflows | **110 unique groups passed** | Capture 21, toolbar 27, case/privacy 19, stabilization 10, case clipboard 7, shared workspace 9, image tools 17. Real DOM/canvas/clipboard/IndexedDB; extension API doubles. |
| Pixel-selection pipeline | **11 groups passed** | Visible/scrolling markers at five simulated DPR values, cancellation/restoration. Browser screenshots are provided by Playwright, not captureVisibleTab. Native zoom/DPI remains untested. |
| Worker | **10 passed** | Actual Chromium ServiceWorkerGlobalScope and lifecycle; controlled Chrome APIs. |
| Isolated profile reader | **5 passed** | Actual isolated-world DOM/fetch; intercepted fictional network. Small result, source fallback and account binding. |
| Repeat at 2× | **17 image-tool groups passed** | Repeated evidence, not 17 additional unique scenarios. |
| Native installed extension | **Blocked**, exit 2, zero groups | Administrator policy blocks unpacked extensions. No bypass or sandbox change. |
| Live platform | **Not run for 1.8.13** | Earlier anonymous Instagram observation is historical; it does not validate signed-in Edge. |
| Visual inspection | Actual generated screenshots inspected | Current-profile popup (including visible Select area), simple case creation, Case/SOC history, crop handles and the unsupported-page toolbar. Fictional content only. |

The pixel fixture uses unique colors at four corners, four edge midpoints and center. Coordinates/dimensions are checked through real selection/crop/stitching. Its five simulated device scales (0.8/1/1.25/1.5/2) are not substitutes for Edge native 80/100/125/150/200% zoom or Windows DPI. See versioned scenario JSON for the exact exercised pipeline. Real Chrome/Edge API invocation, installed toolbar/side panel, activeTab grant, OS application paste/save/print, native zoom and live signed-in platforms remain separate gates.

## Reproduce

From `/workspace/Gather/gather` with Node 24, Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151:

```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
node tests/browser-selection-pixels.mjs
node tests/browser-worker.mjs
node tests/browser-profile-reader.mjs
node tests/browser-acceptance.mjs
python3 scripts/package.py
```

No runtime installation, server or bundler. Test scripts own and close fixture servers/profiles. `GATHER_BROWSER_ARTIFACTS` chooses ignored output; `GATHER_CHROMIUM_PATH` selects an available permitted browser. Keep `chromiumSandbox:true`. Do not edit runtime/tests while their suites execute. Capture exit codes and verify current result files; partial/zero-test runs are not passes.

Native runner status: exit 2 = blocked, 1 = failure, 0 = completed installed smoke journey. This machine has `/etc/chromium/policies/managed/extensions.json`, `ExtensionInstallBlocklist:["*"]`. It is a runner restriction, not a diagnosed problem with the user's Edge installation. See [local acceptance](LOCAL-ACCEPTANCE.md) and [R4 status](R4-WORKFLOW-RECONCILIATION.md).

Versioned scenario records are in [evidence/1.8.13](evidence/1.8.13/README.md). Release receipts outside the source package record extracted-package byte/test checks, SHA-256 and public download verification. Packaging locally scans candidate files/archives for common private-file and credential patterns; this is not general PII detection and uploads nothing to a scanner. Original 1.8.12 artifacts and evidence remain immutable.
