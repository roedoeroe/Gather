# Gather 1.8.15 RC validation

Validation date: October 8, 2026, America/Los_Angeles (some artifacts are October 9 UTC). Public fixtures and screenshots are fictional. No signed-in session was supplied.

| Layer | Result | Scope |
|---|---|---|
| Node | **214 passed**, zero failed/skipped | Five adapters, exact IDs, six new readiness cases, navigation/conflict/cancel, context, storage/restore, privacy and package gate. |
| Rendered workflows | **116 unique groups passed** | Toolbar 29, capture 21, case 19, stabilization 10, case clipboard 7, shared workspace 9, image tools 17, Help 4. Real DOM/canvas/clipboard/IndexedDB; extension API doubles. |
| Image tools repeat | **17 passed at 2× DPR** | Repetition of the same image groups, not 17 new unique scenarios. |
| Pixel selection | **11 passed** | Marker pixels across visible/scrolling selections and five simulated DPR scales. Acquisition adapter, not native screenshot API. |
| Worker | **10 passed** | Actual ServiceWorkerGlobalScope with controlled Chrome APIs; restart, restore and deletion. |
| Profile reader | **5 passed** | Actual isolated world, fictional intercepted pages/source, minimal returned data. |
| Installed Linux Edge workspace | **10 passed** | Real extension worker/storage, case/findings/tasks, query-free launches, report download/reload, 400px layout. |
| Installed Linux Edge capture/lookup/editor/Help | **23 passed** | Real OS toolbar action, activeTab, captureVisibleTab, binary storage, clipboard; all three modes, scrolling, cancel/repeat; editor/original hash; Help. |
| Installed Linux Edge update | **3 passed** | Same directory/profile update 1.8.14 → 1.8.15 preserves extension ID, case/scan/SOC, image and original hash. |
| Live signed-out Edge | **First operation passed, 271 ms lookup** | One originally chat-authorized public Instagram profile; HTTP 200. Real installed extension. No actual ID, URL, source, cookies or private imagery in public evidence. |
| Visual review | **Performed** | Native popup/editor/Help, rendered side panel, desktop/narrow workspace, history, Case and Settings; inspected filenames in evidence README. |

Counts are per layer, not interchangeable. Native total is **36 groups** (23 + 10 + 3). Help's four rendered groups are included in 116; its native check is included in 23. Repeated extracted-package suites do not inflate unique totals.

## Native findings and limits

The repeated-window failure was a harness error: action-created native windows were not always listed by Playwright; selecting an old closing CDP target could inspect the wrong capture. The harness now follows only newly created target IDs, waits for the controller, and detaches closed sessions. No capture production change. Nine successive capture actions generated nine distinct records (three cancellations); after cancellation, a new visible capture succeeded with no remaining capture tab or session lock.

Readiness timings in the final native workflow run: already loaded **109 ms**; metadata arriving at 650 ms **810 ms**; at 1450 ms **1581 ms**; existing source fallback after the readiness deadline **2074 ms**. These are observations, not response-time guarantees or network timeouts. The two-second limit applies to readiness, not the existing source/network fallback.

Native Linux Edge 155.0.4283.45 ran with its sandbox enabled. Microsoft package signature and hashes were verified; matching WebDriver was installed/version-checked, but Playwright/CDP drives the tests. A normal shortcut assigned in Edge's own extension settings and real OS input invoked the toolbar action. No API permission override, unsafe extension-debugging flag, TLS bypass or policy edit. Chromium's separate managed installation restriction remains intact.

Unverified: signed-in Windows platform behavior, native Windows/browser zoom and display scaling, native side-panel opening, OS image Save/Print dialogs and clipboard-manager integration. Native tests read/write the browser clipboard; they do not validate pasting into every destination application. Full-page feeds can change, hit bounds or report partial status. No universal website/layout guarantee.

Provider landing checks did not upload images. Google, TinEye, Yandex, Baidu and Sogou returned 200. Bing redirected to Microsoft Explore in this environment; Lenso and Shutterstock returned 403. Those region/access-dependent outcomes are recorded, not counted as successful reverse-image submissions or proof that providers are globally unavailable. Launchers remain unchanged.

## Reproduce

From `/workspace/Gather/gather`, with Node 24, Python 3 and supplied Playwright 1.62.1:

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
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
node tests/browser-selection-pixels.mjs
node tests/browser-worker.mjs
node tests/browser-profile-reader.mjs
node tests/browser-help.mjs
```

`GATHER_BROWSER_ARTIFACTS` selects ignored output. Scripts own/close temporary servers and profiles. Do not edit runtime/tests while suites execute. Native commands and the display restart procedure are in [ENVIRONMENT-SETUP](ENVIRONMENT-SETUP.md). Live diagnostics remain private and require a legitimate authorized target; repeatable tests use fictional fixtures only.

Package with `python3 scripts/package.py --out /workspace/Gather/releases/1.8.15` only when that immutable release directory does not already exist. Package receipts and extracted-runtime results live in releases/1.8.15. The scanner does not certify the absence of every sensitive datum.

[Scenario evidence](evidence/1.8.15/README.md) · [Release report](RELEASE-CANDIDATE-1.8.15.md) · [R4 status](R4-WORKFLOW-RECONCILIATION.md).
