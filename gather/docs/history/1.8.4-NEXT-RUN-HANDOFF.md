# Gather 1.8.4 — next run handoff

## State and safe resumption

Current runnable source is `gather/account-id-tool`, version **1.8.4** in manifest, package and browser-visible version_name. Branch `develop/1.8.0-r3` has a historical name. Inspect actual HEAD/status before editing; preserve newer user work. Source and development-branch publication are authorized, case data remains local, main/default stays unchanged. The source/package commit is in the separate versioned delivery receipt. ZIPs/checksums live in `releases/1.8.4/` and ignored local `dist/`; keep all prior release bytes for rollback.

The usage interruption did not require restarting. 1.8.3 was preserved and its 118-test baseline rerun. A local pre-toolbar checkpoint remains. The user's recording/screenshots informed this capture release. Optimized Design Engineering Steer R3 was read fully and applied as guidance, with Reference Library recorded as a separate next feature rather than expanding this unfinished release into every phase. Uploaded recording/reference files stay outside the public checkout; do not publish them or turn real case material into fixtures.

## Implemented

Popup: visible Save to scan, optional subject, Full page / Visible area / Select area, View captures, Workspace. Page options contains metadata-only save, explicit default/detachment and optional side panel. It snapshots the displayed tab/project/scan/search/subject; a global default change does not silently alter that snapshot. Explicit scan selection assigns only that tab. Worker launch and metadata save validate the expected source URL and frozen scope. Navigated/deleted contexts fail visibly rather than falling back to another destination.

Screenshot completion: readable-width scrolling image, Fit image overview, source details behind a disclosure, partial warning surfaced, View in scan / Edit image / Export image / Done. Selection is a drag on the acquired screenshot; precise keyboard coordinates remain in a disclosure. Existing acquisition, original PNGs/tiles, derivative redactions, hash verification, folder state/retry and binary storage/recovery remain. No new permission or storage migration.

View in scan encodes only record IDs, validates the requested scan/capture, selects it and opens that exact image. A readiness event avoids racing the old global selection. Worker sender-page validation now strips queries and fragments; extension-ID and allowed-path authorization remain. Inspector Edit/Export are above the readable image. Popup natural scrolling replaces flex compression that could hide account rows; completed lookups bring results into view.

Run on this page now reports the current tab's actual extraction/access result. It does not silently fetch another profile. Retry can re-read the matching active profile, preserving the original batch/row/submitted input/origin. Failed or interrupted input stays available; only finished resolved/gone work clears the entry field. Ordinary challenge libraries/login links no longer cause blanket sign-in guidance. Explicit rendered/structured/redirect evidence gets specific advice; HTTP failures no longer universally suggest sign-in. Missing IDs remain technical, not Gone/private/identity inference.

The 1.8.3 four-view workspace, red scoped Delete case/Clear history, optional backup, keyboard/focus and privacy-write protections remain. Quick lookup stays project-free. Five extractors remain; X is search-only.

## Validation

123 Node tests; 21 rendered capture/UX; 11 rendered toolbar/lookup; 18 rendered case/privacy; 9 actual Chromium worker groups passed. Details and fictional screenshots are in TESTING/evidence/1.8.4. Browser Chrome APIs are doubles. Actual DOM/canvas/IDB, clipboard and worker stop/restart are used as documented. New tests exercise direct modes, selection drag, destination switches, scan/capture deep link, denied access, false-login recovery and retry.

Native unpacked extension acceptance remains blocked by the recorded administrator policy. Do not repeat identical launches or disable sandbox/security; use LOCAL-ACCEPTANCE on permitted Chrome/Edge. Live platform extraction and native activeTab/download/window focus remain unverified. Do not describe rendered screenshots as native acceptance or claim the recording audio was reviewed.

## Next narrow priorities

1. Native acceptance and concrete regressions for this capture release, including current-page lookup on known permitted profiles. Controlled full-page pages precede nested scrollers/custom roots.
2. Follow QUICK-PARTS-DIRECTION, including the R3 engineering gate: generic local pack schema/validator, atomic import/update/remove, focused deterministic search and typed/source-labelled preview/copy for Client Communication and Document Language. Fictional packs unblock development. Keep pack data separate from workspace, captures, case backups and public packages. Checkpoint the complete vertical slice.
3. Temporary block assembly/reorder/edit, explicit placeholders, unresolved-field guard and human-reviewed copy; bounded deterministic suggestions with scope/reasons. No AI dependency, email sending, inferred outcomes, remote index or live OneNote dependency.

No automatic identity/relationship/threat conclusions, cloud case storage, passive collection, custom-root access, nested-scroll capture or entire organization/QC framework is shipped. Stable role/record IDs survive rename. Folder layout remains an export view.

## Environment and update

Use this existing isolated checkout, not a new worktree unless requested. From `gather`, run the documented Node, four browser harnesses and Python packaging. Node 24/Python 3, Playwright 1.62.1 and sandboxed Chromium `/usr/lib/chromium/chromium` are supplied; no service/runtime install is necessary. Preserve static worker imports, generation/locks/queues, tombstones, archive scrubbing, late-write guards, exact IDs, frozen scope, original bytes and restore journals.

Update at the same installed path: finish captures, optionally back up work, close Gather windows, replace all extension files, Reload and verify 1.8.4. Do not uninstall/clear storage. Reload releases ephemeral session values. Rollback: preserve 1.8.3 plus its matching backup and verify it in a separate clean profile before touching the current installation. Backups include unredacted originals and are not encrypted.

Use the platform Git proxy; do not request/extract credentials unnecessarily. GitHub Release-upload HTTP 400 Bad Content-Length was previously diagnosed; Git versioned ZIP mirrors are the successful delivery route. Do not retry the blocked endpoint or imply a Release object exists. Cloud startup draft, environment snapshot publication and GitHub publication are distinct; no fresh-task restoration claim without a separate check.
