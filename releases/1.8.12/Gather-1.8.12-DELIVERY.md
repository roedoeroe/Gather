# Gather 1.8.12 — local workflow hardening

**Development checkpoint; R4/native Edge verification is pending.** The newly supplied R4 reports signed-in Instagram and selection-width issues not reproduced in this cloud. This package preserves tested hardening and does not claim those issues or the R4 redesign are complete. See gather/docs/R4-WORKFLOW-RECONCILIATION.md.

Use **Gather-1.8.12-extension.zip** for the runnable extension. The development ZIP contains source/tests/docs, not case data. Source remains public on develop/1.8.0-r3; main is unchanged. 1.8.11 remains an immutable tested checkpoint. Downloads are pinned to the source/package commit in the follow-up verification receipt.

## Changes

Anonymous public profile requests omit cookies; the same tested parser extracts IDs inside the requested page's isolated world and returns only bounded structured results. Automatic source reading, normal user-invoked browser fallback, exact string IDs and project-free lookup remain. Local/session storage access is restricted at worker startup; messages and preference fields are validated. No additional permissions or cloud endpoint.

Capture, manual red arrows/circles/black redactions, selected-image copy/save, case/scan history, backups and guarded deletion keep their workflows. Page helpers no longer receive friendly case destination labels. Backup and clipboard wording describes where data goes; list filenames omit friendly batch names. The package gate rejects common private files/credential patterns and stale generated code before building.

## Validation

191 Node tests; 105 rendered workflow groups; 10 actual worker groups; five actual Chromium isolated-world groups. Sixteen image-tool groups repeated at 2× scale. Chrome APIs/network in these tests are controlled fixtures. Extracted package passed 191 Node + 24 toolbar + 10 worker + five isolated-reader groups; all 80 final runtime files match the tested extraction. CRC/SHA-256 and unchanged 1.8.11 packages verified. Public history/candidate pattern scans found no findings; scanner cannot classify names/proprietary prose/image pixels. See gather/docs/HARDENING-REVIEW-1.8.12.md and TESTING.md.

Native extension installation remains blocked by this cloud machine's administrator policy (exit 2, zero native tests), so installed Edge toolbar permission, clipboard and OS dialogs remain unverified here. No new live-platform run in 1.8.12. This is not a security or legal-compliance guarantee.

## Install / update

Extract to a permanent folder. In edge://extensions or chrome://extensions, enable Developer mode and Load unpacked → account-id-tool. For an existing installation, finish work, keep the previous folder/package and optionally create a private backup, replace **all files in the same installed folder**, then Reload and confirm 1.8.12. Do not uninstall or clear extension storage. Reload releases Ephemeral Case session fields; deliberately saved records/images remain.

## Rollback

Keep the 1.8.11 package and its matching pre-update backup. Validate rollback in a separate clean browser profile, then replace the installed folder only when the matching backup is available. Do not restore a newer backup into an older validator blindly; pre-1.8.11 versions may reject query-free legacy search references. Gather cannot recover forgotten ephemeral values after restart.

## Limits / next work

No case upload, sync or analytics. Search/profile services still receive explicit user requests; reverse-image providers receive images only if the analyst uploads on their sites. Case storage and .gather backups are not application-encrypted. Backups include original pixels. Deletion is logical: downloaded/shared files, browser/provider history and clipboard history remain outside Gather. Manual redaction only. Full-page bounds and unsupported nested scrollers/custom roots remain documented.

Next priority: permitted installed Edge checks, followed by organization-specific access/retention/distribution review. Existing Quick Parts and research backlog are retained; no new feature expansion in this hardening release.
