# Gather 1.8.12 validation

All fixtures are fictional. Executed counts describe this build, not arbitrary-site reliability or a security guarantee.

| Layer | Result | Boundary |
|---|---|---|
| Node | 191 passed, zero failed/skipped | All five adapters/exact IDs, context, model, capture, privacy, strict messages, cookie omission, generated-parser parity and seeded package-gate rejections. |
| Rendered workflows | 105 unique groups passed | Capture 21, toolbar 24, case/privacy 18, stabilization 10, case clipboard 7, shared workspace 9, image tools 16. Real DOM/canvas/clipboard/IndexedDB; controlled Chrome APIs. |
| Worker | 10 passed | Real Chromium ServiceWorkerGlobalScope/lifecycle; controlled Chrome APIs. |
| Isolated page reader | 5 passed | Real Chromium isolated world/DOM/fetch, intercepted fictional network. Tests minimal return, name choice, same-origin source, login and ambiguity. |
| Native installed extension | Blocked, exit 2, zero groups | Administrator blocks unpacked extensions; no policy or sandbox bypass. |
| Live platforms | Not rerun for 1.8.12 | 1.8.11's single anonymous Instagram observation remains historical and does not establish signed-in Edge reliability. |
| Visual | Three screenshots inspected | Current-profile popup, settings/privacy and completed selection. Historical screenshot provenance checked, not every old pixel. |

From the gather directory:

```sh
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
node tests/browser-profile-reader.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
python3 scripts/package.py
```

Node 24, Python 3, supplied Playwright 1.62.1 and Chromium 151 with chromiumSandbox:true. If needed here, set NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules. GATHER_BROWSER_ARTIFACTS directs ignored outputs; GATHER_CHROMIUM_PATH selects an available permitted browser. No runtime install/server/bundler is required. Editing parser modules requires regeneration with `python3 scripts/build-profile-reader.py`; packaging rejects stale generated code. No runtime eval/import of website scripts.

`node tests/browser-acceptance.mjs` exits 2 for a policy block, 1 for failure, 0 for completed installed checks. Never count a blocked/zero-test run as passed. Do not edit runtime/tests while a suite is executing. Preserve exit codes and inspect current result files. [Privacy checks](PRIVACY-ACCEPTANCE.md), [hardening review](HARDENING-REVIEW-1.8.12.md) and [release evidence](evidence/1.8.12/README.md) describe practical limits. Extracted-package/2× results are appended after those gates complete.

All 16 image-tool groups also passed at 2× device scale; repeat evidence, not additional unique scenarios.

Extracted development-package gate passed 191 Node tests, 24 toolbar groups, 10 real worker groups and 5 real isolated-world groups. Final runtime bytes are compared against that tested extraction in the package receipt; documentation/evidence updates do not change those runtime bytes.
