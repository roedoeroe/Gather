# Gather 1.8.17 RC delivery

[Extension ZIP](https://github.com/roedoeroe/Gather/releases/download/1.8.17-rc.1/Gather-1.8.17-extension.zip) · [Release](https://github.com/roedoeroe/Gather/releases/tag/1.8.17-rc.1) · [Testing](../../gather/docs/TESTING.md)

## Recovered work and completed fixes

Resumed the develop/1.8.0-r3 working tree at 6ba56c0959e1f5b1df3a6ef3a62319a987f15a77. Unpublished 1.8.17 R10 changes and both earlier 28-group native receipts were intact. Preserved that work and the original/pre-continuation checkpoints; no published package/tag was changed.

Already present: prominent Add SOC, normal Reverse Image Ctrl+V, invalid/rapid replacement safety, case-scoped Capture History on navigation, compact source-image completion and provider guidance. Those behaviors were revalidated, not rebuilt. Add SOC supports keyboard/cancel/blank rejection, duplicate names with distinct IDs and frozen case selection. Paste copies the actual newly selected pixels without clipboardRead. All cases remains an intentional history view; switching to a case restores its own filters.

Inbox was selecting its destination without selecting the main Research section. The fix explicitly opens Research, highlights Inbox and clears stale case/SOC presentation. Zero/one/multiple cases, other main tabs, reload, last-case deletion and 400px keyboard Library are covered.

Each saved finding has a red Delete button and cancel-first confirmation. Snapshot guards reject concurrent edits. Deletion removes that finding's text, Undo/activity and relationship links; other observations, cases, subjects, captures/source images, tasks and external files stay. Interrupted IndexedDB/workspace writes recover through the existing journal; tombstones reject stale association writes. The control preserves filters, updates counts and returns useful keyboard focus. Bulk clear is deferred.

## Final evidence

| Layer | Result |
|---|---|
| Node | 230 passed, zero failed/skipped |
| Rendered workflows | 117 groups passed, including injected interrupted-delete recovery |
| Pixel / worker / reader | 11 / 10 / 5 passed |
| Image tools at2× | Same17 repeated; not additional unique scenarios |
| Native Linux Edge | Workspace10 + toolbar/capture/editor23 + update3 + analyst32 =68 groups |
| Fresh profiles | Two final 32-group journeys passed consecutively |
| Update | 1.8.16 →1.8.17 at same folder with extension Reload; findings, Case/SOC, original images/source images, derivatives, Reference, Recents/preferences preserved exactly |
| Restart | Confirmed deleted Inbox finding stays gone after real browser restart; unrelated case finding stays |
| Exact extension ZIP | CRC/hash/manifest and102 runtime files matched; installed extracted ZIP passed32 analyst groups and3 update groups |
| Source/test ZIP | Extracted Node230, toolbar29, worker10, reader5, Help4 and generated reader checks passed |
| Syntax / permissions | 68 modules valid; permissions, hosts and CSP unchanged |
| Public candidate scan | No pattern issues; manual source/fictional screenshot review completed. Not a general PII detector/legal certification |

The update test found Edge can keep a cached old worker after file replacement and restart; it now performs the documented extension Reload. Help/native tests were updated for version17 and19 Help topics. Other harness diagnostics and bounded fixes are recorded in Product Audit; no reproducible production release blocker is intentionally deferred.

Live provider checks used only a generated geometric image: Yandex pasted Gather's copied image and returned results; TinEye ordinary upload returned results. Google reached unusual-traffic protection, with no bypass. Lenso/Shutterstock403; Bing redirected; Baidu/Sogou landings opened. Submission to those other providers remains unverified. No changed provider code required repeating those live submissions.

## Download, update, rollback and limits

Only Gather-1.8.17-extension.zip is attached to Releases. It is246386 bytes; SHA-256 d846cd303e5202eb70e6113e1b2d527766de58f677ee09dbca7ea8f78229c9cb. Developer archive/checks/receipts remain here. ZIPs were not rebuilt after testing. GITHUB-VERIFICATION.json records anonymous public download verification after publication.

Close Gather/captures, keep a private backup and1.8.16 ZIP, replace all files in the **same installed account-id-tool folder**, then click **Reload** at edge://extensions and confirm1.8.17. Do not uninstall or clear storage. Keep the matching pre-update backup for rollback testing in a separate Edge profile; Reference has its own export/import. New installs use Developer mode → Load unpacked if organization policy permits.

Ready for a controlled coworker pilot, not a universal guarantee. Signed-in/managed Windows, Windows scaling, native side-panel opening, OS Save/Print and all work-app clipboard targets remain unverified. Native platform responses in automation are fictional fixtures. Protected sources can fail and dynamic/full-page captures can be explicitly partial. Local deletion cannot erase previous exports/backups or clipboard/browser history. No new cloud work-data service or permissions.

Future Plans is updated tool by tool. Highest priorities remain Windows/work-app acceptance, evidence-driven adapter/CDN fixes and private Reference corpus validation. Bulk clear, nested-scroller capture and custom directory roots remain deferred.

Cloud startup/repository configuration is saved after final integration; review/save it in environment settings and **Publish environment** to snapshot the tools/ref. Draft saving is separate from GitHub publication and local extension updating.
