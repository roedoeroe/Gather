# Edge-first R4 status — Gather 1.8.15 RC

The supplied R4 document was read completely. The reattached copy is byte-identical. It supplies product direction, not evidence of native browser tests or any previous Drive/reference inspection. User authorization includes implementation and publication to the development branch. No real reference corpus was inspected in this run.

## First-attempt correction in 1.8.14

A user-confirmed first-failure/second-success exposed different current-tab and pasted-link lookup paths. The first attempt now includes one public-profile fallback when Instagram DOM/session source omit the ID, with pinned-document recheck and conflict/cancellation guards. Current-page retry no longer focuses or opens pasted input; screenshot controls have a separate fixed area. Live signed-out Chromium plus a controlled missing-markup/live-response test passed. This is stronger evidence than fictional parsing alone, but does not establish signed-in Windows Edge behavior. See BUILD-NOTES and TESTING.

## Retained from 1.8.13

| Requirement | Implementation / evidence |
|---|---|
| Current profile first | Explicit toolbar opening resolves the supported current profile; a staged pasted draft is preserved. Display name, username, URL and exact ID; manual retry, independent ID auto-copy. |
| Parser defect | Every recognized assignment in each script is examined. Later matching profile data resolves; later conflicting IDs cause refusal. No unbound numeric fallback. Generated isolated reader matches modules. |
| Selection obstruction | Small edge helper; descriptive text passes pointer input; helper hidden during a drag and overlay removed before pixels. Old top-center start location tested. |
| Selection width | Strict non-clipping bounds and scale checks; real pixel markers at four corners, four edge midpoints and center survive visible/stitched selection at five simulated DPR values. |
| Selection workflow | One Select area; immediate release; scrolling/dotted guides/restoration retained; copy follows saved preference. |
| Crop | Eight post-capture handles, dim excluded area, move, keyboard edges, Reset/Cancel/Apply; coordinates in current original-image pixels. Undo and original preservation tested. |
| Case → SOC | New case label + SOCs only, automatic internal scan, local persistence, stable IDs, same-name separation. Legacy intake API/data retained for compatibility; normal intake UI/context-menu entry removed. |
| History / filing | Case-scoped All captures and SOC/Unassigned filters never change filing. Popup shows Case/SOC; History opens that case. Legacy multiple scans retain distinct options. |
| Five recents | Startup/read/write/restore enforce five batches; atomic eviction, archive scrubbing, stale-write tombstones. Saved findings unaffected. Red popup clear button. |
| Privacy / utility | No added permissions or cloud endpoint; local cases, no automatic query history, manual redaction, independent copy preferences, binary backup and guarded deletion retained. |

## Native correctness progress in 1.8.15

The conditional two-second Instagram readiness buffer preserves immediate successful reads and the existing source fallback. Installed Linux Edge now passes real action/activeTab, visible/full/selected capture, horizontal/vertical/scrolling selection, cancellation/repeat, clipboard, image editing and same-folder update tests. The authorized live signed-out lookup succeeded in one operation. Help and the bundled Quick Start are complete. [Exact evidence and limits](TESTING.md).

The user explicitly authorized Edge installation. Official Edge loads this development extension normally with sandboxing enabled; Chromium's separate managed policy was not edited. The earlier blanket “native Edge unavailable” statement is obsolete. Native signed-in Windows Edge, browser/OS zoom, OS dialogs and native panel opening still require a controlled pilot. Rendered simulated DPR is not native zoom evidence.

## Narrow remaining order

1. Complete the remaining Windows/signed-in/zoom/OS-dialog checks during the controlled 1.8.15 coworker pilot. Fix reproducible correctness failures before adding features; do not redo native Linux Edge checks without a change or unresolved concern.
2. Source-image acquisition after P0 correctness: image context menu, explicit src/currentSrc/srcset candidates, reliable original bytes/format, frozen Case/SOC, Source image type, independent remembered auto-copy. Visible failure on protected/blob/canvas images; no guessed CDN URLs or silent screenshots.
3. Local Reference retrieval after P0s: recursive Markdown import, sections/folder metadata, transparent local versioned pack, Login-Info/ARCHIVED-DONT-USE/media exclusions, deterministic alias/ranking, template/example/guidance distinction and exact copy. No AI, composer, sending, rewritten wording or automatic conclusions. Use fictional packs until real authorized material is provided.
4. Only then evaluate nested-scroller capture and custom folder access against supported browser permissions. They are separate unshipped enhancements.

R4 withdraws earlier intake/coverage platform and communication-composer priorities. Existing legacy records/tools remain compatible; do not expand them. Preserve project-free lookup, exact strings, original pixels, local deletion, recoverable backups and explicit associations. Avoid extra privacy wizards that harm utility. Public source stays generic; real case/reference content stays local.

1.8.15 is a native Linux Edge-tested **release candidate for a controlled coworker pilot**, not an R4-complete or signed-in Windows acceptance claim. Earlier packages remain immutable. Main retains its independently completed 1.8.11 merge; publish this work only on develop/1.8.0-r3.
