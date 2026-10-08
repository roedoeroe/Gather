# Gather 1.8.11 — simpler, private search launching

[Extension ZIP](Gather-1.8.11-extension.zip) · [Development ZIP](Gather-1.8.11-development.zip) · [Checksums](Gather-1.8.11-SHA256SUMS.txt) · [Verification](Gather-1.8.11-PACKAGE-VERIFICATION.json)

Web searches now launch without saved queries, drafts or search logs. Reverse-image search opens the chosen provider so you decide what to upload there. Missing rendered profile IDs trigger an automatic, bounded same-document source read with account matching. Fictional gray field examples supplement permanent labels. Saved findings / Tasks / Changes explains deliberate local storage, and capture history refreshes without temporary missing groups.

Older automatic search text/drafts are cleaned up on update and backup import. Query-free legacy IDs/timestamps preserve existing evidence references. Deliberately saved case fields/plans, findings, tasks and images remain. Browser/provider history, clipboard and previous downloaded files are separate. No new permissions or runtime dependencies.

## Install, update and rollback

Extract the extension ZIP to a permanent folder. In Edge or Chrome Extensions, enable Developer mode and Load unpacked → **account-id-tool**. Existing installations: finish captures, close Gather windows, replace **all files at the same installed path**, then Reload and verify1.8.11. Do not uninstall or clear storage. Reload releases ephemeral session values. Optional private backups include unredacted originals and are unencrypted.

Preserve1.8.10 and a matching pre-update backup. Query-free legacy records may fail older validators: verify rollback in a **separate clean browser profile**, never downgrade the current profile in place. Retain current work until recovery is checked.

## Executed checks

-178 Node tests, zero failed/skipped.
-105 unique rendered groups: capture21, toolbar24, case18, stabilization10, case clipboard7, workspace9, image tools16.
-10 actual Chromium service-worker groups; image-tool16 repeated at2× device scale.
-Extracted ZIP:178 Node,24 toolbar,9 workspace,16 image-tool groups. All77 runtime files match final packaged bytes. ZIP CRC and SHA-256 verified;1.8.10 remains unchanged.
-Desktop/narrow workspace and popup visually inspected. One authorized anonymous Instagram source read returned HTTP200 and an exact matched ID; raw source/real identifiers were removed and excluded from packages.

Rendered journeys use real DOM/canvas/clipboard/IndexedDB and controlled Chrome API doubles. Native installed-extension acceptance: **BLOCKED BY MANAGED POLICY**, zero native groups. Signed-in Edge source access, native screenshot invocation, OS paste/save/print and other live platforms remain unverified. No universal guarantee or legal certification.

## Limits and continuation

Reverse-image provider destinations are launchers, not verified upload integrations; Bing/Shutterstock returned403 to cloud HTTP checks. No automatic image upload. Five ID extractors remain; X is search only. No inferred identity/threat conclusions or automatic redaction. Full-page capture remains bounded; nested scrolling/custom roots are unshipped. Private backups preserve originals; ordinary image outputs use the selected image.

See [handoff](../../gather/docs/NEXT-RUN-HANDOFF.md), [test evidence](../../gather/docs/evidence/1.8.11/README.md) and [implementation note](../../gather/docs/SEARCH-AND-LOOKUP-1.8.11.md). A separate hardening pass follows this immutable release. Main remains unchanged.

## SHA-256

```text
485ab230b2b12ea69dc31c38586bb4a76912b68d5543314291f9c2ee8b824ad4  Gather-1.8.11-extension.zip
7a1c94c90d010bbd83b1b1b7c53f0a380be27dde671dcbbf0335658fd2c94ddb  Gather-1.8.11-development.zip
```

Versioned Git ZIP mirrors are the delivery route. No GitHub Release object is claimed.

Source/package commit: `29dd714087235820d389996d85b9178fa5ee2f15`.

- [Gather-1.8.11-development.zip](https://raw.githubusercontent.com/roedoeroe/Gather/29dd714087235820d389996d85b9178fa5ee2f15/releases/1.8.11/Gather-1.8.11-development.zip)
- [Gather-1.8.11-extension.zip](https://raw.githubusercontent.com/roedoeroe/Gather/29dd714087235820d389996d85b9178fa5ee2f15/releases/1.8.11/Gather-1.8.11-extension.zip)

Public downloads returned HTTP200; SHA-256, ZIP CRC and all77 runtime files matched.
