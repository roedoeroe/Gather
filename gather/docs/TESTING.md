# Gather 1.8.4 validation

Fictional fixtures only. The preserved 1.8.3 baseline passed all 118 Node tests before edits. Current release evidence is in `evidence/1.8.4/`; prior evidence/packages remain unchanged.

| Layer | Result | Scope |
| --- | --- | --- |
| Node | 123 passed; 0 failed/skipped | Five adapters, exact IDs, models, filing/navigation guards, current-page failures, privacy/races, syntax and static worker imports. |
| Rendered capture/UX | 21 groups passed | Real DOM/canvas/IndexedDB; controlled Chrome API doubles. |
| Rendered toolbar/lookup | 11 groups passed | Actual popup buttons, controller, pointer selection, image viewer, deep link, clipboard and retry; controlled Chrome APIs. |
| Rendered case/privacy | 18 groups passed | Actual intake/coverage/association, backup, deletion/history controls; Chrome API doubles. |
| Actual Chromium service worker | 9 groups passed | Real ServiceWorkerGlobalScope, IndexedDB, Web Locks and stop/restart; Chrome API doubles. |
| Native installed Chrome/Edge | Not accepted | Recorded runner policy: “Loading of unpacked extensions is disabled by the administrator.” No repeated bypass attempt. |
| Live platforms | Not run | No current live profile success rate claimed. |

## New evidence

The toolbar journey opens Northbridge / SEO 6 with Alex Example, switches the default to Southridge / SD 73, then clicks Full page through the actual popup. The saved image/tiles remain in SEO 6/Alex. It opens that exact scan/capture through View in scan while another scan was previously active, verifies Fit width/ Fit image, explicitly reassigns/detaches the source tab, saves metadata to SD 73, and uses Visible area and pointer-drag Select area without opening the side panel. Denied scripting creates no image/controller; restricted URLs disable screenshot actions while pasted lookup remains usable.

Run on this page reads fictional profile markup and Copy IDs uses the actual clipboard API to preserve `9007199254740993123`. Live network is disabled in that journey. Missing hydration/captcha-library text stays technical; an actual Retry retains the batch, row, submitted input and originating destination after a default switch. Failed input remains editable rather than clearing. Observed sign-in text has specific guidance. A rendered height/viewport assertion prevents lookup rows being compressed out of view.

Node additions reject URL navigation before launch/write, retain explicit metadata filing despite later assignments, distinguish challenge libraries from observed access screens, and forbid silent fetched substitutes for explicit current-page reads. Worker router tests now include workspace URLs with query strings and section fragments.

Existing journeys retain assertions for source restoration on cancellation, sticky-header stitching, same-name folder collisions, subject rename, export denial/retry, opaque redaction/default-original exclusion, interrupted binary writes/journals, missing selected derivatives, backup corruption/remapped relationships, scan-specific reports, keyboard views/focus, narrow layouts and privacy deletion/late writes. CSS 200% zoom is a reflow check, not native browser zoom.

Visual inspection opened actual generated screenshots of the direct toolbar, saved full page, linked inspector and observed-login recovery. It found and corrected popup flex compression that hid result rows. The inspected images contain fictional data only and represent rendered product documents with API doubles. Representative frames of the user's recording and supplied screenshots were reviewed locally as design references; no recording audio transcription, private fixture publication or native FireShot test is claimed.

## Run

From `gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Node 24.19.0, Python 3.12.14, supplied Playwright 1.62.1 and sandboxed Chromium 151 were used. No runtime dependency installation, bundler or server is required. Harnesses own their fixture servers/profiles and close them. `GATHER_CHROMIUM_PATH` chooses an available browser; `GATHER_BROWSER_ARTIFACTS` chooses output. Keep `chromiumSandbox:true`. See the historical setup instructions if development-only Playwright is unavailable after restoration.

ZIP packaging verifies source-byte hashes, CRC, manifest/package version and required entry points. Versioned checksums accompany both packages. Previous 1.8.3 ZIP checksums are verified unchanged.

Chrome API doubles do not verify native activeTab grants, toolbar sizing/invocation, side-panel gesture, window focus, captureVisibleTab rate behavior, Downloads permission UI, browser-session reset or Edge integration. Complete `LOCAL-ACCEPTANCE.md` on a permitted browser. Full-page dynamic/infinite/nested scrolling, zoom and printer pagination retain their documented limitations. Reference Library is designed/backlogged, not shipped.
