# Gather 1.8.13

Gather is a local browser extension for account lookup, screenshots and deliberate research. **Open a profile → Gather → inspect or copy.** A case is optional. Edge on Windows is the primary target; Chromium-based Chrome is also supported.

## What changed

- Opening the toolbar on a supported profile starts its current-page lookup. A staged pasted draft is preserved instead of replaced. Results show the display name, username, URL and exact string ID. Retry stays available; automatic ID copy always copies IDs, independently of the manual format.
- One **Select area** button captures immediately on release. Dotted guides span the viewport; scrolling extends the selection. The smaller lower-right helper disappears during dragging, and its descriptive text no longer intercepts selection starts. Screenshot auto-copy remains a separate remembered preference.
- Selection now rejects a bitmap that cannot contain the requested width, instead of silently clipping it. The parser reads every recognized data assignment in a script, including later matching accounts and conflicting IDs. These are confirmed fixes; the originally reported signed-in Edge failures still need native reproduction.
- **Edit image → Crop** has eight edge/corner handles, dimmed excluded pixels, keyboard adjustment and Reset / Cancel / Apply. Red arrows, circles and manual black redactions remain. Originals are preserved.
- **New case** asks for a non-identifying case label and SOCs. One internal scan is created automatically. New cases do not create intake/search plans or coverage records. Existing legacy cases remain compatible. Same-named SOCs keep separate stable IDs.
- Capture history has **All captures**, **Unassigned** and SOC filters within the case. Filtering never changes where future captures are saved. Toolbar History opens its displayed case.
- **Recent lookups retains five batches**, including on startup and backup restore. Evicted contents and archived copies are removed; stale writers cannot recreate them. Deliberately saved findings stay. The popup now exposes a red clear-history action.

The compact blue/white popup keeps the primary screenshot button visible after a single profile result. Deep management stays in the four workspace views: Research, Captures, Case and Settings. No new browser permissions, runtime dependencies or cloud endpoint.

## Install or update

1. Extract `Gather-1.8.13-extension.zip` into a permanent directory.
2. Open `edge://extensions` (or `chrome://extensions`), enable Developer mode and choose **Load unpacked**. Select its **account-id-tool** directory containing `manifest.json`.
3. Pin Gather, open a supported profile and click Gather. Use Copy IDs, or choose the Case/SOC and Select area, Full page or Visible area. The side panel is optional.

**Updating:** finish captures and close Gather windows. Keep your existing installation folder and an optional private backup. Replace **all files at the same installed path**, then Reload on the Extensions page; confirm **1.8.13**. Do not uninstall or clear browser storage. Reload releases legacy ephemeral session values; durable findings/images remain. Updating trims unsaved recent lookup batches to the newest five.

**Rollback:** keep the immutable 1.8.12 package and a matching pre-update backup. Test them in a separate clean browser profile before changing your working profile. Earlier builds do not enforce all current fixes or history retention. Backup restore is deliberate; deletion without a backup cannot be undone.

## Local data and copying

Cases, SOCs, findings and image blobs stay in this browser on this computer. Gather has no case server, cloud sync or analytics. Source code is public by the user's choice; case data is separate. Web/image searches open the chosen service without saving query text or automatic search history in Gather. User-requested profile lookups contact the selected platform; explicitly enabled browser fallback remains supported. Reverse-image providers receive an image only when you choose/upload it on their site.

Settings → **Data & Privacy** has red case deletion and recent-history clearing controls. Capture history supports individual and selected-image deletion. These logically delete Gather records/blobs, including original/derivative images in the selected scope. Browser history, OS clipboard history, downloaded files and external-site records are separate. This is not forensic erasure.

Redaction is manual. Copy, Save image and ordinary image exports use the selected flattened derivative when one exists. Source captions are optional and do not alter originals. **Private `.gather` backups are unencrypted and include originals**, which may show more than a selected crop or redacted export. Anyone with the backup can read it. Auto-copy is optional; Gather does not inspect or automatically hide names in pixels.

## Capabilities and limits

Five extractors: Instagram, Facebook, Threads, TikTok and YouTube. X is search-only. IDs remain exact strings. Login, network, conflicting-ID and missing-markup failures stay uncertain; no identity or threat inference. Current-profile reads use packaged isolated-world parsing and return small structured results. Public fetches omit credentials; same-page source reads use the page's normal session. [Hardening details](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/HARDENING-REVIEW-1.8.12.md).

Filing freezes at capture start. Global case switches cannot redirect it. Only browser-provided relationships carry tab context; names, timing and similar URLs never establish related tabs. Renames preserve record IDs. Case and SOC labels stay local; SOC has no assumed expansion.

Visible, selected and bounded full-page captures retain original PNGs/tiles in IndexedDB, geometry, source, timestamps/timezone, status and SHA-256 integrity hashes. A hash does not establish authenticity. Limits: 4 MiB workspace JSON, 512 MiB image storage, 192 MiB/capture, 64 MiB/asset; browser quotas can be lower. Full page is bounded to 24 tiles, 48 million pixels, 24,000 CSS pixels and 60 seconds. Dynamic feeds, sticky elements and lazy loading can produce partial images or seams; limitations are recorded. Scroll and temporary changes are restored on completion/cancellation.

Downloads-relative folder export is optional. **Saved in Gather** and **Exported to folder** are separate; failed export retains the image and offers Retry. This API does not write arbitrary absolute paths. PNG/JPEG Save image and selected-image Print / Save PDF remain; native dialogs/pagination require local browser checks. Nested scrolling, pinch zoom and custom roots are not supported. Source-image acquisition and the local Reference Library remain unshipped, behind R4's native correctness gate.

## Verification and development

**201 Node tests; 110 rendered workflow groups; 11 pixel-selection groups; 10 actual service-worker groups; five isolated-world parser groups passed.** Seventeen image-tool groups also passed at 2× scale and are not counted twice. Browser workflows use real DOM/canvas/clipboard/IndexedDB with controlled extension APIs. The marker suite tests all corners/edges/center at simulated DPR 0.8, 1, 1.25, 1.5 and 2. This is not native Windows scaling or browser zoom.

This cloud machine's administrator blocks unpacked extensions. The installed-extension runner exits **2 / blocked**, zero native groups. No policy, sandbox or TLS settings were weakened. Native Edge invocation, signed-in Instagram, Windows zoom and OS paste/save/print remain unverified; no new live-platform check occurred. [Evidence and commands](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/TESTING.md) · [Local check](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/LOCAL-ACCEPTANCE.md) · [R4 status and priorities](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/R4-WORKFLOW-RECONCILIATION.md).

Runtime source is `account-id-tool`. There is no runtime install, bundler or server. From this directory run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Browser tests use the prepared Playwright/Chromium environment documented in TESTING. Generated `profile-reader.js` must match local adapter modules (`python3 scripts/build-profile-reader.py --check`). Packages reject common private files/credential patterns using a local scanner; this does not certify the absence of every sensitive datum.
