# Gather 1.8.6 — capture stabilization build

Gather is a browser extension for project-free account lookup, deliberate research and screenshot capture. Case data stays in the browser on your computer. Gather has no case server, cloud sync or analytics. The public GitHub repository contains source and fictional test data, not your cases. Searches and profile lookups contact the services you choose; exported files are separate local copies.

## Changes in 1.8.6

This is a fixes-only release of the existing capture workflow. No features, permissions, runtime dependencies or storage-schema migrations were added.

- Finished captures release the acquisition lock even when a controller finishes unusually early or its preview cannot load.
- An open print preview removes stale pixels after redaction/deletion. An older editor cannot replace a newer redaction. Copy rechecks the chosen image after PNG conversion.
- Folder export has one owner across Gather windows. Editing/deleting waits for that export; interrupted attempts cannot overwrite successful retries. Restored backups keep the image and make unfinished exports immediately retryable.
- Completion shows current folder-export state across windows. Deleting a capture keeps its image actions disabled even when a delayed copy/download finishes afterward.

**Select area & copy**, direct Full page / Visible area / Select area, PNG/JPEG saving, selected-image print/PDF, and history by case/scan remain. The side panel is optional. Originals, frozen filing, exact IDs, privacy controls and binary backups are preserved.

The four-view workspace remains **Research · Captures · Case · Settings**. Research keeps search/findings close together; Captures provides history and an image inspector; Case contains subjects/coverage; Settings starts with red deletion/history controls. A case remains optional for lookup and capture.

These controls delete data logically from Gather. They do not erase browser history, clipboard contents, downloaded backups/exports or external-site records, and do not promise forensic erasure. Unassigned lookup drafts cannot be attributed to a case; clear recent lookup history separately when needed. Restoring a backup deliberately brings back the records it contains.

The 1.8.1 fixes remain: static service-worker imports and stable 420 px popup sizing. No new permissions or data reset. Binary backup/workspace schema versions and the existing privacy generation marker remain compatible.

## Install or update

1. Extract `Gather-1.8.6-extension.zip` into a permanent directory.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select **account-id-tool** containing `manifest.json`.
3. Pin Gather. Open a supported profile → Gather → inspect/copy. Chrome 116+ or compatible Edge is required.

For an existing installation, preserve its folder and optionally back up work before updating. Finish captures and close Gather windows. Replace **all files in the same installed directory**, then Reload on the Extensions page and confirm **1.8.6**. Do not uninstall or clear browser storage. Extension reload/update clears Ephemeral Case session values; durable findings and images remain. If an older startup error prevents backup, preserve the browser profile/storage and update in place.

Rollback: retain the preserved 1.8.5 package and its matching pre-update backup. Keep the older source and its matching pre-update backup. Test the older release in a **separate clean browser profile**, restoring its matching backup. Retain the current profile until recovery is verified. Older versions do not enforce the new privacy-write guards; do not downgrade in place or let 1.7.x rewrite R3 records. Deletion without backup cannot be undone.

## Workflow and limits

Quick Lookup needs no case. Five account-ID extractors cover Instagram, Facebook, Threads, TikTok and YouTube; X is search-only. IDs remain exact strings. Login, markup/network failures and ambiguous results remain technical/unknown. Confirmed Gone detection is deliberately narrow and live-platform reliability is not established by fictional tests.

New case optionally reviews locally parsed intake before retention. **Ephemeral Case** keeps approved names and query values in session storage; durable roles/tokens, deliberately saved findings and screenshots remain. **Local Case** retains approved values until removal. Raw intake is released after confirmation/Cancel. Saved URLs, titles, notes and pixels can still contain names. No name-based identity merging or relationship inference occurs; associations are explicit analyst decisions.

Projects have scans and reusable subjects/roles (SOC is a configurable label, not an inferred expansion). Search launches bind context before navigation; browser-provided opener links carry related result context. Unknown relationships are not guessed. Save/Capture shows its destination, supports reassignment/detachment and freezes capture filing at invocation.

Visible, rectangle and bounded full-page capture store original PNGs/tiles in IndexedDB. Crops and opaque redactions are derivatives; share exports use the selected derivative without silently including originals. Captures retain source, timestamps/timezone, destination, geometry, completion/partial status and byte hashes. Hashes verify integrity, not authenticity or identity.

Downloads-relative folder export is optional. **Saved in Gather** and **Exported to folder** are separate; export failure retains the image and offers Retry. No arbitrary absolute/custom-root access is shipped. Save image uses the browser save dialog; JPEG conversion does not alter originals or mark folder export complete. For saved-byte hash sidecars, use folder export. Print preview is bounded to 40 image pages and 48 million pixels; native print/PDF pagination remains unverified. Private `.gather` backups include original/unredacted bytes and relationships and are not encrypted. Review-sheet exports contain selected images and a stable Evidence-ID crosswalk.

Limits: 4 MiB workspace JSON, 512 MiB capture storage, 192 MiB/capture, 64 MiB/asset; actual browser quotas may be lower. Full-page acquisition is bounded to 24 tiles, 48 million pixels, 24,000 CSS pixels and 60 seconds. Dynamic/infinite pages can be partial. Nested scrolling, pinch zoom and custom root folders remain unsupported. Original pixels may include more than the shareable crop.

## Validation and development

**130 Node tests, 71 rendered-browser groups (21 capture/UX, 22 toolbar/capture/lookup, 18 case/privacy, 10 stabilization), and 10 real Chromium service-worker groups passed.** Browser journeys use controlled Chrome API doubles and deterministic fictional data, with real DOM, IndexedDB and applicable canvas/Web Locks/worker lifecycle behavior. Native installed Chrome/Edge testing remains blocked by administrator policy in this runner; live platforms were not tested. See `docs/TESTING.md` and `docs/LOCAL-ACCEPTANCE.md`.

No runtime dependency install, server or bundler is required. From the development package root:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-toolbar.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
python3 scripts/package.py
```

Node 24, Python 3, Playwright 1.62.1 and sandboxed Chromium 151 were used. Packages, checksums, updated handoff and current evidence accompany this release. Earlier versions/checkpoints remain preserved. Source publication remains on `develop/1.8.0-r3`; main is unchanged.
