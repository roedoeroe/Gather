# Gather 1.8.14

Gather is a local browser extension for account lookup, screenshots and deliberate research. **Open a profile → Gather → inspect or copy.** A case is optional. Edge on Windows is the primary target; Chromium-based Chrome is also supported.

## What changed

- An Instagram current-page lookup now checks the public profile automatically when the page and its session source omit the ID. This reuses the credential-free path that previously could succeed only after another click. One operation, one bounded fallback; no extra lookup batch or temporary tab.
- The original document is rechecked after that request. Navigation, conflicting IDs, security checks and cancellation cannot silently produce a result for another account. Exact IDs and existing fast successful reads are preserved.
- Current-page lookup/retry no longer focuses the collapsed paste box. Paste profile links stays closed unless you open it; explicit pasted drafts still take priority.
- Case/SOC and **Select area · Full page · Visible area** stay in a separate bottom area while lookup results scroll. Long errors and opened paste input cannot push these controls down the page. Screenshot auto-copy is under **Page options** and remains remembered.

The existing selection guides/scrolling capture, Crop handles, red arrows/circles, manual redaction, five recent batches, local cases/history and recoverable binary backups remain. No new permissions, runtime dependencies, storage schema or cloud endpoint.

## Install or update

1. Extract `Gather-1.8.14-extension.zip` into a permanent directory.
2. Open `edge://extensions` (or `chrome://extensions`), enable Developer mode and choose **Load unpacked**. Select its **account-id-tool** directory containing `manifest.json`.
3. Pin Gather, open a supported profile and click Gather. Use Copy IDs, or choose the Case/SOC and Select area, Full page or Visible area. The side panel is optional.

**Updating:** finish captures and close Gather windows. Keep your existing installation folder and an optional private backup. Replace **all files at the same installed path**, then Reload on the Extensions page; confirm **1.8.14**. Do not uninstall or clear browser storage. Reload releases legacy ephemeral session values; durable findings/images remain. Updating trims unsaved recent lookup batches to the newest five.

**Rollback:** keep the immutable 1.8.13 package and a matching pre-update backup. Test them in a separate clean browser profile before changing your working profile. Earlier builds do not enforce all current fixes or history retention. Backup restore is deliberate; deletion without a backup cannot be undone.

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

**208 Node tests; 112 rendered workflow groups; 11 pixel-selection groups; 10 actual service-worker groups; five isolated-world parser groups passed.** Browser workflows use real DOM/canvas/clipboard/IndexedDB with controlled extension APIs. Pixel checks use five simulated DPR scales, not native Windows/browser zoom.

A live signed-out Chromium read of the user-authorized profile succeeded. A controlled missing-markup test then used the actual resolver/isolated reader with its live public response: one request, first-operation success and matching ID. No actual account details were published.

This machine still blocks unpacked extension installation. Signed-in Windows Edge, native toolbar invocation/zoom and OS dialogs remain unverified. [Evidence and commands](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/TESTING.md) · [Local check](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/LOCAL-ACCEPTANCE.md) · [R4 status](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/R4-WORKFLOW-RECONCILIATION.md).

Runtime source is `account-id-tool`. There is no runtime install, bundler or server. From this directory run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Browser tests use the prepared Playwright/Chromium environment documented in TESTING. Generated `profile-reader.js` must match local adapter modules (`python3 scripts/build-profile-reader.py --check`). Packages reject common private files/credential patterns using a local scanner; this does not certify the absence of every sensitive datum.
