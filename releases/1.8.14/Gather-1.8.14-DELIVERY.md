# Gather 1.8.14 — first-attempt lookup fix

[Extension ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/74e27a516183993ef05da91286bc7cd2d4ee6133/releases/1.8.14/Gather-1.8.14-extension.zip) · [Development ZIP](https://raw.githubusercontent.com/roedoeroe/Gather/74e27a516183993ef05da91286bc7cd2d4ee6133/releases/1.8.14/Gather-1.8.14-development.zip) · [Checksums](Gather-1.8.14-SHA256SUMS.txt) · [Package verification](Gather-1.8.14-PACKAGE-VERIFICATION.json)

The reported first-click failure followed by second-click success exposed two different lookup paths. The first operation read the current page and its session source. Retained failed input could send the second click through the public-profile lookup instead. **The first current-page operation now includes that public check automatically** when Instagram markup omits a matching ID. It is one bounded request without cookies, and it preserves the original lookup/case context. Successful initial reads make no extra request.

The original document is checked again before returning the public result. Navigation, cancellation, conflicting IDs and authentication/security checks cannot silently select another account. Exact string IDs and all five existing adapters remain. No broad search for unrelated numeric IDs was introduced.

Current-page lookup and retry no longer focus the hidden paste box. **Paste profile links stays collapsed**, and **Case/SOC plus Select area, Full page and Visible area remain in a separate bottom area** while lookup results scroll. Screenshot auto-copy is still remembered and can be changed under Page options. Missing-ID wording no longer claims that a loaded page merely needs more time.

## Validation

- **208 automated Node tests passed**, zero failed/skipped.
- **112 rendered browser workflow groups**, **11 pixel-selection groups**, **10 actual worker groups** and **five isolated-world reader groups** passed. DOM/canvas/clipboard/IndexedDB are real Chromium; extension APIs are controlled doubles.
- A live signed-out browser read of the authorized profile succeeded. A controlled missing-markup reproduction then used the actual resolver and isolated reader with the **live public response**: first-operation success, one public request, matching ID. The observed request/recheck took about 1.3 seconds in that run; this is not a performance guarantee.
- Success and failure popup screenshots were inspected, and assertions check that the primary lookup and all three screenshot buttons remain visible with Case/SOC.
- Both ZIPs passed CRC; all **81 runtime files** match the tested source. Permissions are unchanged. Final extracted-package results are recorded in the package receipt.

[Full evidence](../../gather/docs/evidence/1.8.14/README.md) · [Commands and scope](../../gather/docs/TESTING.md)

This machine still blocks installing unpacked extensions. The live test was **not your signed-in Edge session** or a native extension test. Windows Edge invocation, native browser zoom and OS dialogs remain unverified. No real account identifiers, profile source, cookies or screenshots were published. Source-image acquisition and Reference Library remain behind the existing R4 correctness gate.

## Update in Edge

1. Download and extract the extension ZIP.
2. Replace the contents of the **same account-id-tool folder that Edge already loads**.
3. Open `edge://extensions`, click **Reload** for Gather and confirm **1.8.14**.
4. Open the profile and click Gather once. It starts the lookup automatically; Copy IDs becomes available when an ID is verified.

Do not uninstall Gather or clear its storage. Existing cases, images and settings remain. No new permissions, cloud service, storage schema or retention change was added. Public-profile requests go only to the platform being looked up; case data is not sent.

For rollback, retain [1.8.13](../1.8.13/) and a matching private backup. Test the old package and backup in a separate clean Edge profile before changing your working installation. Backups are unencrypted and include original images.

The release stays on **develop/1.8.0-r3**. Main and repository visibility are unchanged. [Next-run handoff](../../gather/docs/NEXT-RUN-HANDOFF.md) records the remaining native checks.

Both pinned public downloads returned HTTP 200 and passed SHA-256, CRC and 81 runtime-file comparisons. Source/package commit: `74e27a516183993ef05da91286bc7cd2d4ee6133`. [Download verification](Gather-1.8.14-DOWNLOAD-VERIFICATION.json). The extracted development package also passed Node 208, toolbar 29, worker 10 and isolated reader 5.
