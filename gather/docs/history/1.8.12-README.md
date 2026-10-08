# Gather 1.8.12 — local workflow hardening

Gather is a browser extension for project-free account lookup, deliberate research and screenshot capture. Case data stays in the browser on your computer. Gather has no case server, cloud sync or analytics. The public GitHub repository contains source and fictional test data, not your cases. Searches and profile lookups contact the services you choose; exported files are separate local copies.

## Changes in 1.8.12

Profile lookup now parses inside an isolated page environment and returns small structured results. Anonymous profile requests omit cookies; explicitly enabled browser fallback remains available. Storage and messages have stricter boundaries, backups clearly say they are unencrypted, and packaging rejects common private files/credential patterns. Capture, editing, copy preferences, saved research and local deletion keep their existing workflows. No new permissions or cloud endpoint.

## Preserved from 1.8.11

- Web searches open a new tab without saving the query, a draft or a launch log. Related tabs keep only their filing context for the browser session.
- Reverse image search sits beside Search the web: Google Lens, Lenso.ai, Bing, Yandex, Baidu, Sogou, TinEye and Shutterstock. Choose/upload the image on the provider’s website; Gather uploads nothing automatically.
- Find IDs on this page reads the same authorized profile’s source automatically when rendered account data is missing. Instagram `profile_id` and Facebook `userVanity`/`userID` remain bound to the requested account; unrelated/conflicting IDs are rejected.
- Short gray examples in empty fields supplement persistent labels. They disappear as you type and never become saved values.
- Saved findings / Tasks / Changes clarifies what you deliberately keep. Capture history refreshes as one complete list, avoiding empty/partial flicker while thumbnails load.

Search privacy cleanup runs on update/first workspace use. Older automatic query text, search URLs, search activity and search drafts (including archived drafts) are removed from Gather. Query-free legacy reference IDs/timestamps remain so existing findings/captures and backups keep valid relationships. No new search records are created. Older backup imports receive the same cleanup. Deliberately saved case fields, search plans, account observations, tasks, findings and images are preserved. Browser/provider history, clipboard and previously exported files are separate and cannot be cleared by this update. Previously exported backups can still contain old search text.

No new permissions or runtime dependencies. Workspace/binary schema numbers remain unchanged; query-free legacy records are not compatible with every older validator. Roll back only in a separate profile with a matching pre-update backup.

## Capture and manual image tools retained from 1.8.9

- Select area shows dotted horizontal/vertical guides across the viewport. Drag and wheel-scroll, use PageDown/PageUp, or hold near a vertical edge to extend the rectangle. Release captures the selected document region. Escape restores your starting position and cancels. Only top-level scrolling is supported.
- Edit image adds pointer-drawn red arrows, red circles, opaque black redactions and cropping. Precise coordinates and Undo support keyboard use. Save & copy uses the flattened edited PNG. No automatic redaction, face/name detection or interpretation.
- Auto-copy screenshots is remembered in the popup and defaults on. Select area & copy explicitly copies even when the switch is off. The separate account-ID auto-copy switch keeps your existing preference. Denied clipboard access retains the image and offers explicit Copy retry.
- Blue actions and white/light neutral surfaces replace green presentation across popup, workspace, panel and image tools. Destructive controls stay red.
- Review sheets invalidate stale selected images/inclusion before print/export. Source details in single-image print preview are optional and off initially; original pixels are untouched.

Existing Instagram extraction, exact ID handling, scan continuity, binary recovery and privacy guards remain. No new permissions, dependency or storage schema. Chrome 116+ and Chromium-based Edge remain the target.

## Retained capture fixes

The earlier 1.8.8 capture-stability fixes remain part of this build.

- Finished captures release the acquisition lock even when a controller finishes unusually early or its preview cannot load.
- An open print preview removes stale pixels after redaction/deletion. An older editor cannot replace a newer redaction. Copy rechecks the chosen image after PNG conversion.
- Folder export has one owner across Gather windows. Editing/deleting waits for that export; interrupted attempts cannot overwrite successful retries. Restored backups keep the image and make unfinished exports immediately retryable.
- Completion shows current folder-export state across windows. Deleting a capture keeps its image actions disabled even when a delayed copy/download finishes afterward.

**Select area & copy**, direct Full page / Visible area / Select area, PNG/JPEG saving, selected-image print/PDF, and history by case/scan remain. The side panel is optional. Originals, frozen filing, exact IDs, privacy controls and binary backups are preserved.

The four-view workspace remains **Research · Captures · Case · Settings**. Research keeps search/findings close together; Captures provides history and an image inspector; Case contains subjects/coverage; Settings starts with red deletion/history controls. A case remains optional for lookup and capture.

These controls delete data logically from Gather. They do not erase browser history, clipboard contents, downloaded backups/exports or external-site records, and do not promise forensic erasure. Unassigned lookup drafts cannot be attributed to a case; clear recent lookup history separately when needed. Restoring a backup brings back deliberate findings/images; automatic search text/drafts are discarded on import.

The 1.8.1 fixes remain: static service-worker imports and stable 420 px popup sizing. No new permissions or data reset. Binary backup/workspace schema versions and the existing privacy generation marker remain compatible.

## Install or update

1. Extract `Gather-1.8.12-extension.zip` into a permanent directory.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select **account-id-tool** containing `manifest.json`.
3. Pin Gather. Open a supported profile → Gather → inspect/copy. Chrome 116+ or compatible Edge is required.

For an existing installation, preserve its folder and optionally back up work before updating. Finish captures and close Gather windows. Replace **all files in the same installed directory**, then Reload on the Extensions page and confirm **1.8.12**. Do not uninstall or clear browser storage. Extension reload/update clears Ephemeral Case session values; durable findings and images remain. If an older startup error prevents backup, preserve the browser profile/storage and update in place.

Rollback: retain the preserved 1.8.10 package and its matching pre-update backup. Test the older release in a **separate clean browser profile**, restoring its matching backup. Retain the current profile until recovery is verified. Older versions do not enforce all current clipboard and privacy guards; do not downgrade in place or let 1.7.x rewrite R3 records. Deletion without backup cannot be undone.

## Workflow and limits

Quick Lookup needs no case. Five account-ID extractors cover Instagram, Facebook, Threads, TikTok and YouTube; X is search-only. IDs remain exact strings. Login, markup/network failures and ambiguous results remain technical/unknown. Confirmed Gone detection is deliberately narrow and live-platform reliability is not established by fictional tests.

New case optionally reviews locally parsed intake before retention. **Ephemeral Case** keeps approved intake values in session storage; durable roles/tokens, deliberately saved findings and screenshots remain. **Local Case** retains approved values until removal. Raw intake is released after confirmation/Cancel. Saved URLs, titles, notes and pixels can still contain names. No name-based identity merging or relationship inference occurs; associations are explicit analyst decisions.

Projects have scans and reusable subjects/roles (SOC is a configurable label, not an inferred expansion). Search launches bind context before navigation; browser-provided opener links carry related result context. Unknown relationships are not guessed. Save/Capture shows its destination, supports reassignment/detachment and freezes capture filing at invocation.

Visible, rectangle and bounded full-page capture store original PNGs/tiles in IndexedDB. Crops and opaque redactions are derivatives; share exports use the selected derivative without silently including originals. Captures retain source, timestamps/timezone, destination, geometry, completion/partial status and byte hashes. Hashes verify integrity, not authenticity or identity.

Downloads-relative folder export is optional. **Saved in Gather** and **Exported to folder** are separate; export failure retains the image and offers Retry. No arbitrary absolute/custom-root access is shipped. Save image uses the browser save dialog; JPEG conversion does not alter originals or mark folder export complete. For saved-byte hash sidecars, use folder export. Print preview is bounded to 40 image pages and 48 million pixels; native print/PDF pagination remains unverified. Private `.gather` backups include original/unredacted bytes and relationships and are not encrypted. Review-sheet exports contain selected images and a stable Evidence-ID crosswalk.

Limits: 4 MiB workspace JSON, 512 MiB capture storage, 192 MiB/capture, 64 MiB/asset; actual browser quotas may be lower. Full-page acquisition is bounded to 24 tiles, 48 million pixels, 24,000 CSS pixels and 60 seconds. Dynamic/infinite pages can be partial. Nested scrolling, pinch zoom and custom root folders remain unsupported. Original pixels may include more than the shareable crop.

## Validation and development

From this directory:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
python3 scripts/package.py
```

**191 Node checks, 105 unique rendered groups and 10 actual Chromium worker groups passed**. Sixteen image-tool groups repeated at 2× device scale are not counted twice. Native extension APIs are doubles; canvas, PNG bytes, clipboard, IndexedDB and applicable worker lifecycle are real. One anonymous source read of the user-authorized Instagram profile returned HTTP 200 and an exact string ID using the matched profile-route parser. Raw live source/IDs were not retained or packaged. This does not test the installed Edge flow or other live adapters.

This cloud Chromium blocks unpacked extension installation by administrator policy. Native Edge screenshots, activeTab invocation, OS application paste/save/print, native zoom and screen readers remain unverified. No universal guarantee or legal compliance certification is implied. [TESTING](docs/TESTING.md) records scope; [LOCAL-ACCEPTANCE](docs/LOCAL-ACCEPTANCE.md) gives the remaining installed-browser steps.

Node 24, Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151 were used. Versioned packages, checksums and handoff accompany the release. Earlier packages remain immutable. Source publication stays on `develop/1.8.0-r3`; main is unchanged. Quick Parts and older retained goals remain in [PRODUCT-DIRECTION](docs/PRODUCT-DIRECTION.md) / [GOALS-AUDIT](docs/GOALS-AUDIT.md), not silently claimed shipped.

1.8.12 hardening: see [review](docs/HARDENING-REVIEW-1.8.12.md) for credential omission, in-page parsing, storage/message restrictions, package privacy gate and remaining limits.
