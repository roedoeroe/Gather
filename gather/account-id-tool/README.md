# Gather 1.8.15 RC

Gather is a local browser extension for account lookup, screenshots and deliberate research. **Open a profile → Gather → inspect or copy.** A case is optional. Edge on Windows is the primary target; Chromium-based Chrome is also supported.

## What changed

- Instagram gets a conditional **two-second readiness buffer** when its profile metadata is still arriving. Gather reads immediately, checks missing metadata every 250 ms until the deadline, then uses the existing source/public fallback. Already-loaded profiles return immediately. One lookup operation; no second click required for the tested delayed-page scenarios.
- Loading tabs remain usable when their explicit URL identifies the intended profile. Pinned-document, account-conflict, pending-navigation and cancellation guards preserve exact string IDs. The extractor itself is unchanged.
- **Help** is available from the popup, side panel, workspace and full account tools. It has local, focused search and plain-language guidance. A [Coworker Quick Start](COWORKER-QUICK-START.md) ships with the extension.

Case/SOC and **Select area · Full page · Visible area** remain in the popup's fixed bottom area. Selection guides/scrolling capture, Crop handles, red arrows/circles, manual redaction, five recent batches, local cases/history and binary backups are retained. No new permissions, runtime dependency, storage schema, retention policy or cloud endpoint.

## Install or update

1. Extract `Gather-1.8.15-extension.zip` into a permanent directory.
2. Open `edge://extensions` (or `chrome://extensions`), enable Developer mode and choose **Load unpacked**. Select its **account-id-tool** directory containing `manifest.json`.
3. Pin Gather, open a supported profile and click Gather. Use Copy IDs, or choose the Case/SOC and Select area, Full page or Visible area. The side panel is optional.

**Updating:** finish captures and close Gather windows. Keep your existing installation folder and an optional private backup. Replace **all files at the same installed path**, then Reload on the Extensions page; confirm **1.8.15**. Do not uninstall or clear browser storage. Reload releases legacy ephemeral session values; durable findings/images remain. Updating trims unsaved recent lookup batches to the newest five.

**Rollback:** keep the immutable 1.8.14 package and a matching pre-update backup. Test them in a separate clean browser profile before changing your working profile. Earlier builds do not enforce all current fixes or history retention. Backup restore is deliberate; deletion without a backup cannot be undone.

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

**214 Node tests; 116 rendered workflow groups; 11 pixel-selection groups; 10 worker groups; five isolated-world reader groups passed.** Rendered tests use real DOM/canvas/clipboard/IndexedDB with extension API doubles. The 17 image-tool groups also passed at 2× simulated DPR; pixel checks cover five simulated scales, not native Windows zoom.

**Actual installed Linux Edge passed 36 groups:** 23 lookup/toolbar/capture/editor/Help, 10 workspace, three same-folder update. Real toolbar invocation, activeTab, screenshot acquisition, scrolling selection, cancellation, clipboard, editing and 1.8.14 → 1.8.15 data preservation were exercised. A live signed-out lookup of the original chat-authorized profile returned an exact ID on its first operation in **271 ms**, with no account details published.

Signed-in Windows Edge, native zoom/Windows scaling, native side-panel opening and OS image-save/print dialogs remain unverified. This is a **controlled coworker pilot release candidate**, not a universal reliability guarantee. [Detailed results](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/TESTING.md) · [Release scope and limitations](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/RELEASE-CANDIDATE-1.8.15.md) · [R4 status](https://github.com/roedoeroe/Gather/blob/develop/1.8.0-r3/gather/docs/R4-WORKFLOW-RECONCILIATION.md).

Runtime is `account-id-tool`, with no install, bundler or server. From this directory run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Browser setup is in TESTING and ENVIRONMENT-SETUP. Generated `profile-reader.js` must match local adapter modules (`python3 scripts/build-profile-reader.py --check`). The package privacy scanner checks common patterns; it is not general sensitive-data detection or legal certification.
