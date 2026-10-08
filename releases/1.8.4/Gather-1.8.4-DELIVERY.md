# Gather 1.8.4 delivery

Source/package commit: [da107b1](https://github.com/roedoeroe/Gather/commit/da107b1109c39315dbf5a3cc0fc1ca54071322c3). Branch: `develop/1.8.0-r3`; main unchanged. This receipt is separate so a package does not attempt to include its own commit hash.

## Downloads

- [Runnable extension ZIP](https://github.com/roedoeroe/Gather/raw/da107b1109c39315dbf5a3cc0fc1ca54071322c3/releases/1.8.4/Gather-1.8.4-extension.zip)
- [Source, tests, documentation and fictional evidence](https://github.com/roedoeroe/Gather/raw/da107b1109c39315dbf5a3cc0fc1ca54071322c3/releases/1.8.4/Gather-1.8.4-development.zip)
- [SHA-256 checksums](Gather-1.8.4-SHA256SUMS.txt)

## Changes

Three direct toolbar screenshot actions with visible scan/optional subject filing. No side-panel switch required. Destination snapshots survive a changed workspace default; explicit reassignment/detachment remains. Saved screenshots have readable-width/whole-image views, direct original-scan navigation, editing and export/retry. Selection supports pointer drag and optional keyboard coordinates. Original bytes/tiles stay preserved.

Fixed workspace fragment authorization, linked-capture initialization, browser version label, false blanket sign-in advice, substituted current-page reads, failed-input clearing and compressed popup result rows. Existing four-view workspace and red scoped deletion/history controls remain. No new permissions, migration, runtime dependency or case upload. Reference Library R3 is incorporated into the bounded next-feature contract, not shipped prematurely.

## Validation

123 Node tests; 21 rendered capture/UX, 11 toolbar/lookup, 18 case/privacy and 9 real Chromium worker groups passed. Browser Chrome APIs are controlled doubles; real DOM/canvas/IDB, clipboard and worker lifecycle are used as documented. New journey clicks every toolbar mode, drags selection, preserves SEO 6/Alex after SD 73 switch, opens the exact image/scan, verifies export/backup foundations and exercises actual current-page retry/exact-ID copy with live network disabled. Actual fictional rendered screenshots were visually reviewed. Native installed-extension acceptance remains blocked by recorded administrator policy; live platforms untested. See [evidence](../../gather/docs/TESTING.md) and [native checklist](../../gather/docs/LOCAL-ACCEPTANCE.md).

ZIPs passed CRC/source-byte/manifest checks. Previous 1.8.3 ZIP checksums remain unchanged. No uploaded user recording/screenshots or organization reference material was packaged.

## Install, update and rollback

New install: extract to a permanent folder; Extensions → Developer mode → Load unpacked → select `account-id-tool`.

Update: optionally back up, finish captures, close Gather windows, replace all files at the **same installed path**, Reload and confirm **1.8.4**. Do not uninstall or clear storage. Reload releases ephemeral session values; deliberate findings/images remain.

Rollback: keep [1.8.3](../1.8.3/Gather-1.8.3-extension.zip) and its matching pre-update backup. Validate it in a separate clean browser profile before touching the current installation. Backups contain unredacted originals and are unencrypted; deletion without backup cannot be undone.

## Limits and publication

Native activeTab/toolbar/panel/window-focus/download permissions and current live-platform markup need acceptance on permitted Chrome/Edge. Full-page capture remains bounded and may be partial on dynamic/infinite pages; nested scrolling/custom roots are unshipped. Hashes verify bytes, not identity/authenticity. Browser history/clipboard/exported files are outside Gather deletion.

Delivery uses versioned Git ZIP mirrors, not a GitHub Release object. Previously blocked Release uploads were not retried. Case data stays local; public source uses fictional tests only. Cloud startup draft persistence, environment snapshot publication and fresh-task restoration are separate from GitHub publication.

## Checksums

```text
bb99b0c8b5d1645eb881a2f594252a3b4b20f302d94f4cead2877ede4b088695  Gather-1.8.4-extension.zip
7e5fb1995bd9e3b5d983648ca948f54316f3983fba05efe866d8207150882f4b  Gather-1.8.4-development.zip
```
