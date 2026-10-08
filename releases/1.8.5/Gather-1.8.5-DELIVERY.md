# Gather 1.8.5 delivery

Source/package commit: `d29ba5475e0f53795f3f4695155038de8036414f` on `develop/1.8.0-r3`. Main remains unchanged. This receipt is a later commit so it can pin the exact packaged source without a circular hash. Development ZIP includes the product, tests, handoff and fictional evidence; this external receipt is separate.

[Extension ZIP](https://github.com/roedoeroe/Gather/raw/d29ba5475e0f53795f3f4695155038de8036414f/releases/1.8.5/Gather-1.8.5-extension.zip) · [Development ZIP](https://github.com/roedoeroe/Gather/raw/d29ba5475e0f53795f3f4695155038de8036414f/releases/1.8.5/Gather-1.8.5-development.zip) · [Checksums](Gather-1.8.5-SHA256SUMS.txt)

| Package | SHA-256 |
| --- | --- |
| Extension | `b6cc58cb21a279ff76fdc678d07e606911b21f8959d9991fc717d0fdc03964a2` |
| Development | `23a51562bac52a5d95e19cb0024b7306d3184c787a4ffc57d5b36f8d5db4e297` |

## What changed

Select directly on the page with pointer release or keyboard coordinates; Select area & copy saves first and copies the selected PNG. Completion adds verified image copy, PNG/JPEG save-as, selected-image print/PDF preview and editing/history. Captures are grouped by exact case/scan, with saved images by default and deeper filters on demand. Red individual/selected deletion checks snapshots and atomically removes original/derivative assets. Worker-owned controller-close cleanup, page watchdogs and atomic failure writes protect cancellation/restoration and prevent late resurrection. Frozen filing, exact IDs, project-free lookup, local storage and existing backups remain. No new permission or runtime dependency.

## Evidence and practical limits

129 Node checks; 21 capture/UX, 22 toolbar/capture/lookup and 18 case/privacy rendered groups (61 total); 10 actual Chromium worker groups passed. [Testing](../../gather/docs/TESTING.md) and [fictional evidence](../../gather/docs/evidence/1.8.5/) distinguish real DOM/canvas/IndexedDB/clipboard/worker behavior from controlled Chrome API doubles.

Native installed Chrome/Edge remains unaccepted because of administrator policy; live platforms and native FireShot were not tested. Native activeTab/focus/screenshot/save/print UI and real zoom still need the [local acceptance checklist](../../gather/docs/LOCAL-ACCEPTANCE.md). PDF uses the native print dialog; JPEG save does not create a saved-byte sidecar. Structured Downloads folder export is the image/record/hash path. Nested scrollers, arbitrary custom roots and batch URL capture are not shipped. Binary backups include unredacted originals and are not encrypted.

## Install, update and rollback

Extract the extension ZIP to a permanent folder and load its `account-id-tool` directory via Chrome/Edge Extensions → Developer mode → Load unpacked. Updating an existing installation: finish captures, optionally back up, close Gather windows, replace **all files in the same installed folder**, Reload and confirm **1.8.5**. Do not uninstall or clear browser storage; reload releases ephemeral session values while saved evidence remains.

Preserved [1.8.4 extension](https://github.com/roedoeroe/Gather/raw/da107b1109c39315dbf5a3cc0fc1ca54071322c3/releases/1.8.4/Gather-1.8.4-extension.zip) and its original checksums were verified unchanged. Test rollback with 1.8.4 and a matching pre-update backup in a separate clean browser profile; preserve the current profile until recovery is verified. [Handoff/backlog](../../gather/docs/NEXT-RUN-HANDOFF.md) records exact resumption priorities.

ZIPs are versioned Git mirrors. No GitHub Release upload or new main merge is implied. Cloud startup instructions were saved separately as a reviewable draft; a draft save does not publish a cloud snapshot.
