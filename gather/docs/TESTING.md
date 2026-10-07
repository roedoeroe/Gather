# Gather 1.8.6 validation

This finalizing run adds fixes and regression coverage, not product features. All fixtures are deterministic fictional data. The untouched 1.8.5 baseline passed 129 Node checks, 61 rendered-browser groups and 10 worker groups before edits; both preserved ZIPs passed CRC, source-byte and checksum verification.

| Layer | Result | Scope |
| --- | --- | --- |
| Node | 130 passed, zero failed/skipped | Models/adapters, exact IDs, continuity/privacy, geometry, history/deletion, startup race, syntax and static worker imports. |
| Rendered capture/UX | 21 groups passed | Actual DOM/canvas/IndexedDB, stitching, cancellation/restoration, hashes, backup and responsive layouts. Chrome APIs are doubles. |
| Rendered toolbar/capture/lookup | 22 groups passed | Actual controller, pointer/keyboard selection, real image/text clipboard, save formats, print pixels, history/deletion and current-page lookup. Chrome APIs are doubles. |
| Rendered case/privacy | 18 groups passed | Actual intake, associations, retention, delayed writes, scoped deletion and restore. Chrome APIs are doubles. |
| Rendered stabilization | 10 groups passed | Cross-window/output/interruption regressions below. Real IDB/canvas/BroadcastChannel; controlled downloads/clipboard failure gates. |
| Actual Chromium worker | 10 groups passed | ServiceWorkerGlobalScope, IndexedDB/Web Locks and actual stop/restart. Extension APIs are doubles. |
| Native installed Chrome/Edge | Unaccepted | Administrator policy still blocks unpacked loading. No bypass or identical launch retry. |
| Live platforms / native FireShot | Not run | No live success rate or native FireShot acceptance claimed. |

Release totals: **130 Node, 71 rendered-browser groups and 10 actual worker groups**. Packaged-build verification is recorded separately in the evidence; reruns do not increase these counts.

## New defect regressions

The early-finish Node test failed against 1.8.5: finish arrived before windows.create resolved, leaving a lock for a finished controller. The corrected queued release passes and permits another capture while the first completion window remains open.

Nine browser scenarios failed against the preserved, extracted 1.8.5 extension. The tenth reproduced restore of an in-flight export before its specific fix. Their passing counterparts verify:

1. An open print preview clears pixels/disables Print after redaction or deletion; reopening renders the selected image.
2. Two documents cannot own one folder export; rejection preserves the first running/successful attempt.
3. A healthy two-file export is not expired at 150 seconds; edits wait for it, then work and reset folder state.
4. Case purge rejects an active export atomically, preserving records and bytes.
5. A stale editor cannot overwrite a newer redaction; repeated current-editor saves work.
6. Interrupted old work cannot overwrite a successful retry or dispatch its companion record afterward.
7. A validated binary backup made during export restores hashes/relationships, makes the orphaned job retryable, and permits immediate export. Another restore remaps its exported asset reference.
8. Clipboard PNG conversion rejects stale bytes if the selected image changes during encoding. This failure gate uses a clipboard double; ordinary toolbar clipboard readback is real.
9. A simulated transient IndexedDB preview-read error after durable save releases the lock, retains the image and recovers on focus.
10. Delayed clipboard denial after deletion leaves the preview empty, image actions disabled and deletion message visible.

Existing Northbridge / SEO 6 / Alex Example → delayed capture → Southridge / SD 73 journeys preserve original filing. Other checks retain long exact IDs, same-name subject folders, rename history, denied export/retry, full-page cancellation/restoration, original/derivative hashes, selected-scan reports, corrupt-backup rejection and empty-origin restore. Privacy checks cover typed-name deletion, Cancel, failed-backup preservation, history clearing across windows, late writes and worker restart.

Tests exercise actual product documents and browser storage/canvas/clipboard. Native activeTab grants, captureVisibleTab/rate/focus, save/print dialogs, browser zoom/reset and Edge require [LOCAL-ACCEPTANCE](LOCAL-ACCEPTANCE.md) on an allowed installation. CSS 200% reflow is not native zoom. Current managed policy has ExtensionInstallBlocklist ["*"]; security settings remain intact.

## Reproduce

From `gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
python3 scripts/package.py
```

Node 24.19.0, Python 3.12.14, supplied Playwright 1.62.1 and sandboxed Chromium 151 at `/usr/lib/chromium/chromium` were used. No extension runtime install, bundler or application server is needed. Harnesses own and close temporary servers/profiles. Keep chromiumSandbox:true. GATHER_CHROMIUM_PATH selects a browser and GATHER_BROWSER_ARTIFACTS selects output. The stabilization harness accepts GATHER_EXTENSION_ROOT to serve an extracted package; its optional GATHER_STABILIZATION_FILTER cannot silently execute zero scenarios.

A toolbar assertion once inspected history during a second asynchronous rerender. It now waits for both expected groups before asserting; fresh source and extracted-package runs pass. Browser harnesses remove any prior results.json before running, so a failed command cannot leave a stale success report. The diagnostic failure is retained separately.

Current logs/results/fictional screenshots are in `evidence/1.8.6`; prior evidence is preserved. Packaging verifies CRC, every runtime byte against SHA256.json, versions, entry points and archive paths. Installation/update/rollback are in README and the separate delivery receipt. Backup/workspace schemas stay compatible. No permission, dependency, network service or passive collection was added.
