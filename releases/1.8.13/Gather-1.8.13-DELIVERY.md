# Gather 1.8.13 — delivery

This development release improves the existing lookup and capture workflow. It is runnable; installed Windows Edge acceptance and the remaining R4 features are not complete.

[Extension ZIP](Gather-1.8.13-extension.zip) · [Development ZIP](Gather-1.8.13-development.zip) · [SHA-256 checksums](Gather-1.8.13-SHA256SUMS.txt) · [Package verification](Gather-1.8.13-PACKAGE-VERIFICATION.json)

## What changed

- The selection helper sits at the edge, hides during dragging and is removed before capture. Dotted guides and scrolling selection remain. Crops reject missing pixels instead of silently clipping them.
- Crop has eight draggable handles, a movable box, keyboard adjustment, Reset, Cancel and Apply. Originals remain intact; arrows, circles and black redaction stay manual.
- Opening Gather reads the current supported profile automatically and preserves any staged pasted draft. A parser fix reads later supported data assignments and refuses conflicting IDs. This does not establish that the reported signed-in Edge Instagram failure is resolved.
- One **Select area** button follows the screenshot auto-copy setting. Full page and Visible area remain. The displayed Case/SOC destination stays frozen during capture.
- New cases ask for a case label and optional SOCs. Capture history has All captures / Unassigned / SOC filters that do not change filing. Same-named SOCs retain distinct IDs and stable ordering.
- Recent lookup history keeps five batches, with a red Clear history control. Deliberately saved findings and screenshots remain separate.

No new browser permissions, dependencies, cloud storage or automatic redaction. Search queries are not retained by Gather. Cases and images remain local. Copying, searching and exporting are deliberate actions with their existing external destinations.

## Install or update in Edge

1. Download and extract the extension ZIP. The loadable folder is **account-id-tool**.
2. For an update, keep the previous package and make a private backup if needed. Replace the files in the **same folder already loaded by Edge**, then open `edge://extensions` and choose **Reload** for Gather. Do not uninstall Gather or clear its storage.
3. For a new installation, enable Developer mode at `edge://extensions`, choose **Load unpacked**, then select **account-id-tool**. Pin Gather to the toolbar.
4. Open a supported profile and click Gather. Inspect/copy the account ID or choose Select area, Full page or Visible area. The side panel is optional.

Updating trims unsaved recent lookup history to five batches. Existing deliberately saved findings, cases and images remain. Reloading releases legacy ephemeral session labels. Backups are unencrypted and include original images; keep them private.

## Validation

- **201 Node tests** passed, zero failed/skipped.
- **110 rendered workflow groups**, **11 pixel-selection groups**, **10 actual service-worker groups** and **5 isolated-world reader groups** passed. Image tools also passed at 2× scale, counted as a repeat.
- The final development ZIP was extracted and rerun: Node 201; toolbar 27; case 19; capture 21; pixel selection 11; worker 10; isolated reader 5. All passed.
- Both ZIPs passed CRC and version checks. All **81 runtime files** match the tested source and final extraction byte for byte. Manifest permissions are unchanged.
- Pixel tests check corners, edges and center through selection/stitching, IndexedDB, actual PNG clipboard and downloaded bytes at five simulated display scales. Browser acquisition/extension APIs are controlled test adapters. These are not native Edge zoom checks.
- Actual rendered screenshots were inspected. Fixtures are fictional. No live-platform read occurred for this release.

[Full scenario evidence](../../gather/docs/evidence/1.8.13/README.md) · [Extracted-package evidence](evidence/) · [Testing commands](../../gather/docs/TESTING.md)

## Remaining limitations

This cloud machine's administrator blocks unpacked extensions. The native runner reports **blocked**, exit 2, zero groups. That prevents installing Gather here for the same test you perform in Edge; it is not a diagnosed failure on your computer. Signed-in Instagram, native Edge zoom/Windows scaling, toolbar permission grants and OS dialogs remain unverified. The existing [local check](../../gather/docs/LOCAL-ACCEPTANCE.md) identifies the exact remaining steps.

R4 places source-image acquisition and the local Reference Library behind those correctness checks; they remain unshipped. Nested scrolling-element capture and custom root folders remain later work. Full-page capture is bounded and reports partial results when required. Local deletion does not erase browser history, clipboard history or already exported files.

## Rollback

Keep [1.8.12](../1.8.12/) and a matching pre-update private backup. Test rollback in a separate clean Edge profile: load the old account-id-tool folder and restore that matching backup. Keep the current installation until the restored data is verified. Do not overwrite current browser storage with an older backup without first preserving current work. Rolling back cannot recover trimmed unsaved recents without a prior backup.

## Development continuation

Published work stays on **develop/1.8.0-r3**. Main and repository visibility are unchanged. [Handoff](../../gather/docs/NEXT-RUN-HANDOFF.md) and [R4 reconciliation](../../gather/docs/R4-WORKFLOW-RECONCILIATION.md) distinguish completed work from blocked/pending work. Release ZIPs remain immutable; subsequent delivery receipts live outside them.
