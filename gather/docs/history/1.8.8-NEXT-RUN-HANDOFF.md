# Gather 1.8.8 — live lookup validation handoff

## Resume safely

Runnable source is `gather/account-id-tool`; manifest/package/version_name are **1.8.8**. Branch remains **develop/1.8.0-r3** (historical name); main remains unchanged. Inspect status/HEAD, any AGENTS instructions and versions before editing. Preserve newer edits, original 1.6.1 uploads and all immutable release ZIPs. `releases/1.8.8/Gather-1.8.8-DELIVERY.md` records the final source/package commit, pinned downloads and hashes. Prior handoff is `history/1.8.7-NEXT-RUN-HANDOFF.md`.

The user requested an overnight validation run, allowing justified fixes but no new features. Their target is **Edge, previously 1.8.7**. They explicitly authorized a sample lookup of their supplied Instagram profile. Anonymous access worked; no credentials were required. Real observations, live HTML, images and local sample exports stay in ignored artifacts, outside public Git and packages. Public regression fixtures use fictional accounts only. Development-branch publication remains authorized; no main merge or visibility change. No delegation is needed.

## Fixed in 1.8.8

- Current hydrated Instagram data can expose the account `pk` beside a separate numeric `id`. They are different identifiers; treating both as account keys caused false ambiguity. Prefer valid matched `pk`, refuse malformed primary keys, preserve conflicts between distinct account observations and conflicting profile_id values. Threads retains its prior semantics.
- Before hydration, the anonymous `initialRouteInfo` explicitly connects handle/URL to root and hostable profile content IDs. Both known view shapes and corroborating logging fields must be valid. Unrelated routes/resources, recommendations, redirects and unscoped logging cannot identify the account. Conflicting content views still fail closed. Missing display names/privacy/post counts remain unknown.
- Large findings lists defer offscreen rendering with CSS content-visibility, retaining every record in the DOM/search. Remember measured sizes; disable containment for printing. A 1,000-note fixture reduced clear-filter-to-frame time from 397 ms to 116 ms and reload from 855 ms to 300 ms. Single-run Linux Chromium timings are not Edge guarantees. Last-card scrolling and its note dialog were exercised.
- Adapter version is 1.8.8 for new observations. Existing observations are not rewritten. The local Edge acceptance checklist now targets the current build.

No feature, permission, dependency or storage migration. The existing Research / Captures / Case / Settings layout and direct toolbar screenshot buttons stay intact.

## Product safeguards and limits

Quick Lookup remains case-free: profile → Gather → inspect/copy. Five extractors cover Instagram, Facebook, Threads, TikTok and YouTube; X is search-only. IDs remain strings. Technical/login/ambiguous results never imply Gone. The three anonymous live Instagram samples resolved, but this is not a platform-wide success rate or signed-in/native Edge acceptance. No operator identity was inferred.

Case data stays local; source stays public. No cloud case sync, analytics, passive collection, name-based merging or automated identity/threat conclusions. Explicit searches/lookups contact chosen services. Reference packs and private uploads do not belong in public fixtures.

Direct Select area & copy, Full page, Visible area and Select area show their destination; side panel is optional. Browser-provided opener/explicit assignments carry context, never timing/name/URL guesses. Capture filing freezes at launch. IndexedDB stores original images/tiles and separate selected derivatives. Redacted sharing excludes originals. Saved in Gather and Exported to folder are separate; denial retains bytes and permits Retry. Folder export is Downloads-relative, not arbitrary/custom roots. Print/PDF uses a bounded native preview, not a generated PDF engine. History browsing never retargets saving.

Capture/clipboard/export race protections remain: acquisition lock release, stale print/editor/copy guards, cross-window folder ownership, interrupted export recovery, atomic deletion, late-write guards, typed-name case deletion and recent lookup clearing. Deletion is logical removal from Gather; clipboard, browser history, downloaded files/backups and dispatched external operations remain outside it. Private binary backups contain unredacted originals and are not encrypted. Ephemeral names release on reload/restart; saved URLs/titles/notes/pixels can contain names.

Limits remain 4 MiB workspace JSON, 512 MiB capture storage, 192 MiB/capture, 64 MiB/asset. Full page is bounded to 24 tiles/48 million pixels/24,000 CSS pixels/60 seconds. Dynamic pages can be partial. Nested scrollers, pinch zoom and custom roots remain unsupported. Originals may contain more pixels than a shared crop.

## Evidence

Baseline 1.8.7 freshly passed **132 Node, 85 rendered groups and 10 actual worker groups**. Final 1.8.8 passed **154 Node, 85 rendered groups and 10 actual worker groups**. Twenty-two fictional Node regressions cover current Instagram data; five positive/ambiguity checks failed before the fix. Toolbar lookup now exercises separate `pk`/`id` and exact clipboard bytes. Chrome extension APIs are doubles; applicable DOM, canvas, clipboard, IndexedDB, Web Locks and worker restart are real.

Three anonymous live Instagram pages were loaded in ordinary sandboxed Chromium and visually inspected. Old code reported ambiguity on all three; fixed code resolved account keys corroborated by the matched routes. Initial response HTML also resolved without invented privacy/status. The real popup copied all three IDs from live DOM replay with controlled extension APIs. That replay is neither live injection nor an installed extension test. Real profile records are kept only in ignored local files; public evidence is sanitized. Other live platforms, signed-in Instagram, native activeTab/screenshot/save/print flows and screen-reader/native zoom behavior remain unverified.

Four views were checked at 400/800/1440px with no horizontal overflow; popup at 420px, keyboard arrows/Home/End and modal Escape/focus return passed. One synthetic performance run used 1,000 notes (about 744 KiB JSON) and 100 small PNG captures. Capture history loads 12 images initially; filtering was about 48 ms and Show more about 112 ms. Timings vary with hardware/content and are not universal thresholds. See `evidence/1.8.8` and TESTING for current results and package verification.

## Environment and delivery

Cloud Chromium still has administrator `ExtensionInstallBlocklist:["*"]`; unpacked extensions cannot load. This is an environment restriction, not evidence the user's Edge installation is broken. No separate Edge/Chrome/display is available. Do not repeat prohibited launches, edit policy, install browsers to evade it, or weaken sandbox/TLS. Ordinary headless browsing and API-double fixtures are supported. LOCAL-ACCEPTANCE records remaining installed-browser checks in plain language.

Use the existing isolated `/workspace/Gather` checkout; no worktree. Node 24/Python 3, supplied Playwright 1.62.1 and sandboxed Chromium 151 support testing. No runtime dependency installation, bundler/server or case-storage credentials are needed. Harnesses close servers/profiles; no process should need to survive restoration. Injected HTTPS Git authentication supports authorized branch publication.

The saved cloud repository/startup draft should point to the verified current development HEAD at mount Gather. The official docs cache under artifacts/chrome-docs-repo is excluded as a product repository. Network, credentials and absent install script stay intact. “Install script — Not set” is intentional. Done saves the editor; Publish environment in the app publishes its snapshot. A saved draft does not prove publication or fresh-task restoration and cannot override browser policy.

Update all files in the same installed folder, close Gather windows, Reload and verify 1.8.8. Do not uninstall or clear storage. Preserve 1.8.7 and its matching pre-update backup. Test rollback in a separate clean profile before touching current work. These ZIP mirrors are delivery, not a claimed GitHub Release object.

## Next priorities

1. Reproduce any actual Edge failure first: installed current-page lookup, activeTab selection/copy, source switching/cancellation, native save/print/zoom and restart/backup checks. Protect the existing regressions; do not add features during stabilization.
2. When stabilization is accepted, Quick Parts / Reference Library remains the next separate checkpoint: local transparent organization-pack import/search, typed preview and deliberate Copy before composition/suggestions. No AI/email sending or proprietary public fixtures.
3. Preserve the goals audit: selected batch saving, reviewed confirmed-identifier scan carry-forward with new coverage, field provenance/adapter diagnostics and reusable analyst-owned queries. None is silently counted as shipped.
4. Nested scrollers, custom roots, richer annotation, sanitized closure and broader saved-work search remain later bounded work.
