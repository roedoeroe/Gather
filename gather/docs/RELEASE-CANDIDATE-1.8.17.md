# Gather 1.8.17 RC

Continues 1.8.16 with fewer steps in the existing local workflow. Add SOC is visible beside the case heading and in compact context. Reverse Image accepts normal Ctrl+V image paste, files, drops and saved assets; replacing an image cannot leave stale pixels selected. New cases immediately show their own Capture History and SOC filters. Source-image saves identify their destination.

Inbox now always opens Inbox Research from Library, even with no cases. Each saved finding has a red Delete button and a lightweight cancel-first confirmation. It removes only that finding and its relationship/Undo records; cases, SOCs, tasks, captures, source images and unrelated findings remain. Concurrent edits invalidate the confirmation. Interrupted storage writes use the existing recovery journal. Bulk clear is intentionally deferred.

No new permissions, host patterns, cloud services or schema version. Exact string IDs, bound content owners, conditional two-second Instagram readiness, five Recents, frozen filing, immutable originals, manual image edits, query-free external searching and separate local Reference remain.

See [Testing](TESTING.md), [Product Audit](PRODUCT-AUDIT-1.8.17.md), [R10 acceptance](R10-ACCEPTANCE-1.8.17.md) and [Future Plans](FUTURE-PLANS.md). Live Yandex paste and TinEye file upload returned results with a fictional blue triangle. Google reached its unusual-traffic check; it was not bypassed. Other providers are listed separately in [the matrix](REVERSE-IMAGE-PROVIDERS.md).

## Install, update and rollback

Download the extension ZIP only. Close Gather/captures, keep a private backup and the old ZIP, then replace all files in the **same installed account-id-tool folder**. Open edge://extensions and Reload Gather; confirm 1.8.17. Do not uninstall or clear storage. New installations use Developer mode → Load unpacked where organization policy permits.

The same-folder 1.8.16 update is tested using fictional storage. Keep 1.8.16 and a matching pre-update backup for rollback; verify a restore in a separate profile before using it for work. Reference has a separate collection export/import. Existing backups/exports and clipboard/browser history are outside local deletion.

This is a coworker-pilot release candidate. Linux Edge testing does not certify managed Windows installation, signed-in live platforms, Windows scaling, native side-panel invocation, OS dialogs or every work application's clipboard. Protected sources may fail and dynamic captures may be partial. No universal guarantee or legal certification.
