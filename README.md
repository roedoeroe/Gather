# Gather

A local browser extension for fast account lookup and precise screenshots. **Open a profile → Gather → inspect or copy.** A case is optional.

## Get Gather 1.8.13

[Extension ZIP](releases/1.8.13/Gather-1.8.13-extension.zip) · [Source/test ZIP](releases/1.8.13/Gather-1.8.13-development.zip) · [SHA-256 checksums](releases/1.8.13/Gather-1.8.13-SHA256SUMS.txt) · [Installation and delivery](releases/1.8.13/Gather-1.8.13-DELIVERY.md)

This development release fixes the obstructing selection helper, rejects silently clipped selections, adds adjustable Crop handles and simplifies Case/SOC filing. The toolbar resolves the current supported profile on opening, preserves pasted drafts and keeps only five recent lookup batches. One **Select area** button uses your screenshot auto-copy preference; Full page and Visible area remain available. The side panel is optional.

The blue/white workspace separates **Research · Captures · Case · Settings**. New cases need only a non-identifying case label and SOCs. All captures / Unassigned / SOC history filters never change the saving destination. Existing cases and image backups remain compatible.

Extract the extension ZIP and load **account-id-tool** from `edge://extensions` → Developer mode → Load unpacked. For updates, replace all files in the same installed directory and Reload; **do not uninstall or clear storage**. Keep the previous 1.8.12 package and a matching backup for rollback in a separate clean browser profile. [Complete update/rollback instructions](gather/README.md#install-or-update).

## Local by design

Cases, SOCs, screenshots and recent lookups stay in this browser on your computer. There is no case server, cloud sync or analytics. Web searches open chosen services without retaining query/history in Gather. Profile lookups contact their platform; exported files and clipboard contents leave Gather. Originals are retained; redaction is manual. Private backups are unencrypted and contain originals.

**Settings → Data & Privacy** has red Delete case and Clear recent history controls. Recent lookups can also be cleared in the popup. Capture history provides confirmed individual/selected-image deletion. These remove local Gather records/blobs, not browser history, downloaded files or clipboard history.

## Tested scope

**201 Node tests, 110 rendered workflow groups, 11 pixel-selection groups, 10 actual service-worker groups and five isolated-world reader groups passed.** Image editing also passes at 2× scale. Pixel checks trace corner/edge/center markers through capture, local binary storage, clipboard and downloaded bytes at five simulated display scales.

Rendered tests use controlled extension API doubles. This cloud machine's administrator blocks unpacked extensions, so installed Windows Edge, native browser zoom, signed-in Instagram and OS dialogs remain unverified. The originally reported native failures are not declared closed solely by passing fixtures. [Evidence](gather/docs/TESTING.md) · [Remaining Edge check](gather/docs/LOCAL-ACCEPTANCE.md).

**1.8.13 is not R4-complete.** Source-image acquisition and Reference Library remain behind the R4 correctness gate. No AI/composer/email system was added. [Exact completed/pending scope](gather/docs/R4-WORKFLOW-RECONCILIATION.md).

## Development

The branch is **develop/1.8.0-r3**; its name is historical. Main retains the independent 1.8.11 merge. Runtime source is `gather/account-id-tool` and needs no install script, server or bundler. From `gather`, run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Public fixtures contain fictional data only.

[Product guide](gather/README.md) · [Next-run handoff](gather/docs/NEXT-RUN-HANDOFF.md) · [Product direction](gather/docs/PRODUCT-DIRECTION.md) · [Cloud setup dialog](gather/docs/ENVIRONMENT-SETUP.md#the-setup-dialog)
