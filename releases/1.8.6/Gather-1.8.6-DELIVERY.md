# Gather 1.8.6 delivery

Source/package commit: `cd9b747048dbfe7e3dba7b6a29b6c263710ff4b5` on `develop/1.8.0-r3`. Main remains unchanged. This later receipt pins the package without a circular hash. The development ZIP contains source, tests, handoff and fictional evidence; this external receipt is separate.

[Extension ZIP](https://github.com/roedoeroe/Gather/raw/cd9b747048dbfe7e3dba7b6a29b6c263710ff4b5/releases/1.8.6/Gather-1.8.6-extension.zip) · [Development ZIP](https://github.com/roedoeroe/Gather/raw/cd9b747048dbfe7e3dba7b6a29b6c263710ff4b5/releases/1.8.6/Gather-1.8.6-development.zip) · [Checksums](Gather-1.8.6-SHA256SUMS.txt)

| Package | SHA-256 |
| --- | --- |
| Extension | `b43ab9398f07a3b73dbc18fd79426c855f4572994a559571787a05a4e4db1a6a` |
| Development | `102d3dd7c751c34f799e0cef51e081189feab1a06e8c62f82b052172e4e548f3` |

## Fixes only

Capture finish/start ordering and post-save preview errors no longer retain acquisition locks. Stale print previews clear after redaction/deletion; older editors cannot overwrite newer redactions; clipboard conversion rechecks the selected image. Folder exports have one owner across windows and late attempts cannot overwrite successful retries. Active exports protect editing/deletion; restored in-flight exports immediately offer Retry with intact image bytes/relationships. Completion keeps current folder state and disables deleted-image actions after delayed work. No features, permissions, dependencies or schema migrations were added. Case data stays local.

## Evidence and limits

130 Node checks, 71 rendered-browser groups (21 capture/UX, 22 toolbar/capture/lookup, 18 case/privacy, 10 stabilization) and 10 actual Chromium worker groups passed. The extracted development package independently passed its 130 Node, 22 toolbar and 10 stabilization groups. Final ZIP CRC, runtime byte identity, versions, paths and hashes were verified; preserved 1.8.5 ZIP hashes remain unchanged. [Testing](../../gather/docs/TESTING.md) and [evidence](../../gather/docs/evidence/1.8.6/) separate before-fix failures, a diagnosed test timing issue, passing release logs and package reruns.

Chrome extension APIs use controlled doubles. Native installed Chrome/Edge remains administrator-blocked; live platforms/native FireShot were not tested. Native activeTab/screenshot/focus/clipboard/save/print UI, high-DPI/zoom and Edge need the [local checklist](../../gather/docs/LOCAL-ACCEPTANCE.md). Already dispatched downloads/clipboard and external files remain outside deletion. Image/companion downloads are separate operations; Retry retains local bytes and creates safe copies. Binary backups contain unredacted originals and are not encrypted. Nested scrolling/custom roots remain unshipped.

## Install, update and rollback

Extract the extension ZIP to a permanent folder and load its account-id-tool directory through Chrome/Edge Extensions → Developer mode → Load unpacked. Update an existing installation by finishing captures/exports, optionally backing up, closing Gather windows, replacing **all files in the same installed folder**, then Reload and confirm **1.8.6**. Do not uninstall or clear storage. Reload releases ephemeral values; saved images/findings remain.

Preserved [1.8.5 extension](https://github.com/roedoeroe/Gather/raw/d29ba5475e0f53795f3f4695155038de8036414f/releases/1.8.5/Gather-1.8.5-extension.zip) and matching [delivery notes](../1.8.5/Gather-1.8.5-DELIVERY.md) remain. Verify rollback with that package and its pre-update backup in a separate clean browser profile, retaining the current profile until recovery is confirmed. [Handoff/backlog](../../gather/docs/NEXT-RUN-HANDOFF.md) prioritizes native acceptance and concrete fixes.

ZIPs are versioned Git mirrors, not GitHub Release uploads. No main merge is implied. Cloud startup instructions are a separately saved reviewable draft; saving it does not publish a cloud snapshot.
