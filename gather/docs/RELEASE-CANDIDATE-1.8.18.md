# Gather 1.8.18 RC

A focused polish release following 1.8.17. A successful lookup says **Find again**; a failed current-page result says **Retry this page**. An unrelated previous batch no longer makes the current-page action look like a retry. Small toolbar text is larger and darker, while screenshot actions stay within reach. Capture History avoids repeating the current scan above its cards and retains grouping for broader views.

No new browser permissions, host patterns, schema, cloud service or capture/extraction algorithm. The conditional two-second Instagram readiness check, exact string IDs, original bytes, manual redaction, frozen Case/SOC filing and query-free searches remain. Source images, content-owner lookup, Reference, Add SOC, image paste, Inbox navigation and guarded finding deletion remain available.

See [Testing](TESTING.md), [Product Audit](PRODUCT-AUDIT-1.8.18.md) and [Future Plans](FUTURE-PLANS.md). Earlier R10 scope remains documented in [its acceptance ledger](R10-ACCEPTANCE-1.8.17.md).

## Install, update and rollback

You only need **Gather-1.8.18-extension.zip**. New installations: extract to a permanent folder, enable Developer mode in edge://extensions and Load unpacked → account-id-tool, where organization policy allows it.

To update, finish captures and close Gather windows. Keep a private backup and the previous ZIP. Replace all files in the **same installed account-id-tool folder**, click **Reload** in edge://extensions, and confirm **1.8.18**. Do not uninstall or clear storage. Keep 1.8.17 with a matching pre-update backup for rollback testing in a separate browser profile. Reference collections have a separate export/import.

This remains a coworker-pilot release candidate. Linux Edge tests do not certify managed Windows installation, signed-in live accounts, Windows scaling, native side-panel opening, OS Save/Print dialogs or your work application's clipboard integration. Protected sources can refuse access and dynamic full-page captures can be partial. Review capture status; no universal guarantee is claimed. Deletion cannot erase previous downloads/backups or browser/clipboard history.
