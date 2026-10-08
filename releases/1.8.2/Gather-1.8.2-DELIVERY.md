# Gather 1.8.2 delivery

Source commit: `13db06de81bce578e5a0ba4f1aef3739329bd0cd` on `develop/1.8.0-r3`. Public source repository retained by user choice. Main unchanged at `e721d70807062e5e1b1df4b94b6f7059eca5e308`. Case data is stored locally; this source package contains only fictional fixtures/evidence.

- `Gather-1.8.2-extension.zip`: loadable extension, 142,358 bytes.
- `Gather-1.8.2-development.zip`: source, tests, documentation/evidence, 6,489,105 bytes.
- Both ZIPs verified for CRC, manifest/package version and byte-for-byte correspondence with source.

## Evidence

118 Node tests; 19 capture, 18 case/privacy rendered browser groups; 9 actual Chromium service-worker groups passed. Chrome APIs are controlled doubles. Native installed extension testing remains blocked by administrator policy; live platforms were not tested. Current evidence: `gather/docs/evidence/1.8.2`.

## Update and rollback

Extract into a permanent folder; Load unpacked its `account-id-tool` directory for a new install. For an update, preserve the installed folder, optionally back up, finish captures and close Gather windows, replace all files at the same installed directory path, then Reload and confirm 1.8.2. Do not uninstall or clear browser storage. Reload releases Ephemeral Case session names/values; saved findings/images remain.

Rollback with the older source and its matching pre-update backup in a separate clean browser profile. Keep the current profile until recovery is verified. Older builds lack the new privacy guards. Deletion without backup cannot be undone.

## Privacy controls

Workspace → Data & Privacy: red Delete case… (typed name, optional backup) and Clear recent lookup history…. Clear history preserves saved cases/images and rejects stale writes; case deletion preserves unrelated cases. Neither removes browser history, clipboard, downloaded files or external records. Logical deletion is not forensic erasure. Searches/profile lookups still contact the sites you choose.

Native acceptance checklist: `gather/docs/LOCAL-ACCEPTANCE.md`. Next milestone is native Chrome/Edge acceptance of this package; nested scrolling/custom folders/live adapter expansion remain deferred.

## SHA-256

```
5819bf861812dbb88a0fd36700ca10347f2b2ac68b811547e34216eed0643559  Gather-1.8.2-extension.zip
487ecc6784311a3fea91b6fdad35ff18487f94ba88c5ca2dc2ccfc29889958b9  Gather-1.8.2-development.zip
```
