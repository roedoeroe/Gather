# Gather 1.8.16 RC

Only **Gather-1.8.16-extension.zip** is needed to install Gather. The development archive and verification files are for maintenance and are not extra installation steps.

## Changes

- Save an original source image from its browser context menu; review, copy or edit it locally.
- Start reverse image search with a saved image or local file, then explicitly copy and open the provider. No automatic image upload.
- Resolve supported post/video links to their explicitly bound account owner; keep exact string IDs and clean profile links.
- Import and search a local Reference Library; use keyboard completion for supported search operators.
- Preserve the conditional two-second Instagram readiness check, existing capture tools and local case privacy. No additional browser permissions.

## Verification

226 Node tests; 116 rendered workflow groups; 11 pixel, 10 worker and five isolated reader checks passed. Real installed Linux Edge exercised capture, scrolling selection, cancellation, clipboard, editing, local image/Reference workflows and an in-place 1.8.15 update. The final 23-group analyst journey passed twice with fresh profiles and again using the actual extension ZIP. Platform responses in those journeys are controlled fictional fixtures, not signed-in live-site verification.

The extracted development archive passed generation, Node, toolbar, worker, reader and Help checks. All 102 runtime files in the extension ZIP match the tested source. ZIP CRC and SHA-256 verification passed.

## Install, update and rollback

Extract the ZIP. For a first installation, open edge://extensions, enable Developer mode and Load unpacked → account-id-tool, if your organization allows it.

For an update, make a private backup, finish captures and close Gather windows. Replace all files in the same installed account-id-tool folder, click Reload at edge://extensions and confirm 1.8.16. Do not uninstall or clear storage. Keep the old ZIP and matching pre-update backup. Test rollback in a separate browser profile: older releases cannot interpret every new image type or Reference collection. Reference exports are separate from case backups.

## Known limits

Signed-in Windows/managed Edge, Windows display scaling, native side-panel opening and OS save/print/application paste still need checks on that actual system. Protected or CORS-blocked source images fail visibly. Reverse-search access varies by provider. Dynamic full-page capture is bounded and partial results must be reviewed. Local data and private backups are unencrypted; backups can include original, unredacted images. Deleting Gather data does not remove exported files or clipboard/browser history.

Extension SHA-256: `f1692dc02c8dce0faffdae1aa8530de2d40078cb29995f30fdb30d8407cf1f0e`.

Published packages are immutable. Final publication status is recorded in GITHUB-VERIFICATION.json after the public download is checked.
