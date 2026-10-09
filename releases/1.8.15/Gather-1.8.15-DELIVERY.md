# Gather 1.8.15 RC — delivery

Release candidate for a small controlled coworker pilot. Development branch only; main remains unchanged. No GitHub Release object or visibility change.

[Extension ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/ef8836502afade34c6e489ce182bc5a80a0aad0e/releases/1.8.15/Gather-1.8.15-extension.zip) · [Source/test ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/ef8836502afade34c6e489ce182bc5a80a0aad0e/releases/1.8.15/Gather-1.8.15-development.zip) · [Checksums](Gather-1.8.15-SHA256SUMS.txt) · [Package verification](Gather-1.8.15-PACKAGE-VERIFICATION.json) · [QA and remaining limits](../../gather/docs/RELEASE-CANDIDATE-1.8.15.md) · [Coworker Quick Start](../../gather/account-id-tool/COWORKER-QUICK-START.md)

## What changed

Conditional two-second Instagram readiness: immediate read, bounded checks for late metadata, then the existing source fallback. No mandatory sleep for a loaded profile. Shared local Help and a bundled Quick Start. No new permissions, storage schema, retention behavior or network endpoint. Capture production code is unchanged; the repeated native-window test issue was resolved in the harness.

## Install or update

1. Extract the extension ZIP into a permanent folder. For a new installation, Edge → `edge://extensions` → Developer mode → Load unpacked → **account-id-tool**. Organization policy must allow this.
2. For an update, finish capture and close Gather windows. Preserve a private backup if needed. Replace **all files in the existing installed account-id-tool folder** with the new files, then Reload on the Extensions page. Confirm **1.8.15**.
3. Do not uninstall or clear storage merely to update. Pin Gather. Open a supported profile; click Gather to inspect/copy. Choose Case/SOC only when useful. Help is in the popup, panel and workspace.

Native same-folder/profile 1.8.14 → 1.8.15 testing preserved extension ID, case/scan/SOC, capture and original bytes. Switching to a different unpacked folder can change the extension ID and make the previous local data appear absent.

**Rollback:** keep the immutable [1.8.14 package](../1.8.14/Gather-1.8.14-extension.zip) and a matching backup. Test rollback in a separate clean Edge profile before changing the working profile; older builds may not understand newer records. Backups are unencrypted and include original, unredacted images.

## Evidence and pilot limits

214 Node tests; 116 rendered groups; 11 pixel groups; 10 worker groups; five reader groups passed. Image tools repeated at 2× simulated DPR. Actual installed Linux Edge passed 36 groups: 23 lookup/toolbar/capture/editor/Help, 10 workspace and three update. Live signed-out Instagram succeeded in one operation, 271 ms, without publishing account details.

Native visible/full/selected screenshots, horizontal/vertical/scrolling selections, cancellation, subsequent capture, clipboard, editing and original preservation passed. Signed-in Windows Edge, native zoom/DPI, native side-panel opening, OS image-save/print dialogs and every clipboard destination remain unverified. Provider access varies; no reverse-image upload/result acceptance claim. [Detailed test distinctions](../../gather/docs/TESTING.md).

All 85 runtime files in both ZIPs match the tested source; ZIP CRC and SHA-256 verification passed. Extracted-package checks also passed: Node 214, toolbar 29, worker 10, reader five, Help four and all 36 native Edge groups. [Extracted run receipt](evidence/extracted-summary.json). Public-download verification is recorded separately after publication. Earlier releases were not overwritten.

Cases/images stay local in Gather. Deliberate platform/search requests still contact external services. Deleting Gather data cannot delete existing downloads, clipboard/browser/provider history or backups. No automated identity/threat conclusions, automatic redaction or legal certification.

Cloud environment configuration is separate from installing Gather: after reviewing/saving the updated settings, use **Publish environment** when offered. “Install script — Not set” is expected.

## Published download verification

Immutable package commit: `ef8836502afade34c6e489ce182bc5a80a0aad0e`. Both published ZIPs returned HTTP 200 over verified HTTPS; SHA-256 and CRC passed. All 85 runtime files match the tested source, and all 719 development ZIP entries match the repository files. [Download receipt](Gather-1.8.15-DOWNLOAD-VERIFICATION.json). ZIP bytes were not changed after testing or publication.
