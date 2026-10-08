# Gather 1.8.9 delivery

[Download extension ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/ea2fad943f9e49aeaac386efeaf12c65c7c327c5/releases/1.8.9/Gather-1.8.9-extension.zip) · [Development/source/test ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/ea2fad943f9e49aeaac386efeaf12c65c7c327c5/releases/1.8.9/Gather-1.8.9-development.zip) · [SHA-256 checksums](https://raw.githubusercontent.com/roedoeroe/Gather/ea2fad943f9e49aeaac386efeaf12c65c7c327c5/releases/1.8.9/Gather-1.8.9-SHA256SUMS.txt)

Source/package commit: `ea2fad943f9e49aeaac386efeaf12c65c7c327c5` on `develop/1.8.0-r3`. Main stays unchanged; source stays public. These pinned Git-hosted ZIPs are the runnable delivery, not a claimed GitHub Release object. Previous releases, including 1.8.8, are preserved.

## What changed

- Extended rectangle selection with full-viewport dotted guides; wheel, edge and PageDown/PageUp scrolling; reverse drag; restored starting scroll on completion/cancel.
- Edit image with manually placed red arrows, red circles, black redactions, crop and Undo. Save & copy uses a flattened PNG; originals stay unchanged. No automatic redaction or interpretation.
- Remembered screenshot auto-copy, default on, separate from the existing account-ID preference. Explicit Copy remains available when clipboard access is denied.
- Blue actions and white/light neutral surfaces. Existing compact toolbar, direct capture, visible scan/subject, optional side panel and four workspace views remain.
- Freshness checks remove stale review-sheet images after changes/deletion; optional print source details start off.

## Validation

165 Node checks; 100 unique rendered groups; 10 actual Chromium worker groups passed, zero release-result failures/skips. Fifteen image-tool groups also passed at 2× device scale. Extracted development ZIP passed 165 Node, 15 image tools and 7 workspace UI groups. ZIP CRC and all 74 runtime file bytes match source. Permissions and schema unchanged; private uploads/real observations/storage backups are excluded. [Evidence](../../gather/docs/evidence/1.8.9/README.md) distinguishes native browser primitives from controlled extension APIs.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| Gather-1.8.9-extension.zip | 182,382 | `4426d6cad92088f99b0cd13523e065bd86cb1fb0bfc58d7203e3914e709f7f08` |
| Gather-1.8.9-development.zip | 13,135,964 | `7df10a5fb92b22a68eac66edbc1687d91c92ad795d8b82244e3ccd07a00da4ef` |

## Install/update and rollback

Extract the extension ZIP into a permanent folder and select `account-id-tool` using Load unpacked on the browser Extensions page with Developer mode enabled. For an update: back up privately if needed, close Gather windows, replace **all files at the same installed path**, Reload in `edge://extensions` / `chrome://extensions`, and verify **1.8.9**. Do not uninstall or clear storage. Reload clears ephemeral session names; durable evidence remains.

Keep 1.8.8 and its matching pre-update backup. Verify rollback using that package/backup in a separate clean browser profile before changing current work. Deleted data without backup cannot be restored.

## Known limits

Native Edge/Chrome extension installation is blocked on this cloud machine by administrator policy. The runner reports blocked/exit 2/zero native groups; it does not prove the user's Edge is broken. Native activeTab/screenshots/window focus, OS application paste/save/print, native zoom and screen readers remain unverified. No new live-platform lookup in this release. Do not infer universal reliability or legal compliance.

Only top-level page scrolling; nested scrollers and pinch zoom are unsupported. Dynamic pages may produce seams/partial results. Acquisition is bounded to 24 tiles / 48 million pixels / 24,000 CSS-pixel height / 60 seconds. Storage remains 64 MiB per asset, 192 MiB per capture, 512 MiB total and 4 MiB workspace JSON. Downloads export is relative to Downloads; arbitrary custom roots are not shipped.

Case data stays local; searches/lookups contact chosen services and deliberate exports create separate files. Copy/Save/Print uses the selected edited image; pixels are not automatically anonymized. Source records/review sheets may contain names in URLs/titles. Private all-work backups include unredacted originals and are unencrypted. Gather deletion logically removes its records/assets, not clipboard, browser history, downloads or older backups. The analyst chooses edits and reviews material before sharing.

[Updated handoff](../../gather/docs/NEXT-RUN-HANDOFF.md) retains prior goals. Quick Parts is a separate proposed checkpoint; selected batch saving, confirmed-ID scan carry-forward, field provenance and query recipes remain prioritized future work, not claimed shipped.
