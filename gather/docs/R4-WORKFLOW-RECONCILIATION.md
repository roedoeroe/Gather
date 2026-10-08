# Edge-first R4 reconciliation — after the 1.8.12 hardening checkpoint

The newly supplied R4 document was read completely on 2026-10-08, including its source-image and Crop sections. It is product-direction context from the user, not evidence that native Edge tests or the described Drive inspection occurred in this environment. Preserve the completed/tested 1.8.12 work. Do not claim this checkpoint completes R4.

## Current facts

- Development branch: develop/1.8.0-r3. Main remains unchanged. 1.8.11 is the published prior checkpoint; 1.8.12 contains narrow tested hardening, not the R4 redesign.
- Edge Stable on Windows is the user's primary environment. This cloud only provides managed Chromium, whose policy blocks unpacked extensions. No native Edge sample was run here. A permitted Edge environment/current sanitized structural fixture is required to investigate signed-in Instagram reliably. Do not weaken policy or guess IDs.
- R4 reports Instagram lookup failure and missing horizontal capture content in real Edge. Treat these as open reported defects. The anonymous 1.8.11 Instagram observation and fictional passing tests do not disprove them.
- Code inspection confirms a large top-centered selector panel can intercept selection starts. Current Crop uses drag selection, not Word-style handles. Recent batches are capped at 50, not R4's five. Intake/coverage controls still exist. These are known mismatches, not completed fixes.

## Workflow changes to carry forward

Prioritize current-profile UserID and precise screenshots, then Case → SOC filing/history. Keep optional project-free lookup and no search-query retention. Internal scans may remain for compatibility, but ordinary destination UI should become Case/SOC with a default internal scan. Gallery All Captures must be a case-scoped filter, never a destination. Preserve legacy data and frozen capture context.

R4 withdraws the earlier emphasis on coverage matrices, raw intake, case-aware communication composition and an email composer. Do not expand them. The future Reference Library is local retrieval of exact source wording, file/section preview and copy, with deterministic aliases/ranking and original folder metadata. No AI/send/rewriting. Exclude Login-Info, ARCHIVED-DONT-USE, media and duplicate export folders. Actual reference exports have not been supplied/read in this run; the attachment's claimed Drive inspection is not our evidence. Public source/fixtures remain generic; real organization content stays local.

Do not add source-image or Reference features while the reported P0 lookup/capture defects remain unresolved. Do not degrade a working fallback simply to make privacy implementation look cleaner. The latest direct user clarification prioritizes preventing accidental publication/cloud disclosure while preserving utility. The 1.8.12 hardening run has no case-upload/sync/analytics endpoint and preserves explicit search/platform requests, optional browser fallback, capture, editing, copy and backup workflows.

## Evidence / next action matrix

| R4 area | Current checkpoint | Next concrete action |
|---|---|---|
| Instagram/current-profile IDs | Five conservative adapters; exact strings; current DOM then automatic same-document source; small isolated-world result | Reproduce signed-in Edge failure at normalization/read/parser/binding/conflict/worker/UI boundary using sanitized structure. No unrelated numeric fallback. Current per-platform native sample count: zero. |
| Popup auto-inspection/four-field output | Current profile recognized; analyst presses Find IDs; normal detail format retained | Auto-resolve on explicit popup opening only, retain manual retry; ensure no repeated copies/stale result on navigation. Review four fields without changing expected punctuation gratuitously. |
| Recent lookups | Max 50, clear controls, late-write guards | Reduce retention to five without deleting deliberately saved findings; test history eviction and interrupted writes. |
| Case/SOC destination and gallery | Stable project/scan/subject model, frozen context and case/subject filters tested | Simplify visible selectors/default scan, All Captures per case, no filter-to-destination coupling; preserve rename/collision/history behavior. |
| Select Area obstruction | Confirmed top-centered tools section intercepts pointer starts | Replace with a small edge HUD; keep keyboard equivalent and Escape; hide before screenshot and allow starts in old panel area. |
| Width/integrity | Outward-rounded pixel mapping and 2× image tests pass; actual reported loss not reproduced | Add unique edge/corner/center marker fixture; compare requested CSS/doc rect → bitmap → stored asset → viewer → clipboard → download. Test 80/100/125/150/200% native zoom and Windows scaling where permitted; do not substitute CSS zoom for native evidence. |
| Scrolling selection | Existing top-level scrolling, original tiles, restoration, bounds and partial status tested | Retain it while fixing geometry/HUD. Exercise sticky/lazy content and scroll restoration in Edge. Do not silently trim or call truncated capture complete. |
| Selection auto-copy | Remembered setting, plus separate Select area & copy action | Consolidate to one primary Select area action controlled by preference; release still captures immediately. Verify off leaves clipboard unchanged. |
| Edit Crop | Drag rectangle, original preserved; coordinate tests | Implement post-capture side/corner handles, dim excluded region, Reset/Cancel/Apply in original-image pixels. Separate from immediate live selection. |
| Source image | Not implemented; no source-image native sample | After P0s: image context-menu acquisition, explicit src/currentSrc candidates, preserve reliable bytes/format, frozen filing, Source image tag, separate remembered auto-copy. No CDN guessing or silent screenshot substitution. |
| Reference | Not implemented; direction/backlog only | After P0s: local recursive Markdown import, folder/section metadata, exclusions, aliases/ranking, source-type distinctions, exact copy. Fictional structural pack tests before real organization pack. |
| Privacy/functionality | 191 Node, 105 rendered workflows, ten worker, five isolated-reader groups; extracted package passes; no permission expansion | Keep minimal privacy boundaries and truthful warnings. No new privacy wizard or crypto feature. Validate native Edge separately. |

## Next implementation sequence

1. Preserve/checkpoint current work and get permitted Edge diagnostics without real source publication.
2. Reproduce/fix Instagram and capture-width defects; confirm the failure layer before changing parsing/crop math.
3. Fix obstructing selection HUD and add marker regression tests, maintaining drag/release, scrolling and restoration.
4. Simplify popup/destination/copy choices and five-batch recents; hide intake/coverage without breaking legacy records.
5. Add handle-based Crop and source-image acquisition only after P0 correctness is established.
6. Build local Reference retrieval last, then complete the R4 native Edge matrix and extracted-package gate.

No R4 never-event is declared impossible. Fail visibly when account binding, source, geometry, storage, clipboard or export cannot be confirmed. Success labels must follow completed operations. The current build is a development checkpoint pending R4/native Edge work, not an R4-complete release.
