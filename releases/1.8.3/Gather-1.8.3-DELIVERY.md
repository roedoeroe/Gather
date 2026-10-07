# Gather 1.8.3 delivery

Source/package commit: [6944ecf](https://github.com/roedoeroe/Gather/commit/6944ecf5ab945bb1e4edeae3703008eaafbfa295). Development branch: `develop/1.8.0-r3`; main is unchanged. This receipt is committed separately so a package does not try to contain its own commit hash.

## Downloads

- [Runnable extension ZIP](https://github.com/roedoeroe/Gather/raw/6944ecf5ab945bb1e4edeae3703008eaafbfa295/releases/1.8.3/Gather-1.8.3-extension.zip)
- [Source, tests, documentation and fictional evidence](https://github.com/roedoeroe/Gather/raw/6944ecf5ab945bb1e4edeae3703008eaafbfa295/releases/1.8.3/Gather-1.8.3-development.zip)
- [SHA-256 checksums](Gather-1.8.3-SHA256SUMS.txt)

## Changes

Four stable workspace views (Research, Captures, Case, Settings); preview capture library and focused inspector; optional-intake case creation; compact panel and narrow Library chooser; keyboard/focus improvements. Settings keeps red Delete case and Clear recent lookup history controls. Fixed the note/excerpt textarea editor and a compact-panel refresh exception. No new permissions, runtime dependencies, storage migration or cloud case service. Quick Parts is planned separately.

## Validation

118 Node tests, 21 rendered capture/UX groups, 18 rendered case/privacy groups and 9 real Chromium service-worker groups passed. Rendered journeys use Chrome API doubles and real DOM/canvas/IndexedDB; worker tests use actual ServiceWorkerGlobalScope with Chrome API doubles. Screenshots were inspected. Native installed-extension testing remains blocked by administrator policy; live platforms were not tested. CSS 200% zoom is not native browser zoom. Follow [local acceptance](../../gather/docs/LOCAL-ACCEPTANCE.md).

## Install, update, rollback

New installation: extract the extension ZIP to a permanent directory. In Chrome/Edge Extensions, enable Developer mode, Load unpacked and select its `account-id-tool` directory.

Existing installation: optionally back up all work, finish captures and close Gather windows. Replace all files in the **same installed directory**, then Reload and confirm 1.8.3. Do not uninstall or clear storage. Reload releases ephemeral session values; saved findings/images remain. Keep the old folder/package and matching backup.

Rollback: validate [1.8.2](../1.8.2/Gather-1.8.2-extension.zip) with its matching pre-update backup in a separate clean browser profile; keep the current profile until recovery is verified. Deletion without backup cannot be undone. Backups include unredacted originals and are not encrypted.

## Remaining limits

Native activeTab/toolbar/side-panel/download permissions, browser zoom and live-platform markup need local acceptance. Full-page capture stays bounded; nested scrolling/custom root folders are not shipped. Browser history, clipboard and exported files are outside Gather deletion. No authenticity/identity claim comes from image hashes.

Source and ZIPs are mirrored through Git, not a GitHub Release object. Known Release-upload HTTP 400 errors were not retried. Case data was not published. Cloud startup instructions were saved as a separate environment draft; publishing that cloud snapshot and verifying fresh-task restoration remain user/product actions.

## Checksums

```text
d66536d21f41134869991e2904c2c3357fb2f5ba995494bcebfdd5ae943051f1  Gather-1.8.3-extension.zip
28c8288858a3efaefae9a2b61193d6fab35e952399026a4df18e3b200ee5a553  Gather-1.8.3-development.zip
```
