# Gather 1.8.5 validation

Only deterministic fictional data. The preserved 1.8.4 baseline passed all 123 Node checks before edits. Current evidence is in `evidence/1.8.5`; older packages/evidence remain preserved.

| Layer | Result | Practical scope |
| --- | --- | --- |
| Node | 129 passed, zero failed/skipped | Models/adapters, exact IDs, filing/privacy/authorization, geometry/scale, history scope/grouping, deletion guards, syntax/static imports. |
| Rendered capture/UX | 21 groups passed | Real DOM/canvas/IndexedDB; controlled Chrome API doubles. |
| Rendered toolbar/capture/lookup | 22 groups passed | Actual toolbar/controller/history, pointer/keyboard selection, real image/text clipboard, output formats, recovery and deletion. Chrome APIs are doubles. |
| Rendered case/privacy | 18 groups passed | Actual intake, associations, privacy controls, delayed writes and backup flows; Chrome APIs are doubles. |
| Actual Chromium worker | 10 groups passed | Real ServiceWorkerGlobalScope, IndexedDB/Web Locks and stop/restart, including window-removed event routing. Chrome APIs are doubles. |
| Native installed Chrome/Edge | Unaccepted | Recorded administrator denial; current policy still blocks extensions. No bypass or repeated identical attempt. |
| Live platforms / native FireShot | Not run | No current profile success rate or native FireShot comparison claimed. |

The new capture journey uses Northbridge / SEO 6 / Alex Example and Southridge / SD 73. On-page drag/release saves immediately; native canvas verifies cropped dimensions/pixels and absence of the selector overlay. A default switch during selection preserves Northbridge/Alex. Real PNG image clipboard readback verifies the crop and subsequent flattened redaction; original SHA-256 stays unchanged. Clipboard denial retains the image and explicit Retry succeeds. PNG/JPEG output bytes/dimensions are decoded, with saveAs/uniquify/safe basename assertions; native save-dialog behavior is not established by these doubles.

The actual print document renders the selected redacted pixels and optional caption outside the image. Native print/PDF dialog and printer pagination remain unaccepted. Escape, controller close and browser-provided source activation changes remove the selector. Keyboard-only coordinates and Enter save the expected rectangle. A worker-owned window-close event ignores unrelated windows and clears lock/seed from frozen source context. Full-page restoration, sticky-header overlap, partial/missing assets, hash checks and original tile retention remain covered by existing journeys.

History starts with saved images and groups exact case/scan IDs. Its filters/search/reload do not change active filing. Cancelled attempts remain accessible explicitly. Deletion Cancel preserves data; stale snapshots reject; filter changes clear selection. Confirmed selected deletion atomically removes all associated assets and preserves other cases/subjects. Late failure writes cannot recreate it. Validated binary backup retains on-page geometry and original/redacted bytes; deliberate restore verifies hashes, remaps a conflicting subject link and clears the deletion tombstone. Existing full backup journeys exercise the real worker restore/journal and restoration into a separate empty browser origin.

Existing checks retain same-name subjects/path collisions, rename history, denied folder export/retry, exact scan reports, local/ephemeral privacy retention, source-context provenance, current-page lookup recovery and the long fictional ID `9007199254740993123`. Four workspace views, 400 px layouts, focus restoration and CSS 200% reflow remain covered. CSS zoom is not native browser zoom.

Visual inspection opened actual generated fictional screenshots of the selector, direct toolbar, saved capture, all-case history and narrow history. It led to compact image actions, saved-first history and a single optional filter panel. These are rendered product documents with API doubles, not native extension screenshots.

## Reproduce

From `gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Node 24.19.0, Python 3.12.14, Playwright 1.62.1 and sandboxed Chromium 151 at `/usr/lib/chromium/chromium` were used. No runtime install, server or bundler is required. Harnesses start/close their own fixture servers and profiles. `GATHER_CHROMIUM_PATH` selects a browser; `GATHER_BROWSER_ARTIFACTS` selects output. Keep `chromiumSandbox:true`.

Packaging verifies ZIP CRC, extension source-byte hashes, matching manifest/package versions and entry points. Versioned SHA-256 lists accompany both packages; previous 1.8.4 checksums remain unchanged. Native activeTab grants, actual screenshot API/rate, focus, save/clipboard/print permission UI, browser-session reset and Edge integration require the permitted-browser checklist in LOCAL-ACCEPTANCE. Nested scrolling and custom roots remain unshipped.
