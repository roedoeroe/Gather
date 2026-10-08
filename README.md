# Gather

A local browser extension for fast account lookup and precise screenshots. **Open a profile → Gather → inspect or copy.** A case is optional.

## Get Gather 1.8.14

[Extension ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/74e27a516183993ef05da91286bc7cd2d4ee6133/releases/1.8.14/Gather-1.8.14-extension.zip) · [Source/test ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/74e27a516183993ef05da91286bc7cd2d4ee6133/releases/1.8.14/Gather-1.8.14-development.zip) · [SHA-256 checksums](releases/1.8.14/Gather-1.8.14-SHA256SUMS.txt) · [Installation and delivery](releases/1.8.14/Gather-1.8.14-DELIVERY.md)

This fix addresses first-click Instagram failures that succeeded on a second click. The initial current-page operation now performs the needed public-source check automatically, with no cookies, an exact account binding and document/conflict guards. Current-page retry keeps pasted input closed. Case/SOC and all three screenshot buttons stay in a fixed bottom area while results scroll.

The blue/white workspace separates **Research · Captures · Case · Settings**. New cases need only a non-identifying case label and SOCs. All captures / Unassigned / SOC history filters never change the saving destination. Existing cases and image backups remain compatible.

Extract the extension ZIP and load **account-id-tool** from `edge://extensions` → Developer mode → Load unpacked. For updates, replace all files in the same installed directory and Reload; **do not uninstall or clear storage**. Keep the previous 1.8.13 package and a matching backup for rollback in a separate clean browser profile. [Complete update/rollback instructions](gather/README.md#install-or-update).

## Local by design

Cases, SOCs, screenshots and recent lookups stay in this browser on your computer. There is no case server, cloud sync or analytics. Web searches open chosen services without retaining query/history in Gather. Profile lookups contact their platform; exported files and clipboard contents leave Gather. Originals are retained; redaction is manual. Private backups are unencrypted and contain originals.

**Settings → Data & Privacy** has red Delete case and Clear recent history controls. Recent lookups can also be cleared in the popup. Capture history provides confirmed individual/selected-image deletion. These remove local Gather records/blobs, not browser history, downloaded files or clipboard history.

## Tested scope

**208 Node tests, 112 rendered workflow groups, 11 pixel-selection groups, 10 actual worker groups and five isolated-world reader groups passed.** A real signed-out profile read and a controlled missing-markup/live-public-response test also passed: the first operation recovered a matching ID with one public request. Actual account details remain outside public source.

Rendered extension APIs are simulated. This machine still blocks installing unpacked extensions, so signed-in Windows Edge and native toolbar/zoom/OS dialogs remain unverified. [Evidence](gather/docs/TESTING.md).

**1.8.14 is not R4-complete.** Source-image acquisition and Reference Library remain behind the R4 correctness gate. No AI/composer/email system was added. [Exact completed/pending scope](gather/docs/R4-WORKFLOW-RECONCILIATION.md).

## Development

The branch is **develop/1.8.0-r3**; its name is historical. Main retains the independent 1.8.11 merge. Runtime source is `gather/account-id-tool` and needs no install script, server or bundler. From `gather`, run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Public fixtures contain fictional data only.

[Product guide](gather/README.md) · [Next-run handoff](gather/docs/NEXT-RUN-HANDOFF.md) · [Product direction](gather/docs/PRODUCT-DIRECTION.md) · [Cloud setup dialog](gather/docs/ENVIRONMENT-SETUP.md#the-setup-dialog)
