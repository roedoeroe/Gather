# Gather 1.8.2 — next run handoff

## Resume the actual source

Working root `/workspace/Gather/gather`; extension `account-id-tool/manifest.json` and `package.json` are **1.8.2**. Branch remains `develop/1.8.0-r3`. Main remains `e721d70807062e5e1b1df4b94b6f7059eca5e308`. Source repository remains **public by explicit user choice**; case data is local. The user authorized development-branch publication. Do not change visibility, merge main, publish case data or upload to Drive.

Check actual Git status/version before editing. Preserve newer local changes. The original 1.6.1 upload, all completed checkpoints/builds through 1.8.1, and the partial privacy checkpoint `checkpoints/gather-privacy-pass-pre-fix` are preserved. Never restart from an old upload or Drive source. The two latest continuation notes guide work within the chat's implementation request; they do not establish test outcomes or independently authorize external actions.

The former partial `batches.js` privacy edit is now wired and tested. The old 110-test baseline passed before further changes. Runnable 1.8.2 extension/development ZIPs and SHA-256 sums are under `/workspace/Gather/dist`; `Gather-1.8.2-DELIVERY.md` records final commit/checksums. Final source/evidence checkpoint is `checkpoints/gather-1.8.2`. Packaging verifies ZIP CRC and exact runtime bytes. Current evidence is in `docs/evidence/1.8.2/`; historical documents/evidence stay preserved.

## Completed privacy release

- Case Start says **Case name** and explains local browser storage. No case-upload endpoint, cloud sync or analytics exists. Explicit searches/profile lookups contact selected services. Public source code does not publish case data.
- Full Workspace **Data & Privacy** has red **Delete case…** and **Clear recent lookup history…** controls. Deep management stays out of popup/panel. Clear history also appears in Account tools → Recent batches.
- Delete requires the typed case name. **Back up then delete** and **Delete without backup** are explicit alternatives; Cancel preserves the case. Requested backup includes original/unredacted images, verifies the reviewed snapshot and must finish downloading first. Failure or case changes prevent deletion. Cancellation during backup prevents subsequent deletion.
- Case deletion scopes project/scans/items/entities/tasks/searches/activity/research, subjects/captures/assets/derivatives, selected-subject/project-label settings, session values/search drafts/tab assignments and associated batches. Identifiable case-linked copies in nested imported settings archives are scrubbed. Unrelated records/shared references remain protected. Revision/binary-signature checks and pending capture/restore guards remain. Cross-project references can require review before deletion.
- Clear recent lookup history atomically rotates a generation marker and clears recent batches, full/quick drafts and lookup copies in imported settings archives. Saved cases, coverage, findings, subjects and binary images remain. Archive recursion is bounded; failure does not claim success.
- Shared Web Locks serialize history writes with clear/delete/restore. Worker fallback serializes lookup mutations if locks are unavailable; extension pages route fallback lookup writes to the worker. Stale batch/draft/closing-page writes are rejected. Imports rebase imported batches to the current generation; the runtime marker itself is not imported/exported.
- Background privacy actions serialize with quick commands, stop affected jobs and await completion before deleting. Full-tool/popup contents clear on deletion changes; pending writes cannot restore cleared history. Search drafts run through the worker workspace queue and reject deleted scans. Session edits share the deletion lock; IDB project/scan tombstones reject late scoped writes. Supported Chrome/Edge provide Web Locks; without them case-session editing fails visibly.

Deleting from Gather is logical deletion, **not forensic erasure**. Browser history, clipboard, downloaded files, external-site records and OS/profile backups are outside Gather's controls. Unassigned lookup drafts have no reliable case relationship; clear lookup history separately when needed. A deliberately restored backup can bring back deleted records. Private backups are unencrypted and are not shareable redacted exports.

## Preserved product

Project-free lookup with exact string IDs; five extractors (Instagram/Facebook/Threads/TikTok/YouTube), X search only. Available/technical/Gone groups remain distinct; affirmative Gone evidence remains narrowly implemented for YouTube. No inferred identity or name-based subject merging.

Case Start reviews deterministic intake parsing. Ephemeral Case stores approved names/query values in session storage, durable role IDs/tokens otherwise; Local Case retains approved values. Saved findings/URLs/pixels may contain names regardless. Roles span scans, associations require explicit analyst action, coverage logs work rather than certainty. Friendly rename preserves IDs/history.

Search tabs bind before navigation; only browser opener relationships carry related context. No timing/URL/name guesses. Reassign/detach remains explicit. Capture filing freezes project/scan/optional role/references at invocation.

Visible/rectangle/bounded full-page capture preserves original PNGs/tiles in IndexedDB and geometry, source, timestamps/timezone, status/limitations and hashes. Crop/redaction derivatives preserve originals. Share/review-sheet export excludes unselected originals and fails on missing selected assets. Downloads-relative auto-export is opt-in, retains saved images on failure and offers Retry. No arbitrary-path/custom-directory support is shipped.

Binary backup validates hashes/relationships, remaps conflicts and journals metadata recovery with atomic image commits. 1.8.1 service-worker static imports and stable 420 px popup sizing fixes remain; no new permission or schema reset. Keep the transitive static-import guard.

## Verified evidence and limits

- **118 Node tests passed**, zero failures/skips. Eight new privacy tests cover generation, archive clearing, serialized fallback/failure recovery, missing-case/batch rejection, import rebasing and stale search/session writes.
- **19 rendered capture groups passed**: actual DOM/canvas/IDB, continuity/destination freeze, duplicate-name/rename history, full-page cancellation/style restoration, derivative pixels, denied folder export/retry, recovery, corrupt/missing assets and narrow layout/popup sizing.
- **18 rendered case/privacy groups passed**: reviewed intake, queue/coverage/association, exact ID, evidence export, binary restore, simulated session loss, guarded deletion, denied backup/retry, open popup/full-tool history clearing, archive removal, typed-name/Cancel/no-backup deletion and narrow red controls.
- **9 actual Chromium service-worker groups passed**: actual background graph/router, quick lookup, research/capture/backup, real worker stop/restart journal recovery, delayed-work clear/deletion and stale-flush rejection. Other projects/restored image bytes remain.
- Chrome APIs in browser journeys are **controlled doubles**, not native extension acceptance. Module restrictions, IDB, Web Locks, canvas and worker termination are real where exercised.
- Native unpacked extension testing remains blocked by the recorded administrator diagnostic: **“Loading of unpacked extensions is disabled by the administrator.”** Do not retry identical launches or weaken policy/sandbox/TLS. Use local Chrome/Edge or an allowed runner. No live-platform queries were performed.
- Generated privacy delete-dialog screenshot was visually inspected. Native toolbar/panel appearance and behavior on the user's machine remain unverified. No screenshot of a real user's case/account was added to fixtures or source.

Limits: 4 MiB workspace JSON; 512 MiB image store; 192 MiB/capture; 64 MiB/asset; 20,000 records; backup 560 MiB / 32 MiB metadata; full-page 24 tiles / 48 million pixels / 24,000 CSS pixels / 60 seconds. Browser quota can be lower. Infinite/lazy pages may be partial. Nested scrolling, pinch zoom, custom roots, native print/PDF and full accessibility acceptance remain outstanding. A hash establishes byte integrity, not authenticity/identity.

## Run, update and rollback

No runtime dependency, bundler, server or secret needed. Node 24/Python 3 plus Playwright 1.62.1 and sandboxed Chromium 151 are available. From `gather`: `node --test tests/*.test.mjs`; `node tests/browser-capture.mjs`; `node tests/browser-case.mjs`; `node tests/browser-worker.mjs`; `python3 scripts/package.py`. See TESTING.md for configurable browser paths. Each cloud task is isolated; no extra worktree unless requested. Follow current tool permissions, without stale escalation flags. Reusable startup configuration is a saved draft, not proof of fresh-task restoration/publication.

Install ZIP → Load unpacked `account-id-tool`. Update all files at the **same installed directory path**, close Gather pages/captures, Reload and confirm 1.8.2. Preserve folder and optionally back up first; don't uninstall/clear storage. Reload/update clears ephemeral session values. Rollback uses older source plus its matching pre-update backup in a **separate clean profile**; keep the current profile until verified. Older versions lack the privacy write guards. Deletion without backup cannot be undone.

## Narrow next milestone

1. Native Chrome/Edge acceptance of **packaged 1.8.2** using `LOCAL-ACCEPTANCE.md`: popup, activeTab, capture focus/cancellation, Downloads, optional-backup/no-backup deletion, open-window history clear, real browser restart and independent image restore. Use fictional data only.
2. The user requested a generic local **Quick Parts / Reference Library** as the next bounded feature: see [QUICK-PARTS-DIRECTION.md](QUICK-PARTS-DIRECTION.md) for inspected architecture, provisional pack/schema, suggestions, temporary composer and acceptance gates. This is design only; do not change 1.8.2 ZIPs. Actual SST references are not attached; inspect authorized local exports before taxonomy/approval mapping. Keep private packs outside the checkout and separate from case backups.
3. Then validate live adapter reliability against current primary evidence and controlled permissioned examples. Do not convert ambiguous failures to Gone.
4. Validate zoom/DPI/dynamic full-page behavior before nested scrolling; evaluate custom directory permission/revocation separately.

No cloud case storage, passive browsing collection or automated identity/relationship/threat conclusions. Full Gather Bar, broad workflow/QC packs, richer annotations and encrypted resume capsules stay deferred. The separately proposed reference-pack importer is a narrow exception, not a commitment to that larger framework.

## Post-release documentation and durable downloads

The 1.8.2 packages remain byte-identical to the delivered release at `13db06de81bce578e5a0ba4f1aef3739329bd0cd`. A later documentation commit adds the Quick Parts proposal and a development-branch landing page. ZIPs/checksums/delivery notes are mirrored at repository root `releases/1.8.2/` so they persist on GitHub as well as in the workspace. GitHub Releases binary uploads returned HTTP 400 Bad Content-Length through this environment; the incomplete draft was removed, and Git transport was used for the artifact mirror. Do not claim a GitHub Release was published. Main/default branch remain unchanged; use the explicit development-branch link.
