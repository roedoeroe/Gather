# Gather 1.8.3 validation

All fixtures are fictional. The preserved 1.8.2 baseline passed 118 Node tests before edits. Current evidence is in `evidence/1.8.3/`; historical evidence and notes remain unchanged.

| Layer | Result | Scope |
| --- | --- | --- |
| Node | 118 passed, 0 failed/skipped | Model, adapters, state, privacy/races, module syntax and static worker imports. |
| Rendered capture/UX journey | 21 scenario groups passed | Real DOM, canvas, IndexedDB; Chrome APIs are controlled doubles. |
| Rendered case/privacy journey | 18 scenario groups passed | Reviewed intake, associations, backup/restore, deletion and history clearing through real UI; Chrome API doubles. |
| Actual Chromium service worker | 9 scenario groups passed | Real ServiceWorkerGlobalScope, IndexedDB, Web Locks and stop/restart; Chrome API doubles. |
| Native installed Chrome/Edge | Blocked | Administrator disables unpacked extensions in this runner. |
| Live platforms | Not run | No current platform extraction success rate claimed. |

## New UI evidence

The capture journey tests empty Inbox at 1280×800 and 1440×900, findings above the fold, four stable keyboard tabs, a single visible panel, view restoration on reload, preserved query/filter text and cancelled case creation without writes. It creates a blank case and subject through the UI. It checks inspector open/close focus and unchanged review/inclusion, denied export with visible error, Retry retaining bytes, Settings access, Add → Note and review focus after a storage refresh. Capture scope changes keep the Captures view. Library collapses at 400px. CSS 200% zoom has no horizontal overflow; this is not native browser-zoom acceptance.

Fictional portrait, landscape, tall partial and missing-selected-derivative records exercise the gallery. Missing selected bytes produce an error and no substituted original. Intake edits invalidate reviewed fields and disable creation until re-reviewed. Existing coverage/association/exact string IDs, cancellation restoring page scroll/styles, binary backup/restore, collision-safe folders, history-clear races and deletion guards remain asserted.

Visual review opened actual generated images for empty Inbox, populated Research, gallery, inspector, Case, Settings, narrow workspace, panel and popup. Screenshots show rendered product documents with API doubles, not a natively installed extension. During validation, visual inspection found a panel refresh exception; the new panel assertion covers it. Add → Note uncovered a pre-existing textarea.type exception; it is fixed and covered by the actual creation flow.

## Run

From `gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Node 24, Python 3, Playwright 1.62.1 and sandboxed Chromium 151 were used. There is no runtime install, bundler or server. Playwright is supplied by the runner; otherwise install it into a development-only `.tools` prefix as described in `history/1.8.2-TESTING.md`. Use `GATHER_CHROMIUM_PATH` for an available browser and `GATHER_BROWSER_ARTIFACTS` for output. Keep `chromiumSandbox:true`; do not weaken browser security to evade the administrator blocker.

The harnesses create and close their own HTTP fixture servers and temporary profiles. Chrome API doubles do not validate activeTab permissions, native popup sizing, native side-panel invocation/window focus, downloads permission UI or live site markup. Complete `LOCAL-ACCEPTANCE.md` on an allowed Chrome/Edge installation. Full-page dynamic/infinite/nested scrolling and printer pagination retain documented limits.
