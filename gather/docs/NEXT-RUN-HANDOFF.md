# Gather 1.8.6 — stabilization handoff

## Resume safely

Runnable source: `gather/account-id-tool`. Manifest/package/version_name: **1.8.6**. Maintained branch: **develop/1.8.0-r3** (historical name). Inspect actual HEAD/status, instructions and this handoff before editing; preserve newer user changes. Exact source/package commit, downloads and hashes are in the later, separate `releases/1.8.6/Gather-1.8.6-DELIVERY.md` receipt. Prior ZIPs remain immutable.

The user's last runtime instruction was a finalizing/testing run: no new features unless required for a concrete fix. This release implements that scope. The subsequent request audits goals across the conversation; see [GOALS-AUDIT](GOALS-AUDIT.md) for implemented, partial, retained and superseded work. The audit changes documentation only and does not repack 1.8.6. Development-branch publication is authorized, source stays public, case data local, and main stays unchanged. Uploaded private reference documents/recordings remain outside public source/packages. Use fictional fixtures only. No subagent delegation is required.

## Existing product, retained

Quick Lookup remains project-free: open a profile → Gather → inspect/copy. Instagram/Facebook/Threads/TikTok/YouTube IDs remain exact strings; X is search-only. Current-page lookup uses observed tab data, not a fetched substitute. Missing markup remains technical; Retry preserves its batch/origin. Gone/identity rules remain conservative.

Toolbar has **Select area & copy**, Full page, Visible area and Select area beside a visible Save to scan and optional subject. Side panel is optional. On-page drag/release or keyboard coordinates removes the overlay before capture. Source tab/URL/document/scroll/viewport/DPR checks prevent other-tab pixels; pinch zoom is unsupported. Original viewport/tiles and crop/redaction derivatives are separate assets in IndexedDB. Acquisition freezes project/scan/subject/references; browsing/default changes do not redirect it.

Completion offers Copy, PNG/JPEG Save image, local Print / Save PDF, editing, folder export, View in scan and history. Downloads folder export produces image + source/hash record and has separate state/retry. Save-as does not mark folder export complete. Print is a bounded native-print preview, not a generated PDF container. Captions are outside original pixels. Original byte hashes check integrity, not authenticity/identity.

Workspace sections are Research / Captures / Case / Settings. History browses scan/case/all cases/subject with exact-ID grouping, twelve initial cards and optional filters. Browsing never changes filing. Red individual/selected capture deletion and typed-name case deletion are guarded; clear recent lookup history preserves saved work. Ephemeral values are session-only; deliberately saved URLs/titles/pixels may contain names. Binary backups preserve relationships/images and include unredacted originals; they are not encrypted.

## Fixed in this run

- Queue capture finish after launch to prevent a finished controller leaving a stale acquisition lock. Internal window-close release avoids nested queue deadlock.
- Release after durable image commit, before preview/focus. Preview errors retain the image and recover on focus.
- Disable/clear stale print previews after edit/delete, validate explicit Print, and guard stale editor saves with expected shareAssetId.
- Recheck clipboard selection after PNG conversion. Copy/save/print never silently substitute an original for a missing expected derivative.
- Claim folder-export ownership atomically across windows; guard each dispatch and final/failure write with attempt ID. Old interrupted work cannot overwrite a newer retry. Current folder state broadcasts across views.
- Editing and case/capture deletion wait for active export. Healthy two-file downloads are not expired at two minutes; recovery waits five minutes and checks the observed snapshot.
- Binary restore makes orphaned exporting jobs retryable and remaps exported asset references; original bytes remain unchanged.
- A deletion during delayed output keeps completion image actions disabled and its preview revoked.

No features, permissions, dependencies, network service or schema migration added. Static worker imports, privacy generations/locks, deletion tombstones, original pixels, exact IDs and workspace/binary journals remain.

## Validation and evidence

Untouched baseline: **129 Node, 61 rendered-browser, 10 worker groups**; both 1.8.5 ZIP CRC/source bytes/checksums verified. Release: **130 Node checks, 21 capture/UX + 22 toolbar/capture/lookup + 18 case/privacy + 10 stabilization groups (71 rendered total), and 10 actual Chromium worker groups**, zero failed/skipped. Tests rerun after the final restore change. See TESTING and evidence/1.8.6 for logs/results/screenshots and extracted-package verification.

One Node and nine browser regressions reproduce against preserved 1.8.5. An additional restore-during-export regression fails before that fix. Real DOM/canvas/IndexedDB/BroadcastChannel/clipboard/Web Locks and worker stop/restart are exercised; Chrome APIs are controlled doubles. Failure gates are explicitly mocked. Counts do not include reruns twice.

Native extension acceptance remains blocked: prior administrator denial and current ExtensionInstallBlocklist ["*"]. No policy/sandbox weakening or identical launch retry. Native activeTab, screenshot API/rate, window focus, clipboard/save/print permission UI, true browser zoom/high-DPI, browser reset and Edge need LOCAL-ACCEPTANCE on an allowed installation. Live platforms/native FireShot were not tested.

## Narrow backlog

1. Execute LOCAL-ACCEPTANCE on permitted Chrome/Edge using this exact package, including simultaneous editors/export windows, stale print preview, selection/copy, delayed deletion, high-DPI/zoom, source switches, cancellation/restoration and private backup restore.
2. Fix only reproducible acceptance failures. Preserve this working checkpoint and record automated/mock/native/live evidence separately; do not call it universally perfect.
3. Feature direction remains separate under PRODUCT-DIRECTION / QUICK-PARTS-DIRECTION: generic local Reference Library first, then richer capture editing/nested scrollers/custom roots based on evidence. Do not expand the stabilization run or import proprietary reference content into public fixtures.
4. Preserve the older worthwhile goals restored in GOALS-AUDIT: selected batch saving, confirmed-identifier scan carry-forward, field-level provenance/diagnostics and reusable query recipes. Current per-row saving/manual new scans/method metadata do not complete them. Previewable documentation blocks, sanitized archive and baseline comparison are later bounded work. Do not silently drop these again or treat conditional blueprint ideas as release blockers.

## Latest intent reconciliation

The audit read the unique supplied handoff/continuation/design guidance and R3 blueprint text, compared current models/UI/export code and saved evidence, and verified package integrity without changing runtime bytes. Quick Parts remains design-only; native/live acceptance remains unverified. Role-ID export folders supersede the earlier friendly-name default. Source-public/case-local, explicit association, no passive collection and no automated threat/identity conclusions remain unchanged. The unrelated creative-video request was withdrawn and is excluded.

Current docs include the new audit and refinements to the Quick Parts contract; the already published development ZIP is the immutable release snapshot and does not contain these later documentation updates. Fetch the development branch for the latest docs. No new version, runtime test run or GitHub Release object is implied by this documentation pass.

## Environment and delivery

October 8 follow-up: diagnosed the installed-test block against the current machine and official Chromium policy, reran 130 Node / 71 rendered / 10 worker groups, and repaired stale installed-runner controls. Seven shared UI groups passed separately with API doubles; installed preflight correctly reports blocked/exit 2/zero native groups without launching. See [BROWSER-TEST-BLOCKER](BROWSER-TEST-BLOCKER.md) and [fresh evidence](evidence/browser-blocker-2026-10-08/README.md). Runtime/package bytes remain unchanged. ENVIRONMENT-SETUP is now current; a startup draft cannot override managed browser policy. Keep user explanations concrete: this restriction is in the cloud test machine, not evidence their Gather installation is broken.

Use this isolated checkout; no new worktree unless requested. Node 24/Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151 `/usr/lib/chromium/chromium` support the documented six suites and Python packaging. No runtime install/server/bundler is needed. Harnesses manage temporary servers/profiles; no process must survive restoration. Ignore artifacts/chrome-docs-repo as an official documentation cache, not another Gather source.

If a restored environment has main without gather, preserve edits and fetch/switch to the existing development branch without reset. Use platform HTTPS Git proxy authentication. Do not extract credentials or repeat permission requests. GitHub Release uploads previously returned 400 Bad Content-Length; versioned Git ZIP mirrors are the successful route. Git source publication, saved startup draft and cloud snapshot publication remain different actions.

Update the same installed folder: finish captures/exports, optionally back up, close Gather windows, replace all files, Reload and confirm 1.8.6. Do not uninstall/clear storage. Reload releases ephemeral session values; saved findings/images remain. Preserve 1.8.5 and its matching pre-update backup; verify rollback in a separate clean profile before touching the current installation. External clipboard, browser history and downloaded files remain outside Gather deletion.
