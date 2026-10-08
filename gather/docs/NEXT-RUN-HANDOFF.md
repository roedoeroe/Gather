# Gather 1.8.9 — scrolling capture and manual image tools

## Resume safely

Runtime is `gather/account-id-tool`; manifest/package/version_name are **1.8.9** on **develop/1.8.0-r3**. Main stays unchanged. Inspect status, instructions and newer versions before editing. Preserve all original uploads, prior commits/user changes and immutable ZIPs. Prior handoff: `history/1.8.8-NEXT-RUN-HANDOFF.md`. Versioned builds/checksums/pinned delivery: `../../releases/1.8.9/`.

Latest direct instructions authorize finishing FireShot-inspired extended selection and manual red arrows/circles/black redactions, screenshot auto-copy toggles, blue-and-white presentation and comprehensive validation. User explicitly rejected automatic redaction and an elaborate outgoing-sharing workflow. No more questions were requested during this overnight run. Earlier attachments supply context; direct corrections win. Source public/case data local and development-branch publication remain authorized; no main merge or visibility change.

## Delivered changes

- Full-viewport dotted guides. Drag and wheel-scroll down/up, hold at a vertical edge or PageDown/PageUp to extend the selected document rectangle. Reverse drag and nonzero starting positions work. Escape/cancellation/page switch/resize/timeout/closure remove the overlay and restore starting scroll/focus.
- Extended selection validates paced top-level viewport tiles, stitches only the needed span, saves selected pixels as a derivative and preserves original tiles/geometry/hash metadata privately. Dynamic height/bounds/failure never claim complete. Single-viewport selection and frozen-screenshot fallback remain.
- Edit image has manually drawn red arrows, red circles, opaque black rectangles and crop, sequential Undo and precise keyboard coordinates. SVG gesture preview avoids re-encoding on pointer movement. Save & copy, Save edits and explicit Copy use flattened PNG bytes; originals are unchanged. Dirty edits disable Copy; stale windows cannot replace newer images. Repeated save/copy without edits avoids duplicate derivatives.
- Screenshot auto-copy defaults on and persists locally. It is frozen at launch; explicit Select area & copy overrides off. ID auto-copy remains its separate existing preference. Denied copy keeps bytes and explicit retry. Copy/export preference updates merge atomically.
- Blue actions, white/light neutral surfaces and visible blue focus replace green presentation across product views. Red deletion controls remain. The compact toolbar and optional panel preserve direct capture, lookup and visible destination.
- Review sheets clear stale selected pixels/inclusion/review after cross-window changes and validate before print/export. Single-image source captions default off, optional and separate from pixels. No automatic name, face, identity or threat interpretation.

## Full conversation reconciliation

Quick Lookup is still project-free: open/paste profile → Gather → inspect/copy. Five exact-string ID extractors remain; X is search-only. 1.8.8 Instagram pk/pre-hydration fixes and offscreen rendering remain intact. Deliberate research is case/scan → search → inspect/save → review/export → resume. Browser opener/explicit assignments carry context; no timing/name/URL guesses. Context is filing, not discovery proof. A delayed Southridge switch cannot retarget a Northbridge/Alex capture.

Stable subjects/IDs, Unassigned, same-name folder separation, rename history, account-observation independence and analyst association remain. Binaries stay outside 4 MiB JSON in IndexedDB. Downloads-relative export, saved/exported state, denial/retry, interrupted-write recovery, quotas, binary backup/restore and missing-asset handling retain regression coverage.

Data stays on the user's computer in Gather storage unless they deliberately search/lookup/copy/export. No cloud case backend, analytics, sync, passive capture, automated conclusions or email sending. Originals remain available privately; selected image copies/exports use the current derivative. Companion records/review sheets can contain source metadata; visible screenshot names are manually redactable, not detected automatically. Private `.gather` backups include unredacted originals/metadata and are not encrypted. Legal/policy compliance needs the organization's actual rules and analyst review; no certification is claimed.

Red case/capture deletion and history clearing remove the applicable logical records/blobs, scrub archives/contexts and reject late writes while preserving other cases. They cannot clear browser history, clipboard, downloaded files, older backups or dispatched external operations, and are not forensic erasure. Tests verify original and every edited blob removal.

## Evidence

**165 Node checks, 100 unique rendered-browser groups and 10 actual worker groups passed**, zero failed/skipped release results. Rendered groups: capture 21, toolbar 22, case/privacy 18, stabilization 10, case clipboard 7, shared workspace 7, image tools 15. Image tools also pass at 2× device scale; repeated groups are not double-counted. DOM, screenshot fixture pixels, canvas, clipboard, IndexedDB, BroadcastChannel and applicable Web Locks/worker restart are real; Chrome extension APIs are controlled doubles.

The new journey verifies wheel/reverse/edge/keyboard extended selection and restoration; original Northbridge/Alex filing after Southridge switch; actual PNG red/black pixel readback and unchanged original hashes; dirty-edit copying; crop/undo; stale review sheets; edited binary backup/restore; denied folder retry; deletion of originals/all derivatives; concurrent preference writes; narrow layout. Prior suites protect all five adapter fixtures, exact ID copy, review/export scope, same-name subjects, rename, closure/history/backup denial, missing/corrupt assets and service-worker restart. Fictional screenshots were visually inspected. Current evidence: `evidence/1.8.9` / TESTING.

No new live lookup in this release. Prior 1.8.8 authorized anonymous Instagram evidence is historical, separately qualified; real observations remain ignored outside Git/packages. Signed-in Instagram/other live platforms are unverified. Do not infer universal platform reliability or identity.

Native installed Edge/Chrome cannot load here: `/etc/chromium/policies/managed/extensions.json` has wildcard ExtensionInstallBlocklist. Fresh preflight exits 2, records blocked/zero native groups, and does not launch a prohibited extension. No Edge/Chrome alternative/display exists. Do not alter policy, weaken sandbox/TLS or install a browser to evade this. The restriction is not evidence the user's Edge is broken. Native activeTab/screenshots/focus, OS paste/save/print, actual browser zoom, screen readers and every dynamic site still require a permitted installation check. Explain this plainly; never promise everything is guaranteed.

## Limits and next priorities

1. Verify the installed **Edge 1.8.9** journey in LOCAL-ACCEPTANCE; reproduce actual failures before expanding scope. Use fictional pages for privacy tests. Nested scrollers/horizontal overflow/pinch zoom remain unsupported; dynamic pages can be partial. Acquisition limits remain24 tiles/48 million pixels/24,000 CSS-pixel height/60 seconds; storage 64 MiB per asset / 192 MiB capture / 512 MiB total.
2. Separate next feature: generic local Quick Parts import/replace/remove → focused search → clearly typed preview → deliberate Copy, then temporary block composition/placeholders/human review, then scoped deterministic suggestions. No AI dependency, sending or proprietary public pack. See QUICK-PARTS-DIRECTION.
3. Retain original goals G-02 selected batch account saving; G-03 reviewed confirmed-ID carry-forward with fresh coverage; G-04 field provenance/adapter diagnostics; G-05 reusable analyst-owned queries. They are not cancelled or counted shipped. Advanced annotation/text/highlights, nested-scroller capture, custom root access and sanitized closure remain separate evaluated work.

## Environment and installation

Existing isolated `/workspace/Gather`, no new worktree. Node 24/Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151. No runtime install/dependencies/bundler/server. All test scripts own/close servers/profiles. From `gather`, run the README commands and verify counts/status; a wrong Node glob can exit 0 with zero tests. `/artifacts` is ignored; its official docs cache is not a product repository. Private real sample files/uploads must never be staged or packaged.

Setup draft should select the exact final verified development HEAD at mount Gather, with complete startup instructions. Preserve network/credentials and absent install script. Install script — Not set is intentional. Draft save is not publication or fresh-task restore. Done saves the setup editor; Publish environment in the app activates its snapshot. Product installation remains a separate local browser action.

Update all files at the same installed path, close Gather windows, Reload and verify 1.8.9; do not uninstall/clear storage. Reload clears ephemeral friendly/session values, not durable evidence. Keep 1.8.8 and its matching pre-update backup; verify rollback in a separate clean browser profile before touching current work. ZIP mirrors are the delivery route, not a claimed GitHub Release object.
