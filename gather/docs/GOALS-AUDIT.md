> Current 1.8.13/R4 status: see [R4 reconciliation](R4-WORKFLOW-RECONCILIATION.md). Simple Case/SOC filing, five recents, direct selection and Crop handles are implemented. Native Edge reports remain open. Earlier intake/coverage and communication-composer proposals below are historical and superseded; current Reference direction is exact local retrieval only.

# Gather goals audit — 1.6.1 through 1.8.6

Latest steering: read [R4 workflow reconciliation](R4-WORKFLOW-RECONCILIATION.md) first. It narrows the product to Edge utilities and supersedes older coverage/intake/composer priorities. The signed-in Instagram and horizontal-selection defects reported there remain open; 1.8.12 is a tested development checkpoint, not completion of R4.

Audited 2026-10-07 against source HEAD `f1047f266033c1c0b28d6bbb3f392cf010a756a0`, the visible conversation, unique supplied continuation/design documents, and saved release evidence. This is a documentation reconciliation, not another runtime release. Runnable version remains **1.8.6** on `develop/1.8.0-r3`; published ZIPs remain unchanged.

## What this audit establishes

Gather still follows the original two paths:

- **Quick Lookup:** open/paste a profile or batch → Gather → inspect/copy. No case required.
- **Research:** resume case/scan → search → inspect → deliberately save/capture → review → export → resume later. Communication/document preparation remains the next feature, not shipped functionality.

The continuity, capture, privacy and workspace work has substantive code and regression evidence. That does not establish native Chrome/Edge acceptance or current live-platform reliability. Several worthwhile ideas were deferred rather than cancelled, and some disappeared from the narrow release backlog. They are restored below without turning the current release into a large feature project.

## Authority and evidence

Direct user requests and later corrections take precedence over attached documents. Attached documents supply requirements and proposals where the user asked us to use them; their future phases are not all immediate implementation instructions. An older document saying “build now” does not override the later fixes-only stabilization request. The latest request authorizes this reconciliation; it does not require building every retained idea today.

Reviewed inputs:

| Input | How it is used |
| --- | --- |
| Original conversation and [supplied 1.6.1 handoff](history/SUPPLIED-1.6.1-HANDOFF.md) | Original quick path, continuity/capture milestones, binary storage, deliberate saving, test and delivery contract; older deferred mechanics. |
| [1.6.1 direction](history/1.6.1-PRODUCT-DIRECTION.md) | Original product foundations and later possibilities, not a claim those possibilities shipped. |
| Supplied Product Blueprint R3 PDF, October 6 | Case Start, roles, retention, coverage, account history, evidence and long-term direction. Its whole blueprint is not the release scope. |
| Supplied 1.8.0 continuation note | Preserve newer source/checkpoints, finish the R3 subset, publish/export durable builds, qualify native blockers. The three duplicate uploads contain identical bytes. |
| Supplied post-1.8.1 privacy continuation note | Complete the partial privacy work, local case data, visible scoped deletion, stale-write prevention, optional backup, accurate deletion language. |
| Direct Quick Parts request and supplied Optimized Design Engineering Steer R3 | Generic local retrieval/composition, source types, pack lifecycle, keyboard interaction, extraction recovery and core release gates. See [implementation contract](QUICK-PARTS-DIRECTION.md). |
| User screenshots/FireShot examples and subsequent capture requests | Direct selection/copy/save and case/scan screenshot history; an optional side panel; a cleaner workspace. Existing implementation/evidence is assessed here; no new viewing of the supplied recording or native FireShot test is claimed. |
| [Prepared UX brief](NEXT-SESSION-UX-PROMPT.md), [research](design/WORKSPACE-UX-RESEARCH.md), current source and [1.8.6 evidence](evidence/1.8.6/README.md) | Distinguish implemented redesign from an abandoned navigation sketch and design targets from measured results. |

The original uploaded 1.6.1 ZIP remains available separately. Do not restart from the old Google Drive 1.5.1 source. Private supplied materials are not copied wholesale into this public audit; it records generic product decisions only.

Status terms below: **Implemented** means present in current code with the stated automated/rendered coverage. **Partial** means a foundation exists but the complete requested workflow does not. **Retained** means worthwhile future work, not shipped. **Conditional** means an idea to evaluate against demonstrated need. None means native/live verification passed.

## Original workflow and continuity

| Goal | Current status and evidence | Remaining work |
| --- | --- | --- |
| Project-free single/mixed lookup; normalized URLs; exact string IDs; IDs-only copy; annotations, history, retry and keyboard flow | **Implemented.** `core.js`, `app.js`, `popup.js`, `batches.js`; extraction/account-state/toolbar tests. Large IDs and mismatched supplied IDs are guarded. | Protect this release gate in every feature. Verify each supported adapter on permitted known-working profiles locally. |
| Instagram, Facebook, Threads, TikTok and YouTube extraction | **Implemented, live unverified.** Controlled matching fixtures cover five adapters. Current-page lookup uses the observed page; missing markup is technical, not assumed sign-in or Gone. | Full platform/state fixture matrix and current live evidence are incomplete. Add only evidence-supported classifications and real recovery actions. |
| X search | **Implemented search only.** No X ID extractor. | A real adapter is **conditional**, requires a supported reliable source and fixtures; do not advertise it now. |
| Projects/cases, scans, Inbox, accounts/sources/notes/tasks and explicit review/inclusion | **Implemented.** Workspace model/store and four views. Source saving is URL/title/excerpt, not a complete archive. Review and inclusion are separate; unreviewed included work stays labelled. | Do not equate Save with confirmation, identity association or archival completeness. |
| Search origin survives global destination changes; related result tabs inherit safely | **Implemented.** `tab-context.js`, `lookup-context.js`, `page-tools.js`; tab/quick-continuity and worker tests. Browser opener or explicit assignment only. | Native opener/access behavior needs acceptance. When no reliable relationship exists, show the actual destination and allow explicit assignment. |
| Visible Save/Capture destination; explicit reassignment/detachment | **Implemented.** Toolbar Save to and Page options, compact panel, frozen asynchronous operation context. Reassignment clears unsupported discovery references. | Keep filing context distinct from discovery proof. Changing a default must never retarget already-started work. |
| Worker restarts, closed tabs, browser-session resets | **Implemented with limited evidence.** Session mappings survive worker restart, closed/replaced tabs are handled, browser-session maps expire. Worker stop/restart is exercised with extension API doubles. | Native browser reset/reload behavior remains a separate gate; raw tab IDs must not become durable lineage. |
| Side panel compact; management/export in full workspace | **Implemented.** Optional panel for page context/search/save/capture/next action; Research / Captures / Case / Settings in the workspace. | Continue evaluating actual task burden, focus and scaling. Do not restore the former stack of empty metrics and management cards. |

The old ten-check in-memory tab prototype was not shipped. It is not part of the original 66-test baseline or an extra release test count. Current continuity has its own saved implementation and tests.

## Capture, organization, export and recovery

| Goal | Current status and evidence | Remaining work |
| --- | --- | --- |
| Visible area, selected rectangle and full page | **Implemented within bounds.** Real DOM/canvas screenshots, on-page selector, frozen-screenshot fallback and bounded stitching through API doubles. Selection originals and crop derivatives remain separate. | Native screenshot invocation/rate/permission behavior and representative dynamic pages need acceptance. |
| Direct capture without switching to the panel; selection & clipboard, useful save options | **Implemented.** Toolbar Select area & copy plus three modes; completion offers Copy, PNG/JPEG Save image, Print / Save PDF, Edit, View in scan and History. Clipboard uses actual image bytes. | Native clipboard/save/print dialogs and OS application paste remain unverified. Print is a browser preview, not an independently generated PDF engine. |
| Screenshot history grouped by case/scan; optional subject across scans | **Implemented.** Exact-ID grouping, all-case/scan/subject browsing, search/filters, twelve initial cards, inspector and scoped deletion. Browsing does not alter filing. | Maintain usable tall-image viewing and missing/partial/error states; measure larger-library costs before promising scale. |
| Named subjects scoped to a project, reused across scans; configurable Subject/SOC label; Unassigned | **Implemented.** Stable subject IDs and per-scan selected subject; same-named subjects remain distinct; rename preserves relationships. | Role semantics must remain analyst choices. Never infer what SOC means or merge people from names. |
| Capture stores project/scan/subject, optional account/source/search references; destination frozen at start | **Implemented.** Launch/context/reference snapshots plus Northbridge/Alex versus delayed Southridge fixtures. | A filing subject is not a confirmed account/person association; include only references that are actually known. |
| Structured local folder export, automatic once enabled; safe paths, collisions and rename stability | **Implemented for Downloads.** Role/stable-ID folders, timestamp/host/mode/short-ID filenames, sanitization, bounded names and `conflictAction: uniquify`; companion JSON. | Downloads cannot select an arbitrary absolute root. Friendly-name folders were superseded by R3's durable role-ID default, not accidentally lost. |
| “Saved in Gather” distinct from “Exported to folder”; denial retains image and Retry | **Implemented.** Transactional local image save; export attempt ownership and retry protection; PNG/JPEG Save image does not falsely complete structured folder export. | Two downloads are separate OS-facing operations; already exported files are outside deletion. Native denial/cancellation must be checked. |
| Binary storage, quotas, interrupted-write recovery, backup/restore and missing assets | **Implemented.** IndexedDB, 64 MiB/asset, 192 MiB/capture, 512 MiB total bounds, browser quota checks, capture/workspace/restore journals and hash/relationship validation. Metadata workspace retains its 4 MiB limit. | Browser storage can be evicted/cleared. Backups are private, unencrypted, include originals, and remain essential; no unlimited-storage promise. |
| Traceability: source, capture start/end/timezone, IDs, dimensions/scale/coordinates, limitations and original-byte hashes | **Implemented for captures.** Accompanying record/report metadata; SHA-256 verifies saved-byte integrity. | Hashes do not establish authenticity or identity. Keep original pixels free of permanent caption overlays. |
| Preserve originals; separate annotations/crops/redactions; redacted share excludes originals | **Implemented for crop, opaque rectangle redaction and caption derivatives.** Missing selected derivatives fail closed; old editors and print previews cannot silently expose stale pixels. | Highlights/arrows/text/blur/general editor undo are **retained later**, not current capabilities. A private full backup intentionally contains originals. |
| Full-page sticky/lazy/infinite/zoom/navigation/switch/cancel limits and restoration | **Implemented within a stated envelope.** Initial top-level extent, 24 tiles / 48M pixels / 24,000 CSS-pixel height / 60 seconds; fixed/sticky handling, guards and restoration; truncation or height changes are partial. | It cannot guarantee all dynamic content. Nested scroll content, horizontal overflow and pinch zoom have explicit limits. True browser zoom/high-DPI and interrupted-page restoration need native tests. |
| Selected custom root folder with supported permission/revocation/disconnection handling | **Retained, not implemented.** No directory picker or custom root subsystem. | Separate experiment after capture acceptance: explicit user-picked supported directory, local capture retained on failure, permission recheck and Retry. |
| Scrolling elements / region selection | **Retained, not implemented.** Current full page reports visible-only nested scroll content. | One explicitly selected scrolling element, with page restoration and honest limits, only after top-level capture is reliable. |

## Case workflow, privacy and reporting

| Goal | Current status and evidence | Remaining work |
| --- | --- | --- |
| Reviewed local Case Start; private/unknown fields excluded by default; raw intake released | **Implemented.** Paste/explicit selected-text intake, deterministic parser, edit/reclassify/include/exclude, re-review after raw edits, blank-case path. | It is not a universal parser or a direct connection to EP/Birdview. Whole-page intake import and append-to-existing-case review are **retained proposals**, not shipped. |
| Ephemeral/Local retention, stable role IDs, tokenized durable searches | **Implemented.** Friendly values session-only for ephemeral cases; explicitly approved local context can survive restart. Resume seed values exists. | Session loss is intentional. Local Case is the current resume option; no encrypted pause capsule. Saved titles/URLs/notes/pixels can contain names. |
| Account lifetime independent from subject, aliases/permanent IDs/lifecycle history; Gone separated from technical failure | **Implemented conservatively.** Account entity + saved observations, manual association, usable/technical/Gone ordering, former-alias action. Affirmative automatic Gone support is narrow (structured YouTube absence). | Platform-by-platform evidence needed before broadening. Same account ID is not proof of a person; a missing ID alone never means Gone/private/authentication. |
| Editable queue and coverage/no-match records | **Implemented, search planning partial.** Tokenized queued queries, seeds, status transitions, explicit coverage and no-match versus Gone/unknown. | Initial generation is simple single-seed queries, not a full name/school/alias/community recipe library. Reusable analyst-owned query templates and seed enrichment remain **retained**. |
| Active role reused without repeated input; explicit association/rejection with reason | **Implemented for capture/page filing and case tools; partial across all outputs.** Selected subject and role chips; account observations remain separate. | Batch account saves currently carry scan/search origin without a separate selected-role filing field. Any extension must preserve the distinction between filing and analyst-confirmed association. |
| Clipboard-ready account/coverage/evidence bridge | **Partial.** IDs/copy modes, previewed role account block and coverage summary, fixed reports and evidence review sheet exist. | Role block includes candidate and confirmed associations without showing that distinction in each copied line. Preserve analyst decision labels before expanding standardized outputs. Neutral evidence-to-note, evidence-list copy and organization formats are **retained**. |
| Review sheet/Evidence IDs, selected scan export | **Implemented with limits.** Stable Evidence IDs, included selected derivatives, report metadata and preview; binary restore preserves/remaps relationships. | Browser Print/PDF pagination is not a guaranteed final page crosswalk. Support-only/duplicate policy and custom report templates are not a full shipped organization workflow. |
| Red Delete case and Clear recent lookup history, optional backup, clear scope | **Implemented.** Settings one view away, history controls, typed case confirmation/Cancel, backup-first completion guard, project isolation and late-write invalidation. Capture deletion is separately scoped. | Deletion removes Gather's logical records, not browser history, exported files, prior backups, clipboard or external records. No forensic erase claim. |
| Public source; all user case/history/capture data local | **Implemented architecture and user decision.** No Gather case backend, analytics, `storage.sync`, remote index or automatic upload. Explicit platform requests are research traffic. | Keep real cases/private packs/storage dumps out of commits, fixtures and ZIPs. Public source does not publish an installed user's records. |
| Hide friendly labels / screen sharing | **Partial by deliberate scope.** Role/queue labels can be masked. | It is not a full privacy screen: case names, URLs, titles, notes and image pixels may still reveal names. Broader masking requires a separate completeness test. |
| Close case → optional export/purge, sanitized archive, privacy/QC sweep | **Partial.** Safe backup-then-delete or delete-without-backup exists. | Sanitized archive, archive/trash lifecycle and an automatic friendly-name/unassigned/export sweep are **retained**, not equivalent to the current full backup. Do not promise automatic anonymization of image pixels. |

## Worthwhile unfinished work that must remain visible

These goals are retained, not cancelled. The order below favors useful complete workflows rather than additional controls. Native failures, if found, take precedence.

| ID | Origin and value | Smallest sensible continuation |
| --- | --- | --- |
| G-01 | Direct Quick Parts request; removes repeated OneNote lookup and mechanical drafting | Generic local import/replace/remove → focused weighted search → typed preview → deliberate copy in Client Communication and Document Language. Then temporary blocks/placeholders/review; then deterministic scoped suggestions. [Contract](QUICK-PARTS-DIRECTION.md). No AI or sending. |
| G-02 | Original 1.6.1 handoff and R3 expert workflow: repeated saving of batch results | **Save selected account results** with selected count, frozen visible scan, observation dates, explicit unresolved/mismatch handling, idempotency and stale-case protection. It is not bulk confirmation of identity or a prerequisite for lookup. Current per-row save is not this feature. |
| G-03 | 1.6 direction and R3 ongoing-scan/baseline workflow | **New scan from selected confirmed identifiers** with a reviewable source-scan summary and explicit scope. Keep earlier observations/dates intact; reset new coverage, do not copy old findings as current. A later manual comparison can show added accounts/aliases/status changes without interpreting risk. |
| G-04 | Original incomplete field-level provenance and later adapter/recovery steer | Extend existing method/version/timestamp and capture records into inspectable **field-level source evidence** and safe diagnostics. Complete fixture states for each adapter; diagnostics must omit case text, credentials and page bodies. A compact local Check Gather is conditional on a real troubleshooting need. |
| G-05 | R3 search planning and initial repetitive-search goal | Reusable local **query recipes** from approved seed IDs, editable preview, no automatic launch, deduplication and proper ephemeral query handling. Seed promotion from a finding is reviewed; no inferred identity. |
| G-06 | Original capture follow-ons | Nested scrolling and custom directory roots as separate bounded enhancements; richer editing after output/privacy integrity and native acceptance. No multi-feature capture rewrite. |
| G-07 | Original export templates and R3 documentation/QC | Previewable account/evidence/coverage blocks preserving Candidate/Confirmed/Rejected distinctions; neutral evidence-to-note; narrowly deterministic formatting/reference QC. Use the generic local library boundary, not organization rules hard-coded in core. |
| G-08 | Original archive/trash and R3 closure lifecycle | Explicit retained/archive/purge choices and a clearly distinct sanitized export. Define restore, tombstone, quota and asset behavior before adding Trash. Exported copies stay outside Gather control. |
| G-09 | Original local-first organization and R3 evidence review | Evaluate broader saved-work search, exact-image duplicate notices, date-aware timeline and analyst-entered post date/authorship. Current local filters/hash integrity/URL duplicate notices do not constitute these workflows. Never silently discard duplicates or infer authorship. |
| G-10 | R3 larger workflow ideas | One-input Gather Bar, command palette/shortcuts, optional native scan tab groups and selected-tab batch capture are **conditional**, not missing release blockers. Introduce only if they reduce observed steps, preserve explicit access/destinations, and justify any new permission. |
| G-11 | Original portability direction | Preserve the future Safari/iOS Gather Source bridge and portable schema. Retrieve and inspect the actual shortcut/source before integrating it. No mobile rebuild or native helper now; no assumption that the old shortcut is in this checkout. |

Ongoing-scan frequency/schedule is not a current model. Repeated scans/tasks do not establish a configured ongoing scan. G-03 can first support manual recurring work; an explicit configuration must precede any related Quick Parts suggestion. Encrypted resume capsules, broad QC packs, richer pack authoring, collaboration/marketplace and paid distribution remain later possibilities, not current commitments.

## Product quality that continues across milestones

“Apple-inspired” means fewer repeated decisions, clear wording, useful defaults and reliable results, with readable desktop density. It is not decorative styling or hiding necessary controls. Keep the primary task, Save destination and outcome visible; put advanced metadata and management behind named secondary surfaces. Red destructive controls remain easy to find in Settings/history, with text, visible focus and deliberate confirmation.

Maintain one vocabulary: **Case** is the user-facing research container (**Project** internally); **Scan** is one bounded effort; **Subject/Role** is analyst-selected context; **Account observation** describes a checked platform account; **Finding** is deliberately saved work; **Capture/Evidence ID** identifies an image/record, not a conclusion; **Reference/Quick Part** is reusable language; **Communication Draft** is temporary analyst-edited text. Organization labels must not change these relationships.

Keyboard paths, focus restoration, announcements, narrow layouts, contrast and reduced motion are continuing requirements. Rendered focus/reflow tests are useful evidence, not a full screen-reader or native high-contrast audit. Benchmark startup, larger saved-work libraries and input-to-result latency on a documented machine; current source inspection cannot certify every performance target. Extraction recovery must state the observed blocker and provide a real next action, preserve the original row/order/destination, and never expose private content in diagnostics.

## Quick Parts details preserved from the later steer

The engine/composer is **not implemented** in 1.8.6. No library button should promise a feature that is not there. Keep the existing architecture contract and retain these refinements:

- Search title, aliases, category/tags, body, collection/type, platform, stage/outcome, placeholder names and usage notes. Exact intent beats incidental body matches and context boosts. Measure compute and render latency separately; “instant” is a target.
- Preserve source types and labels: templates, possible templates, examples, guidance, warnings, definitions and report parts. Approval and active/deprecated/superseded/draft lifecycle are separate concepts. Unknown approval is not approved.
- Import/update validation, atomic replacement, previous-version rollback, stable entry IDs, freshness metadata and explicit related references. No online update dependency or invented expiration policy.
- Draft provenance, add/remove/reorder/edit, View original, Reset and undo; deterministic duplicate/empty/unresolved/guidance/example checks; normal freeform editing and explicit final review. Updates never silently rewrite an open draft.
- Support the requested bracket fields and the steer's proposed `{{token}}` syntax through explicit declared simple tokens; no executable expressions or guessing. Required unresolved fields block final copy.
- Keyboard, focus restoration, result announcements, increased scaling and reduced motion. Clipboard paste into the normal email workflow needs actual acceptance; formatted HTML is later.
- Packs are separate from case data and backups. A missing real corpus does not block generic implementation with fictional fixtures. It does prevent claiming a real taxonomy or approved-content fidelity. Proprietary material remains outside public packages.

## Changed decisions and exclusions

| Earlier wording or possibility | Current decision |
| --- | --- |
| “Nothing public” / repository privacy concern | User explicitly chose **keep source public; keep case data local**. No repository visibility change. |
| “Public-safe project title” | Superseded by **Case name** and clear local-storage wording. This was misleading UI language, not an instruction to publish cases. |
| Default folders containing project/subject/scan names | R3 replaced friendly names with durable role/stable-ID folders for privacy. Readable filenames still contain time/host/mode/short ID. |
| Screen-Share Privacy Mode | Current honest control is **Hide friendly labels** with stated limits. Do not imply comprehensive masking. |
| User said not to worry about waiting for real SST taxonomy | Proceed with generic engine/UX decisions; do not stall on absent material. It does not authorize publishing proprietary content or inventing approval. |
| Prepare only because usage was low | A temporary pause. The researched brief was saved and the later resume request led to implemented workspace/capture changes. Do not reapply the unfinished navigation draft. |
| Finalizing run, no new features except fixes | 1.8.6 fulfilled that scope. Keep stabilization fixes separate from future feature checkpoints; this audit is not permission to build the whole blueprint at once. |
| FireShot inspiration / “strictly kind of like FireShot” | Retain its short capture/select/copy/save/history workflow inside Gather. Do not require another extension or reproduce unrelated email/cloud/upgrade actions. |
| Accidental unrelated creative-video prompt | User withdrew it; excluded from Gather work. |
| Potential Drive/source storage | Git development branch plus pinned downloadable ZIPs are the verified durable route. No Drive sync/upload or successful GitHub Release object is implied. |
| Cloud data/sync, passive browsing capture, automatic identity/relationship/threat conclusions, automatic email sending | Excluded from the current product contract. Not unfinished features to recover. Optional future AI needs a separate privacy/deployment decision. |

## Validation, delivery and next-run order

Saved 1.8.6 release evidence records **130 Node checks, 71 rendered-browser groups (21 capture/UX + 22 toolbar + 18 case/privacy + 10 stabilization), and 10 actual worker groups**, with zero release-result errors. Chrome extension APIs are doubles; DOM/canvas/IndexedDB/ordinary clipboard and worker lifecycle are real where described. Native extension loading was administrator-blocked. Live platforms/native FireShot, OS dialogs, real browser zoom/high-DPI and screen-reader acceptance are not verified by these counts. This audit checks saved evidence and package integrity; it does not claim a fresh runtime-suite or usability run. [Audit verification](evidence/goals-audit-2026-10-07.json) records original-source verification, release checksums/CRC/runtime-byte identity and documentation checks.

1. Keep the exact [1.8.6 package](../../releases/1.8.6/Gather-1.8.6-DELIVERY.md) and rollback checkpoints. Execute [local acceptance](LOCAL-ACCEPTANCE.md) on an allowed Chrome/Edge installation. Resolve reproducible failures first, without bypassing administrator policy.
2. Maintain the core quick-lookup/worker/capture/privacy regression gate. Strengthen adapter fixture/live evidence before broadening state detection. Record automated, mocked, native, live and visual evidence separately.
3. Implement G-01 as a useful narrow feature checkpoint after stabilization, then its composer/suggestions. No premature broad pack framework. G-02/G-03/G-04 remain prominent follow-ons rather than disappearing again.
4. Select later work by measured repeated effort/context errors. Keep conditional blueprint ideas out of the default UI until they solve a demonstrated need.
5. Preserve clean commits, versioned ZIPs/checksums, install/update/rollback instructions and an accurate handoff. Publish only the authorized development branch; no main merge or repository visibility change. Verify remote state and public download hashes. The saved cloud startup draft still requires environment review/publication; a saved draft is not proof of fresh-task restoration.

Do not upgrade this audit to “everything is perfect.” The concrete conclusion is that the foundational intent survives, the major later capture/privacy simplifications are implemented, and the remaining useful mechanics and verification gaps now have explicit durable owners in the backlog.

## Follow-up checkpoint — 1.8.7

The user subsequently asked to resolve the cloud setup dialog and continue development. A narrow fixes-only pass resolves the earlier G-07 clipboard decision-label gap: Candidate and Confirmed remain labelled beside their account observations, with dates and scan context; Rejected associations remain omitted. Account and coverage previews invalidate when relevant source records change or the case is deleted, stay attached to their original case after a global destination change, and show clipboard denial/manual recovery inside the dialog. This is not a Reference Library, general documentation engine, identity confirmation or bulk-save feature. All other retained goals and native/live verification limits remain. See the current handoff and 1.8.7 evidence.

## 1.8.9 reconciliation — latest direct requests

The audit above is preserved as a dated 1.8.6 assessment. The user subsequently authorized extending selected rectangles while scrolling, full-viewport dotted guides, red arrows/circles, manually placed black redactions, screenshot auto-copy preferences and blue-and-white presentation. These are now implemented with Node and rendered pixel/clipboard/storage coverage. Existing numeric crop/black redaction grew into an actual pointer editor; nested scrolling elements remain unsupported. No automatic redaction or school/student/contact-name detection was requested or added. No new outgoing-sharing workflow is required.

The latest directions supersede the earlier “richer annotation later” entry specifically for arrows/circles/manual black redactions and undo. Copy/Save/Edit remain direct actions; source print details default off, originals stay local and private binary backups include them. Clear/delete actions remove Gather records/assets logically and preserve other cases, but cannot erase clipboard/downloads/browser history/backups. Case data remains local; source remains public. No automatic identity/threat conclusions.

Current release evidence is **165 Node, 100 unique rendered groups and 10 actual worker groups**, plus the 15 image-tool groups repeated at 2× device scale. Native Edge/Chrome remains blocked here; no new live-platform claim. Quick Parts remains a proposed separate local-library checkpoint. G-02 selected batch saving, G-03 confirmed-identifier carry-forward, G-04 field provenance and G-05 query recipes remain visible retained goals. They are not cancelled or counted shipped. Original release/checkpoints and prior source are preserved.

## 1.8.10 usability follow-up

The user's subsequent request asked for smoother use across all functions and another check for forgotten work. The [usability audit](USABILITY-AUDIT.md) reviews the whole working path, records reproduced friction and keeps the retained goals explicit. The main lookup action now works directly on a supported open profile when input is empty; pasted input takes priority. Research subviews retain independent temporary filters and clear them on a scan change. The image editor protects unsaved marks/captions without an extra prompt for a saved image and stays closable on missing/deleted assets.

This is a bounded usability checkpoint, not completion of the Reference Library, batch account filing, recurring-scan carry-forward, field provenance or query recipes. Those are still retained. No new permissions, case cloud storage, identity interpretation or automatic redaction. Historical audit counts above remain dated; the current TESTING and handoff record the fresh release evidence.

## 1.8.11 accepted correction — launch-only search

The user’s latest instruction supersedes automatic search logging and draft retention from earlier milestones. Search the web opens a new tab, and reverse-image search opens the chosen provider; neither creates search records or saves the entered query. Session-only project/scan assignments preserve filing. Existing legacy query text is removed without breaking saved evidence references. Deliberate case intake/plans and saved findings remain distinct. Gray placeholder examples now support persistent labels. Missing hydrated IDs trigger a bounded automatic same-document source read, with exact-account guards. Capture history now refreshes atomically. See [the release implementation note](SEARCH-AND-LOOKUP-1.8.11.md).

Retained priorities remain selected-result saving, local generic Quick Parts, confirmed-identifier scan carry-forward and provenance. User-owned query recipes must obey launch-only query privacy. Do not reintroduce automatic search history, require manual page source for normal lookup, add automatic redaction, or replace the extension with a hosted product.

## 1.8.12 hardening follow-through

Working 1.8.11 retained as checkpoint; privacy boundaries hardened without new workflow features. Public fetch is anonymous, page parsing returns minimal validated results, storage/messages and packaging are restricted. Clear backup/clipboard limits accompany existing manual redaction and red deletion controls. Local does not mean encrypted or legally compliant. Next priority is permitted installed Edge verification and organization deployment requirements before returning to retained product features. See HARDENING-REVIEW-1.8.12.md; no earlier worthwhile goal is silently marked shipped.
