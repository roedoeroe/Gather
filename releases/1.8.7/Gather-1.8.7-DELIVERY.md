# Gather 1.8.7 delivery

Source/package commit: `dbbb6bc329387287377b3020519a5a96e2b8f50f` on **develop/1.8.0-r3**. Main remains unchanged. This separate receipt records final downloads without circular archive hashes.

[Download extension](https://raw.githubusercontent.com/roedoeroe/Gather/dbbb6bc329387287377b3020519a5a96e2b8f50f/releases/1.8.7/Gather-1.8.7-extension.zip) · [Development source/tests](https://raw.githubusercontent.com/roedoeroe/Gather/dbbb6bc329387287377b3020519a5a96e2b8f50f/releases/1.8.7/Gather-1.8.7-development.zip) · [Checksums](Gather-1.8.7-SHA256SUMS.txt)

## Fixed existing workflow

Role account block previews preserve Candidate/Confirmed analyst decisions, original check dates, exact IDs and reviewed case/scan/role; rejected associations remain omitted and cross-scan observations remain separate. Relevant changes or deletion clear stale preview text and disable Copy. A global destination switch keeps the originally reviewed case; Cancel during delayed validation stops later dispatch. Clipboard denial appears inside the preview, selects text for manual copying and offers Retry. No new views, permissions, dependencies or schema migration. Capture/privacy/export fixes remain.

## Verified

**132 automated checks, 85 rendered interface groups and 10 actual worker groups passed.** The extracted development package passed its own 132 checks and 7 clipboard groups; reruns are not added to the unique count. Seven new clipboard groups failed against 1.8.6 before the fix. Desktop/narrow denial and deleted-case previews were visually inspected. [Evidence](../../gather/docs/evidence/1.8.7/README.md).

Both public pinned downloads returned HTTP 200 and matched the exact hashes below, ZIP CRC/version and every runtime file digest. [Download verification](Gather-1.8.7-DOWNLOAD-VERIFICATION.json). Both preserved 1.8.6 ZIP hashes remain unchanged.

| Package | Bytes | SHA-256 |
| --- | ---: | --- |
| Extension | 173565 | `b5c2f520faee2da41271f32ae6cd9b8ebf5fae878add87640d991e69664b2e59` |
| Development | 12172434 | `7474f7f1a55fcbff99cdb104919078eb2409e9ed08e81a59c6573b2f8d19d54b` |

Chrome extension APIs are doubles in these browser journeys. The cloud administrator still blocks installing unpacked extensions; native toolbar/activeTab screenshot/permission/OS dialog behavior and live platforms remain unverified. [Plain-language restriction](../../gather/docs/BROWSER-TEST-BLOCKER.md) and [installed checklist](../../gather/docs/LOCAL-ACCEPTANCE.md). No policy/sandbox/TLS bypass or repeated prohibited launch. Already-dispatched external clipboard/download work cannot be revoked; previously copied/exported files are outside Gather deletion.

## Install or update

Extract the extension ZIP into a permanent directory. In Chrome/Edge Extensions, enable Developer mode, choose **Load unpacked** and select **account-id-tool** containing manifest.json. Pin Gather.

For an existing installation, finish captures/exports, optionally back up, close Gather windows and replace **all files in the same installed folder**. Click **Reload** on the Extensions page and confirm **1.8.7**. Do not uninstall or clear storage. Reload releases Ephemeral Case session values; saved findings/images remain.

Rollback: preserve [1.8.6](../1.8.6/Gather-1.8.6-DELIVERY.md) and its matching pre-update backup. Test it in a separate clean browser profile and retain the current installation until recovery is verified. Earlier versions lack these clipboard safeguards. Case data stays local; source stays public. Original/unredacted bytes are in private unencrypted backups. Nested scrolling/custom roots remain unshipped.

## The cloud setup dialog

Click **Done** in “Configure setup instructions.” **Install script — Not set** is intentional: Gather needs no runtime install. Start skill is the agent's saved startup guide, not a plugin. Review/save then **Publish environment** in the app to preserve the prepared cloud workspace. This is separate from installing the ZIP on your computer.

The configuration is corrected from main's README-only selection to the actual verified development checkout at mount Gather and uses a shorter 1.8.7 guide. Other settings stay unchanged. Saving a draft is not environment publication or proof of new-task restoration; it cannot remove managed browser policy. [Setup guide](../../gather/docs/ENVIRONMENT-SETUP.md).

These ZIPs are Git mirrors rather than GitHub Release objects. Source/test packages are immutable release snapshots; fetch the development branch for later documentation and setup refinements. [Current handoff and priorities](../../gather/docs/NEXT-RUN-HANDOFF.md).
