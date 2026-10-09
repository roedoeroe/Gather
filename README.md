# Gather

A local browser extension for fast account lookup and precise screenshots. **Open a profile → Gather → inspect or copy.** A case is optional.

## Get Gather 1.8.15 RC

[Extension ZIP](releases/1.8.15/Gather-1.8.15-extension.zip) · [Source/test ZIP](releases/1.8.15/Gather-1.8.15-development.zip) · [SHA-256 checksums](releases/1.8.15/Gather-1.8.15-SHA256SUMS.txt) · [Delivery and verification](releases/1.8.15/Gather-1.8.15-DELIVERY.md)

Instagram now gets a conditional **two-second readiness buffer** when profile metadata is late. Already-loaded IDs return immediately; the existing source fallback follows when needed. Shared searchable **Help** and a bundled [Coworker Quick Start](gather/account-id-tool/COWORKER-QUICK-START.md) explain the workflow, privacy and updates. No new permissions, storage schema or network endpoints.

The blue/white workspace has **Research · Captures · Case · Settings**. The toolbar keeps Case/SOC and Select area, Full page and Visible area within reach. Capture history, scrolling selection, crop, arrows/circles, manual black redaction and separate originals remain available.

Extract the extension ZIP and load **account-id-tool** from `edge://extensions` → Developer mode → Load unpacked. For updates, replace **all files in the same installed directory**, then Reload and confirm **1.8.15**. Do not uninstall or clear storage. Keep 1.8.14 and a matching backup for rollback testing in a separate clean browser profile. [Complete update/rollback instructions](gather/README.md#install-or-update).

## Local by design

Cases, SOCs, screenshots and recent lookups stay in this browser on your computer. There is no case server, cloud sync or analytics. Web searches open chosen services without retaining query/history in Gather. Deliberate profile lookups contact their platform. Exported files and clipboard contents leave Gather. Originals remain available; redaction is manual. Private backups are unencrypted and contain originals.

**Settings → Data & Privacy** has red Delete case and Clear recent history controls. Captures support confirmed individual/selected deletion. These delete local Gather records/blobs, not downloaded files, browser/provider history or clipboard history.

## Tested scope

**214 Node tests, 116 rendered groups, 11 pixel-selection groups, 10 worker groups and five isolated reader groups passed.** Image tools also passed at 2× simulated DPR.

**36 native installed Linux Edge groups passed:** toolbar/activeTab, all capture modes, scrolling selection, cancellation/repeat, clipboard, image editing, workspace and same-folder update. A live signed-out Instagram lookup succeeded on the first operation in **271 ms**; no real account details were published. [Evidence and commands](gather/docs/TESTING.md).

Ready for a **small controlled coworker pilot**. Signed-in Windows Edge, native zoom/DPI, native panel opening and OS image-save/print dialogs remain unverified. No universal platform reliability claim. [Release report and limitations](gather/docs/RELEASE-CANDIDATE-1.8.15.md).

Source-image acquisition and Reference Library remain behind the remaining R4 correctness checks. [Completed/pending scope](gather/docs/R4-WORKFLOW-RECONCILIATION.md).

## Development

Use **develop/1.8.0-r3** (historical branch name). Main retains the independent 1.8.11 merge. Runtime is `gather/account-id-tool`; no install script, bundler or server. From `gather`, run `node --test tests/*.test.mjs`. Public fixtures contain fictional data only.

[Product guide](gather/README.md) · [Handoff](gather/docs/NEXT-RUN-HANDOFF.md) · [Cloud setup](gather/docs/ENVIRONMENT-SETUP.md#publication-and-the-setup-dialog)
