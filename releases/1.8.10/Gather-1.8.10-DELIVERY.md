# Gather 1.8.10 — everyday usability

[Extension ZIP](Gather-1.8.10-extension.zip) · [Source/test ZIP](Gather-1.8.10-development.zip) · [Checksums](Gather-1.8.10-SHA256SUMS.txt) · [Package verification](Gather-1.8.10-PACKAGE-VERIFICATION.json)

With a supported profile open, **Find IDs on this page** is now the main action, visible above optional pasted input and ready for keyboard activation. Pasted links take priority; opening Gather alone does not run a lookup. Findings/Tasks/Searches/Activity keep independent temporary filters, and new searches show their records without an old filter hiding them. The image editor protects unsaved marks/captions, stays closable when images are missing/deleted, and disables stale edits.

No new permissions, storage migration or runtime dependency. Scrolling selection, manual red arrows/circles/black redaction, original images, frozen filing, exact IDs, blue/white presentation, local case storage and red deletion controls remain. Main stays unchanged; development remains on `develop/1.8.0-r3`.

## Install or update

1. Download and extract the **extension** ZIP to a permanent folder.
2. Open `edge://extensions` or `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the extracted **account-id-tool** directory containing `manifest.json`.
3. Pin Gather. On a supported profile, use Find IDs on this page; use direct capture actions when you need an image. A case is optional.

For an existing installation, finish captures, close Gather windows and optionally make a private backup. Replace **all files in the same installed directory**, then Reload and verify **1.8.10**. **Do not uninstall or clear storage.** Reload releases ephemeral session values; durable findings/images remain. Keep exported backups private because they contain original/unredacted images and are not encrypted.

Rollback: preserve 1.8.9 and its matching pre-update backup. Verify the older release in a **separate clean browser profile**, restoring the matching backup. Retain current work until recovery is verified; do not downgrade the active profile in place. Deletion without backup cannot be undone.

## Verification

- 165 Node checks; zero failed/skipped.
- 104 unique rendered groups: capture21, toolbar24, case/privacy18, stabilization10, clipboard7, workspace8, image-tools16.
- 10 actual Chromium service-worker groups with controlled Chrome APIs. The 16 image-tool groups also pass at 2× device scale; repeats are not extra groups.
- Extracted development ZIP: 165 Node, 24 toolbar, 8 workspace and 16 image-tool groups passed. All 74 final runtime files match those tested bytes.
- Both ZIP CRC checks passed; SHA-256 and prior1.8.9 integrity verified. Permissions/storage/backup model unchanged. Private/live observations and organization packs excluded.
- Fictional popup/workspace/editor screenshots were visually inspected. The primary action is checked against the actual smaller popup clipping boundary.

Chrome extension APIs and Downloads are doubles; DOM/canvas/PNG/clipboard/IndexedDB and applicable worker lifecycle are real. Ordinary confirmation/window closure is tested. This cloud's administrator policy blocks loading unpacked extensions, so native preflight reports **blocked with zero groups**. Installed Edge/Chrome screenshot invocation, OS paste/save/print, native tab-close/reload prompts, browser zoom and screen readers remain unverified. No new live-platform run or legal certification is claimed.

## Known limits and retained requests

Five extractors remain; X is search-only. Technical failures are not inferred identity or Gone. Nested scrollers/custom root folders remain unsupported; full-page capture is bounded and can be partial. Copy/save uses selected derivatives; private backups retain originals. Logical deletion cannot erase external files, clipboard, browser history or old backups.

The [whole-workflow audit](../../gather/docs/USABILITY-AUDIT.md) records useful unfinished work: selected-result saving, local Quick Parts, deliberate confirmed-identifier carry-forward, query recipes and field provenance. They are deferred rather than cancelled, and are not included in this build. See the [handoff](../../gather/docs/NEXT-RUN-HANDOFF.md) and [current evidence](../../gather/docs/evidence/1.8.10/README.md).

## SHA-256

```text
9aa8dae94b786ea3979bcc5d4707bfe0d9fcb401cc8f1263838e8ee4922de9d3  Gather-1.8.10-extension.zip
5c219a792f78c2764ebab5d899a123a9f9f9cee39f2090bdb2eb5bad3605755a  Gather-1.8.10-development.zip
```

Runtime ZIP: 182,836 bytes. Development ZIP: 13,409,556 bytes. Versioned Git ZIP mirrors are the delivery route; no GitHub Release object is claimed. Pinned download verification is recorded after publication.

## Pinned source and downloads

Source/package commit: `11cbb43173d72ba6194227d665e183b4a5584604`.

- [Extension ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/11cbb43173d72ba6194227d665e183b4a5584604/releases/1.8.10/Gather-1.8.10-extension.zip)
- [Development ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/11cbb43173d72ba6194227d665e183b4a5584604/releases/1.8.10/Gather-1.8.10-development.zip)
- [Checksums](https://raw.githubusercontent.com/roedoeroe/Gather/11cbb43173d72ba6194227d665e183b4a5584604/releases/1.8.10/Gather-1.8.10-SHA256SUMS.txt)

The URLs pin immutable package bytes. Public download verification is recorded in `Gather-1.8.10-DOWNLOAD-VERIFICATION.json` after publication.
