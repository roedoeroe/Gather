# Gather 1.8.7 — clipboard review stabilization handoff

## Resume safely

Runnable source is `gather/account-id-tool`; manifest/package/version_name are **1.8.7**. Branch remains **develop/1.8.0-r3** (historical name); main remains unchanged. Inspect current status/HEAD, instructions and this handoff before editing. Preserve newer edits, original 1.6.1 package and completed release ZIPs. The independent `releases/1.8.7/Gather-1.8.7-DELIVERY.md` records final source/package commit, pinned downloads and hashes. The previous handoff is preserved under history/1.8.6-NEXT-RUN-HANDOFF.md.

The latest user asked to resolve the confusing cloud setup dialog and complete useful next development steps. This is a narrow fixes-only release of existing clipboard actions, retaining the capture/privacy stabilization. Keep real case data and proprietary materials out of public source/fixtures/packages; use deterministic fictional data. Development-branch publication is authorized; no main merge or repository visibility change. No agent delegation is needed.

## Fixed in 1.8.7

- Role account blocks retain Candidate/Confirmed analyst decisions, reviewed case/scan/role, exact string IDs and original observation dates. Rejected associations remain omitted. Separate observations across scans are retained with their scan names; none becomes an identity conclusion.
- Account and coverage previews compare relevant source snapshots before Copy. Observed association/observation/coverage/context changes invalidate the preview, release its text and disable Copy. Another workspace deleting the case also releases its text.
- Global destination changes preserve the originally reviewed preview scope. Another same-named case is not selected by name.
- Cancel during delayed validation prevents subsequent clipboard dispatch. Dialog closure, immediate Copy validation and relevant storage/binary broadcasts are guarded.
- Clipboard denial appears visibly inside the modal, selects text for Ctrl+C/Cmd+C and permits Retry. The dialog reflows at 400px.

No new feature surface, browser permission, runtime dependency or schema migration. New helper `case-clipboard.js` is UI-only; worker graph remains static. Existing lookup, source/capture filing, binary image recovery, originals/derivatives, late-write guards and red privacy controls remain.

## Existing product and limits

Quick Lookup is case-free: profile → Gather → inspect/copy. Five adapters retain exact string IDs; X is search-only. Missing markup stays technical; Retry preserves rows/origin. Public source does not publish installed user records. Case data is local, with no case server/cloud sync/analytics/passive collection or inferred identity/threat conclusions. Explicit searches/lookups contact chosen services; exports create separate files.

Toolbar Select area & copy plus Full page/Visible area/Select area shows the scan and optional subject. The panel is optional. Capture scope freezes at launch; reliable browser-provided opener/explicit assignments carry context, never timing/name/URL guesses. Originals/tiles and selected derivatives remain separate IndexedDB assets; redacted sharing excludes originals. Save image, folder export and Saved in Gather are separate states. Folder denial retains bytes and Retry; Downloads does not provide arbitrary roots. Print/PDF is a bounded native preview, not a generated PDF engine. History browses exact case/scan/subject IDs without retargeting filing.

Workspace remains Research / Captures / Case / Settings. New case needs no intake. Red typed-name case deletion, recent lookup clearing and scoped capture deletion are logical removal from Gather. Clipboard, browser history, exported files, prior backups and already-dispatched external operations remain outside deletion. Binary backups include original/unredacted images and are not encrypted. Ephemeral session names are intentionally released on extension reload/browser restart; saved URLs/titles/notes/pixels can contain names.

## Verification

**132 Node checks; 85 rendered groups** (21 capture, 22 toolbar, 18 case/privacy, 10 stabilization, 7 case clipboard, 7 installed-runner interface); **10 actual Chromium worker groups** passed. Seven new clipboard groups failed against 1.8.6 before the fixes and passed afterward. [Evidence](evidence/1.8.7/README.md) distinguishes fixture APIs, real DOM/ordinary clipboard/IndexedDB/worker behavior, visual inspection and package checks. Native installed-extension and live-platform verification remains unperformed; no zero-test run counts as a pass.

The cloud Chromium administrator blocks all unpacked extensions with ExtensionInstallBlocklist ["*"]. Do not repeat identical prohibited loading, install another browser to evade it or weaken policy/sandbox/TLS. The installed smoke runner detects the policy, records blocked/exit 2/zero native groups and uses current controls on a permitted environment. It is not native toolbar/activeTab/screenshot/OS-dialog acceptance. See BROWSER-TEST-BLOCKER and LOCAL-ACCEPTANCE. These restrictions do not establish failure of the user's installed Gather.

## Cloud setup and delivery

The cloud “Configure setup instructions” dialog expects **Done**. **Install script — Not set** is intentional: no runtime install is required. Start skill is the saved agent guide; it is not an extension/plugin installation. Review/save then Publish environment in the app to preserve the prepared workspace. Draft saving does not execute, publish or prove fresh-task restoration. It cannot remove managed browser policy.

The repository draft should select the actual verified development HEAD at mount Gather, rather than main's README-only checkout. The official documentation cache under artifacts/chrome-docs-repo is not a product repository. Repository membership/startup guide are updated; network, credentials and install script stay unchanged. Existing checkout is isolated; no worktree needed. Node 24/Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151 support the documented suites. Harnesses own/close temporary servers and profiles; no live process must survive restoration. Read-only Git and authorized branch pushes use injected platform authentication.

Update in the same installed folder: finish captures/exports, optionally back up, close Gather windows, replace all files, Reload and confirm 1.8.7. Do not uninstall/clear storage. Preserve 1.8.6 and its matching pre-update backup; verify rollback in a separate clean profile before touching the current installation. Versioned Git ZIP mirrors are delivery, not a claimed GitHub Release object.

## Narrow priorities

1. Run actual installed toolbar/selection/copy/save/print/focus/zoom/cancellation/backup checks in a permitted browser. Fix reproducible native failures first; keep automated/mock/native/live evidence separate.
2. Protect current lookup/capture/privacy/clipboard regressions. No broad new capture rewrite.
3. Quick Parts / Reference Library remains the next separately versioned feature checkpoint under PRODUCT-DIRECTION and QUICK-PARTS-DIRECTION: generic local import/replace/remove, fast search, typed preview, deliberate Copy before composer/suggestions. No AI/email sending and no proprietary content in public fixtures.
4. Keep worthwhile original goals in GOALS-AUDIT: Save selected batch results, reviewed confirmed-identifier scan carry-forward with new coverage, field-level provenance/adapter diagnostics and reusable analyst-owned queries. The earlier candidate/confirmed clipboard-label gap is now fixed; the broader documentation engine is not shipped.
5. Nested scrollers, custom roots, richer annotations, sanitized closure and broader saved-work search remain later bounded work; do not silently claim them or expand this stabilization run.
