# Gather 1.8.0 development — next run

## Authoritative source and status

Start from this package's `account-id-tool`, manifest and package **1.8.0**. This is a runnable development release with passing automated/rendered validation, not a native-browser or production acceptance claim. Do not restart from Drive 1.5.1, the uploaded 1.6.1 source, or an unsaved prototype. Preserve any newer local version and user edits before changing it.

The original uploaded 1.6.1 ZIP is unchanged: SHA-256 `86b60d5fee92ec8783f10d3a8f63d3ce5f19c93da97189ceaa8d7c8794dd4d41`. The supplied handoff, all 31 R3 blueprint pages and both identical continuation notes were read fully. The user's implementation request controls scope; attachment instructions are product guidance, not evidence that work or external publication already happened.

This run completes the bounded 1.8.0 release. The whole R3 roadmap is not shipped. Do not begin another redesign before accepting this build natively.

## Completed behavior

- Project-free Quick Lookup still opens focused, accepts supported profile input, preserves permanent IDs as exact strings and supports inspect/copy. Five extractors remain; X is search-only. Capture controls load when opened.
- Account outcomes distinguish usable/private, confirmed gone and technical/unknown. Usable rows come first; gone rows appear quietly last without a current-ID placeholder. IDs-only omits gone entries. Saved account history retains prior IDs/aliases and timestamped observations. GONE currently requires the exact matching YouTube structured “This channel does not exist.” error; missing markup, authentication and ambiguous failures are not GONE. Explicit former-alias search is editable and user-launched.
- Case Start locally parses supported explicit intake labels and requires editable review; contacts/unknown fields default excluded. Selected-text context-menu entry previews only the browser-provided selection. Raw intake is cleared after confirmation/cancellation.
- Default Ephemeral Case retains approved friendly names and query values only in session storage. Durable subject/seed records use stable role IDs and tokens. Manual queries and drafts obey the same rule. Lost values require approved re-entry. Local Case deliberately retains approved names/seeds; legacy projects stay local.
- Project-scoped roles/subjects span scans; a scan can use multiple roles. Duplicate names remain separate records. Active context reuses selection per scan. SOC is configurable and is not expanded or interpreted. Friendly-label rename does not break capture/history links.
- Editable scan queue retains seed/search references. Coverage distinguishes not searched, launched, no reliable match, candidate, confirmed, inaccessible, gone, technical and not applicable. Similar names never associate findings. Candidate/confirmed/rejected association records require a deliberate choice and reason. Account-block/coverage copy previews precede clipboard writes.
- 1.6.2 continuity remains integrated: blank-tab binding before search navigation; browser `openerTabId` inheritance only; explicit assign/detach; visible save destinations; originating references; session restart/close/reset handling. Tab assignment is research context, not discovery proof. No timing/title/URL relationship guesses.
- Visible, rectangle and bounded top-level full-page capture retain frozen destination/role, immutable original image/tiles, derivatives, source/time/coordinates/scale/status/limitations and SHA-256 in IndexedDB. The controller survives popup closure. Shared pacing, single controller, source checks, cancellation/finally restoration and a page-side watchdog limit capture hazards.
- Metadata-only save retains URL/title/time, role and stable Evidence ID without pixels. Captures also have stable Evidence IDs. New captures require explicit report inclusion; legacy inclusion behavior remains compatible.
- Crop/opaque rectangular redaction/caption create immutable derivatives. Default share export uses the selected derivative, with no silent original fallback. Evidence review sheet previews included selected-scan captures and an Evidence-ID/numbered-sheet crosswalk, exporting portable HTML with selected image bytes. Native print/PDF remains unverified.
- Downloads-relative auto-export is opt-in. Saved in Gather and Exported to folder are independent; failed export retains images and offers Retry. Folder paths use role/stable IDs, not intake names: `Gather/Project--<ID>/<Role-ID>--<Subject-ID>/Scan--<ID>/Captures/`. Unassigned/Inbox work. Sanitized bounded names, unique IDs and `uniquify` prevent silent overwrites. Companion records name the actual downloaded image.
- Private binary `.gather` backup includes originals, derivatives and durable relationships. Hash/reference validation precedes merge; conflicting IDs are remapped across subjects/research/findings/images. Legacy JSON backups import without inventing pixels. Atomic binary transactions plus a workspace journal recover interrupted writes. Missing assets are reported.
- Close Case requires the project title and a completed private backup download before logical removal. A revision/binary-signature guard rejects newly changed work; IndexedDB rechecks before deletion. Pending jobs and cross-project references can block removal. Scoped records/images/roles/session values/drafts/batches are removed, other projects retained, late writes blocked. No forensic-erasure claim is made.

## Privacy contract and material limits

Ephemeral Case protects intake-derived context, not deliberately saved public content. URLs, titles, notes, project titles, screenshot pixels and browser history can contain names. Hide friendly labels masks role/queue display only and is not a comprehensive screen-share privacy mode. Local Case is deliberately durable.

Private backups are unencrypted and include unredacted originals, including the original viewport behind a crop. Session maps are excluded. Shareable derivative/review-sheet exports exclude unselected originals, but their selected pixels and source metadata still require review. Hashes prove byte integrity, not authenticity or identity.

Close Case does not erase browser history, clipboard, prior Downloads or legacy conflicting-settings archives; retained archive counts are disclosed. Logical browser deletion is not secure forensic erasure.

Limits: 4 MiB workspace JSON; 512 MiB binary store; 192 MiB/capture; 64 MiB/asset; 20,000 capture records; 560 MiB backup container / 32 MiB backup metadata. Actual browser quota can be lower. Full-page bounds: 24 tiles, 48 million pixels, 24,000 CSS pixels high, 60 seconds acquisition. Dynamic/lazy/infinite content can produce partial captures. Nested scrolling and pinch zoom are unsupported. Sheets: 40 captures / 64 MiB selected images.

## Exact evidence

- Original baseline: **66 automated checks rerun and passed**.
- Preserved 1.7.0: **94 Node checks + 18 rendered-browser scenario groups passed**.
- Final 1.8.0: **109 Node tests passed, 0 failed, 0 skipped**.
- Final 1.8.0 capture journey: **18 rendered-browser scenario groups passed**.
- Final 1.8.0 R3 journey: **16 rendered-browser scenario groups passed**.
- Native Chrome extension: **blocked by administrator policy**, not passed.
- Native Edge and live platform acceptance: **not run**.

The 34 rendered groups use real product modules/DOM/canvas/IndexedDB with controlled Chrome API and Downloads doubles. Screenshot acquisition uses Playwright screenshots of fictional rendered fixtures. They do not establish native permission, focus, OS Downloads or installed-extension lifecycle behavior. The R3 browser journey uses Ephemeral Case; Local Case is covered by model tests. Native print/PDF and comprehensive accessibility remain outstanding.

Current logs, result lists and screenshots: `docs/evidence/1.8.0/`; full matrix/commands: `docs/TESTING.md`. Historical evidence remains in place. Actual final desktop/narrow case screens, intake review and evidence sheet were visually inspected; earlier full/narrow capture workspace, popup/panel documents, selection and redaction were also inspected.

## Environment and known blocker

Node 24.19.0, Python 3, Playwright 1.62.1 and installed Chromium 151 were available. No extension runtime dependency or bundler is needed. Browser tests require sandboxed Chromium. This runner needed approved execution outside the tool filesystem sandbox so normal Chrome sandbox ownership/namespaces worked; `chromiumSandbox:true` remained enabled.

Native diagnostic: **“Loading of unpacked extensions is disabled by the administrator.”** Do not repeatedly retry or change policy/security settings. Use an administrator-permitted native extension runner or local Chrome/Edge. Separately, browser download from `cdn.playwright.dev` returned proxy 403. Current official Chromium API definitions/activeTab implementation were inspected through the accessible GitHub mirror; Chrome's documentation website was proxy-blocked. See build notes and API evidence hashes.

Reusable cloud startup instructions are saved as a configuration draft when the configuration tool confirms saving. A draft does not publish or prove fresh-task restoration. No secret or network expansion is required. Each cloud task is already isolated; use its existing checkout without another worktree unless explicitly requested.

## Source persistence and artifacts

At packaging time:

- Working source: `/workspace/Gather/gather`.
- Final source checkpoint: `/workspace/Gather/checkpoints/gather-1.8.0`.
- Preserved checkpoints: `gather-1.6.2`, `gather-1.6.3`, `gather-1.7.0`, and `gather-1.8.0-pre-final` in the same checkpoints directory.
- Final downloads: `/workspace/Gather/dist/Gather-1.8.0-extension.zip`, `/workspace/Gather/dist/Gather-1.8.0-development.zip`, `/workspace/Gather/dist/Gather-1.8.0-SHA256SUMS.txt`.
- Preserved 1.7.0 extension/development ZIPs and checksums remain in `dist/`.
- Pre-final recovery ZIP: `/workspace/Gather/dist/Gather-1.8.0-pre-final-development.zip`, SHA-256 `1a32d741c92e9c039331fd6ad21e16975522f27e0ff278ffc8178a4027873c3b`.
- No GitHub push or Drive upload has been performed at packaging time. The last read-only remote check showed `roedoeroe/Gather` main at `e721d70807062e5e1b1df4b94b6f7059eca5e308` with the original README-only tree. A local checkout or local commit is not external synchronization. Download the development ZIP to retain source independently of this cloud workspace. Any later publication must be reported with its actual branch/commit; never assume automatic Drive sync.

The development ZIP contains source, tests, current/historical documentation and evidence. The extension ZIP contains only the loadable `account-id-tool` directory. Packaging verifies archive CRC, manifest/package version and exact extension file hashes. `docs/SHA256.json` hashes every extension source file; the separate checksums file hashes the two ZIPs.

## Installation, update and rollback

Extract the extension ZIP to a permanent directory; Load unpacked its `account-id-tool` directory from `chrome://extensions` or `edge://extensions`. Before an update, create a private backup, preserve the older source and finish capture jobs. Replace files at the **same installed directory path**, then Reload. Do not uninstall or clear browser storage. 1.8.0 adds no permissions over 1.7.0; from 1.6.x Downloads is added.

Rollback is not a data-format downgrade. Preserve both a pre-update backup made by the older version and a current 1.8.0 backup. Load the older build in a **separate clean browser profile**, restore its matching older backup, and keep the current profile until recovery is verified. Do not let 1.7.0 rewrite R3 research/account-state records. See the current README for user workflow and limitations.

## First next action and narrow backlog

**Single next milestone: native Chrome/Edge acceptance of the packaged 1.8.0 on a permitted runner.** Use `docs/TESTING.md` for the checklist: toolbar/context-menu grants, project-free exact-ID lookup, search→result continuity, capture focus/tab switches, native Downloads retry, worker/browser resets, Ephemeral/Local behavior, Close Case guards, installation-to-installation image restore and print/accessibility.

After that, improve adapter reliability using current primary evidence; validate full-page edge cases before scrolling-element capture; evaluate custom directory access separately with explicit permission/revocation tests. Full Gather Bar, organization/workflow packs, richer annotations, encrypted resume capsules and automated privacy scrubbing remain deferred. Do not add cloud case storage, passive collection or inferred identity/relationship/threat conclusions.
