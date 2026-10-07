# Gather 1.8.1 validation

This is the corrective release for the user's installed-browser screenshot: a collapsed popup and `import() is disallowed on ServiceWorkerGlobalScope`. All test data is fictional. The supplied screenshot was inspected for UI/error diagnosis; the depicted account was not queried or added to test fixtures.

| Layer | Result | What was exercised |
| --- | --- | --- |
| Node automated | **110 passed, 0 failed, 0 skipped** | Original model/adapter/state tests, every shipped JS module's syntax and a new transitive service-worker import guard. |
| Rendered capture journey | **19 scenario groups passed** | Actual DOM, canvas and IndexedDB, with Chrome API doubles; adds narrow-initial-viewport popup sizing regression. |
| Rendered R3 journey | **16 scenario groups passed** | Reviewed intake, roles, privacy, coverage, evidence sheets, backups and closure; Chrome API doubles. |
| Actual Chromium service-worker journey | **7 scenario groups passed** | Actual background module/router in ServiceWorkerGlobalScope, real IndexedDB/Web Locks and real worker stop/restart; Chrome API doubles. |
| Installed Chrome/Edge extension | **Blocked in this runner** | Administrator disables unpacked extension loading. The user's 1.8.0 screenshot is evidence of a failure, not a native pass for this correction. |
| Live platforms | **Not run** | No claim that a live Instagram or other platform account was extracted successfully. |

Current evidence: `evidence/1.8.1/`. Historical 1.8.0 evidence remains in `evidence/1.8.0/` and its testing notes in `history/1.8.0-TESTING.md`. Earlier baseline 66, continuity 76 and capture 94 checks remain preserved. Counts are separate: 110 Node tests, 35 rendered-browser groups and 7 real-worker groups; do not describe all 42 browser groups as native extension tests.

## Reproduction before correction

`browser-worker.mjs` was first run against unchanged 1.8.0. Its first routed workspace read failed with the exact Chromium exception visible in the user's screenshot. See `evidence/1.8.1/baseline-worker.txt`. This is an expected failed reproduction, not a green test run.

Previous page-based browser tests invoked store modules in a document, where dynamic import works. Node store tests did not supply IndexedDB, so startup binary recovery was skipped. Neither imposed ServiceWorkerGlobalScope's restriction. The new test executes the actual background entry point in a real module service worker rather than merely emulating a worker-shaped object.

## Worker regression coverage

1. Actual background message routing reads workspace state from popup, side-panel document, full tool and evidence page with real IndexedDB.
2. Project-free Quick Lookup completes through the real handler and Web Lock, retaining fictional ID `9007199254740993123` as a string. The source-page API is a controlled fixture; outbound platform network is disabled.
3. Case creation and queue/manual/reopened search execute in the worker. Ephemeral values resolve for launch but durable queries retain tokens.
4. Northbridge/role survives a Southridge global switch. Metadata save, capture launch/finish, negative coverage and explicit rejected association execute through actual handlers.
5. Private binary image backup validates and merge-imports through the worker, preserving bytes and remapped relationships.
6. DevTools stops the actual Chromium service worker. A new message starts another instance, replaying a pending metadata journal once and retaining images/session context through controlled storage APIs.
7. Guarded Close Case reaches binary purge and session/context cleanup while preserving another project and restored images.

The test's Chrome local/session storage doubles are backed by a separate test IndexedDB database so worker termination does not erase their state. This does not assert native Chrome session-storage lifecycle semantics or full browser-restart behavior. The capture launch windows and injected profile source are also doubles; screenshot permission and native window focus remain unverified.

## Rendered browser coverage and visual review

The retained capture journey covers search/result context, delayed selection while switching projects, duplicate subject names and rename history, full-page tile overlap, cancellation restoring actual page styles/scroll, opaque derivative pixels, denied Downloads/retry, backup/restore, corrupt/missing assets, transaction rollback, recovery journals and scan-isolated reporting. It now loads the actual popup from an initial **160 px viewport**, verifies its root/body request **420 px**, then verifies that width remains stable without horizontal overflow at 420 px.

The R3 journey covers reviewed intake minimization, ephemeral names/query drafts, stable role filing, no name-based automatic association, deliberate confirmation, exact-ID clipboard preview, Evidence IDs, explicit inclusion, derivative-only review-sheet export, rename, backup merge, simulated session loss, stale-close guards, denied-download retention and retry before scoped removal. It renders usable, unknown and gone account groups in the actual popup.

Final popup, panel and account-result screenshots were generated and visually inspected. They are rendered product documents, not screenshots of a natively installed toolbar/panel. The empty input's Get UserIDs button is intentionally disabled; the unsupported local HTTP fixture also leaves Run on this page disabled. Project-free worker lookup is tested separately with a controlled supported-profile source. Native toolbar auto-sizing still needs local acceptance even though the CSS feedback regression is covered.

## Commands

From the development package root:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Node 24, Python 3, Playwright 1.62.1 and Chromium 151 were used. No extension runtime install or bundler is needed. Browser tests require Playwright and sandbox-capable Chromium. If not supplied by a runner:

```sh
npm install --prefix .tools --no-save --package-lock=false playwright@1.62.1
NODE_PATH="$PWD/.tools/node_modules" GATHER_CHROMIUM_PATH=/path/to/chromium node tests/browser-worker.mjs
```

Apply the same variables to the other browser journeys. `GATHER_BROWSER_ARTIFACTS` selects an output directory. `GATHER_EXTENSION_ROOT` can point the worker regression at a preserved unpacked source; setting it to the 1.8.0 checkpoint reproduces the failed startup. These tests use temporary internal HTTP fixtures and isolated profiles; they do not replace the extension with a hosted app.

This runner requires approved execution outside the tool filesystem sandbox for Chromium's normal sandbox helper/namespaces. `chromiumSandbox:true` stays enabled. No `--no-sandbox`, TLS bypass or administrator-policy change was used.

## Remaining native acceptance

The recorded diagnostic remains: **“Loading of unpacked extensions is disabled by the administrator.”** It was not repeatedly retried. Use a permitted runner or the user's local Chrome/Edge. `browser-acceptance.mjs` is a starting harness, not a substitute for all native acceptance. Do not count a zero-worker launch as a pass.

Use `LOCAL-ACCEPTANCE.md` after updating to 1.8.1. Remaining areas include native toolbar size/focus, side-panel opening, selected-text context menu, activeTab grants/expiry, native captureVisibleTab and tab switches, OS Downloads/retry, actual browser restart, restore into another installed extension, print/PDF, zoom/DPI and full accessibility. Live platform adapter correctness requires separate evidence.
