# Edge-first R4 status — Gather 1.8.13

The supplied R4 document was read completely. The reattached copy is byte-identical. It supplies product direction, not evidence of native browser tests or any previous Drive/reference inspection. User authorization includes implementation and publication to the development branch. No real reference corpus was inspected in this run.

## Completed in 1.8.13

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

## Open correctness gate — native Edge

The reported signed-in Instagram failure and horizontal-selection loss were not reproduced in installed Windows Edge here. The confirmed parser/HUD bugs are fixed, and the marker tests pass, but they do not prove the reported native failures gone. The managed cloud Chromium policy `ExtensionInstallBlocklist:["*"]` blocks unpacked extension loading. Runner exits 2 with zero groups; do not weaken it or substitute simulated DPR for native zoom evidence.

Next permitted Edge check: install 1.8.13 in the same directory, open the previously failing authorized profile, invoke Gather, then run the controlled edge-marker selection at 80/100/125/150/200% zoom. Verify stored image, clipboard and saved file; cancel an extended selection and confirm restoration. If lookup fails, establish normalization → DOM/source read → account binding/conflict → worker/UI failure using sanitized structure, never publish raw signed-in source or guess unrelated IDs. [Checklist](LOCAL-ACCEPTANCE.md).

## Narrow remaining order

1. Finish that installed Edge gate (source/destination, activeTab/lifecycle, zoom/DPI, signed-in adapters, native paste/save/print). Fix observed failures before claiming final R4 acceptance.
2. Source-image acquisition after P0 correctness: image context menu, explicit src/currentSrc/srcset candidates, reliable original bytes/format, frozen Case/SOC, Source image type, independent remembered auto-copy. Visible failure on protected/blob/canvas images; no guessed CDN URLs or silent screenshots.
3. Local Reference retrieval after P0s: recursive Markdown import, sections/folder metadata, transparent local versioned pack, Login-Info/ARCHIVED-DONT-USE/media exclusions, deterministic alias/ranking, template/example/guidance distinction and exact copy. No AI, composer, sending, rewritten wording or automatic conclusions. Use fictional packs until real authorized material is provided.
4. Only then evaluate nested-scroller capture and custom folder access against supported browser permissions. They are separate unshipped enhancements.

R4 withdraws earlier intake/coverage platform and communication-composer priorities. Existing legacy records/tools remain compatible; do not expand them. Preserve project-free lookup, exact strings, original pixels, local deletion, recoverable backups and explicit associations. Avoid extra privacy wizards that harm utility. Public source stays generic; real case/reference content stays local.

1.8.13 is a runnable tested development release, **not an R4-complete or native-Edge-verified release**. Earlier packages remain immutable. Main retains its independently completed 1.8.11 merge; publish this work only on develop/1.8.0-r3.
