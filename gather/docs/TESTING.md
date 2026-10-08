# Gather 1.8.11 validation

All public fixtures use deterministic fictional data. Counts describe executed checks, not guarantees about arbitrary websites or installed Edge behavior.

| Layer | Fresh result | Scope |
| --- | --- | --- |
| Node | 178 passed, zero failed/skipped | Exact IDs, five adapter fixtures, account states, context continuity, capture geometry/storage/recovery, privacy and output guards. |
| Rendered interface | 105 unique groups passed | Capture 21, toolbar 24, case/privacy 18, stabilization 10, case clipboard 7, shared workspace UI 9, image tools 16. Chrome extension APIs are controlled doubles. |
| Worker | 10 actual ServiceWorkerGlobalScope groups passed | Real Chromium worker lifecycle with controlled Chrome APIs; static imports/restart/context behavior. |
| Higher device scale | 16 image-tool groups repeated at 2× | Repeated evidence, not extra unique groups. Native browser zoom is a separate check. |
| Visual inspection | Fictional screenshots inspected | Current-profile popup, desktop workspace and narrow editor. The layout check verifies the primary lookup action is above the actual popup clipping boundary. |
| Native extension | Blocked; zero groups passed | Preflight exits 2 before browser launch because administrator policy blocks unpacked extensions. No policy workaround. |
| Live platforms | One authorized anonymous Instagram source read succeeded | HTTP200, matched route, exact string ID. No raw source or real identifiers retained/published; signed-in Edge and other live platforms unverified. |

DOM, canvas, PNG pixels, clipboard, IndexedDB, BroadcastChannel and applicable locks/worker lifecycle are real in the rendered tests. Tabs, scripting, screenshot invocation and Downloads APIs are doubles. Ordinary browser confirmation/window closure is exercised; native extension invocation, OS clipboard paste/save/print, browser tab-close/reload prompts, actual zoom and screen readers remain unverified.

## Changed-behavior checks

[Release evidence](evidence/1.8.11/README.md) describes the current checks and their limits. Searches no longer create records or drafts; legacy query cleanup and backup import preserve deliberate evidence links. Reverse-image launch sends no image. Automatic current-document source fallback is covered with separate hydrated/source API doubles and real bounded-reader tests. Captures, privacy controls, editor state and recovery regressions remain.

A failing capture-history timing check exposed incremental list rendering. Publishing the complete replacement now avoids the visible gap; an observer assertion verifies it. Saved-search/draft expectations were updated because the user withdrew that behavior, not to hide runtime failures.

## Running the checks

From `/workspace/Gather/gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
python3 scripts/package.py
```

Node 24, Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151 were used. Browser scripts own and close their temporary servers/profiles. Use `GATHER_BROWSER_ARTIFACTS` for ignored output and `GATHER_CHROMIUM_PATH` for an available permitted browser. If module resolution needs it in this cloud, set `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`. No runtime install or bundler is required. Verify exit status and nonzero executed counts; an empty Node glob is not evidence.

`node tests/browser-acceptance.mjs` exits 2 for the managed policy block, 1 for failure, and 0 only after actual installed smoke checks. This machine has `/etc/chromium/policies/managed/extensions.json` with wildcard `ExtensionInstallBlocklist`. Keep it intact. [The installed-browser checklist](LOCAL-ACCEPTANCE.md) covers the remaining acceptance work.

Current evidence: [1.8.11](evidence/1.8.11/README.md). The release receipt records ZIP CRC, SHA-256, every runtime byte, unchanged permissions/storage versions and extracted-package gates. Package reruns do not increase unique counts. Historical evidence remains under `evidence/1.8.9`, `evidence/1.8.8` and prior versions.

The extracted development package passed 178 Node checks plus all 24 toolbar, 9 shared workspace and 16 image-tool groups. Final-package runtime bytes match those exercised in the extracted gate.
