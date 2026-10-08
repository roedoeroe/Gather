# Gather 1.8.14 validation

| Layer | Result | Scope |
|---|---|---|
| Node | **208 passed**, zero failed/skipped | Five adapters, exact strings, current-page/public fallback, conflict/navigation/cancellation guards, case/scan/context, image geometry, privacy/restore and package gate. |
| Rendered workflows | **112 unique groups passed** | Toolbar 29, capture 21, case 19, stabilization 10, case clipboard 7, shared workspace 9, image tools 17. Real DOM/canvas/clipboard/IndexedDB with extension API doubles. |
| Pixel selection | **11 passed** | Visible and scrolling selections with marker pixels, binary storage, clipboard, downloads and restoration at five simulated DPR scales. Acquisition adapter, not native captureVisibleTab. |
| Worker | **10 passed** | Actual ServiceWorkerGlobalScope, controlled Chrome APIs, restart/restore/deletion behavior. |
| Profile reader | **5 passed** | Actual isolated world, intercepted fictional page/source requests, minimal return data. |
| Live public profile | **Passed** | Signed-out Chromium read of the user-authorized profile; a controlled missing-markup/live-public-response resolver run succeeded on its first operation with one public request and matching ID. |
| Installed extension / signed-in Edge | **Not run; installation blocked** | The same managed wildcard policy forbids unpacked extensions here. No native acceptance claim, no bypass. |
| Visual inspection | **Performed** | Generated success/failure popup screenshots: primary lookup and all screenshot buttons visible with Case/SOC; fictional content only. |

The new live check uses a real public response with omitted credentials. It does not reproduce the user's authenticated session. Public evidence contains only counts/status/timing, not account details. The original native Edge acceptance gate remains open. A prior native runner reported blocked (exit 2, zero groups); that blocked run is not a pass or a newly executed 1.8.14 suite.

## Reproduce

From `/workspace/Gather/gather`, Node 24 / Python 3 / supplied Playwright 1.62.1 / sandboxed Chromium 151:

```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
node tests/browser-toolbar.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
node tests/browser-selection-pixels.mjs
node tests/browser-worker.mjs
node tests/browser-profile-reader.mjs
python3 scripts/package.py
```

`GATHER_BROWSER_ARTIFACTS` chooses ignored output. Test scripts own/close their temporary servers and profiles. Do not edit runtime/tests while suites execute. Live checks are deliberate, user-authorized diagnostics outside public source; automated fixtures never depend on live accounts.

No runtime install script, server or bundler. `node tests/browser-acceptance.mjs` diagnoses the managed block and exits 2 with zero native groups; use it only when checking a changed environment. Do not alter policy, sandbox or TLS. Native Edge invocation, activeTab, signed-in platforms, native zoom/Windows scaling and OS dialogs remain separate from rendered checks.

[Scenario evidence](evidence/1.8.14/README.md) · [Local checks](LOCAL-ACCEPTANCE.md) · [R4 status](R4-WORKFLOW-RECONCILIATION.md). Extracted-package and public-download receipts are under releases/1.8.14. Packaging/privacy checks are local pattern checks, not general PII detection or a compliance guarantee.
