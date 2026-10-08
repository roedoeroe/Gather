# Gather usability audit — 1.8.10

The goal is a shorter, predictable working day: open a profile, look up or capture, confirm where the result went, and copy what is needed. A case stays optional. More controls are useful only when they remove a repeated decision or prevent a demonstrated mistake.

This audit uses the visible conversation, the earlier [goals audit](GOALS-AUDIT.md), [UX research](design/WORKSPACE-UX-RESEARCH.md), current source and fictional rendered journeys. It does not claim a new FireShot installation, user study, live-platform run or native Edge test. Direct user corrections take precedence over proposals in attachments.

## Fixed in this checkpoint

| Observed friction | Resulting behavior | Verification |
| --- | --- | --- |
| On a supported profile, the main lookup button was disabled while the useful page action was a small secondary button. | With no pasted input, **Find IDs on this page** is the main action. Pasted links take priority; invalid text stays invalid. The action sits above optional pasted input, remains visible on a smaller screen and receives keyboard focus on a supported open profile. The duplicate secondary page action is hidden when it is the main action. Nothing runs merely because Gather opens. | The rendered baseline failed with the main button disabled. Current-page, pasted-input/Enter, invalid-input and changed-active-tab journeys now cover the change. Exact long IDs and frozen lookup context remain protected. |
| A findings filter followed the user into Tasks or History and could make existing work appear absent. | Findings, Tasks, Searches and Activity remember separate filters within the current scan. Changing scans clears them. Filters remain temporary UI state rather than additional saved case data. Empty filtered lists say **No matching…**. Launching a search from Activity opens its search record; returning to Activity keeps its filter. | The baseline task list showed zero cards despite an existing task. The current journey checks independent filter restoration, a no-match message and clear filters in a new case. |
| Close could discard manual image edits without warning; loading failures also disabled Close. | Close asks before discarding unsaved marks or a caption. Cancel keeps the edits. Saved images close normally. Close is disabled during saving, including Save & copy; missing or deleted images remain closable. A browser unload guard is also registered for unsaved work. | Real rendered confirmation cancel/accept, one-prompt window closure, delayed encoding, saved-image hashes, caption-only changes and missing/deleted editor states. Native browser tab-close/reload dialogs still need acceptance. |

There are no new permissions, storage formats, runtime dependencies, cloud writes or automatic redactions. The existing capture, manual image tools, local data controls and four workspace sections remain.

## Whole-workflow review

| Function | Keep the everyday path | Remaining useful improvement |
| --- | --- | --- |
| Single account lookup | Open profile → Gather → primary page action → inspect/copy. No case wizard. Separate remembered ID auto-copy switch. | Validate the five adapters on permitted known-working profiles. Observed technical failures must offer a real retry path, never an invented identity or Gone state. |
| Pasted account batches | Paste → Enter → inspect; failed rows/input remain retryable in their original context. IDs remain strings. | **Save selected results** would remove repeated row-by-row filing. Show a frozen destination and selected count; save is not identity confirmation. |
| Search | Resume the case/scan, enter a query, launch explicitly; reliable opener context carries through results. | Reusable analyst-owned query recipes with an editable preview. No automatic crawler, guessed discovery trail or passive collection. |
| Findings and tasks | Search, save, review and follow-up stay in Research; per-view filters do not interfere. | Broader saved-work search only after measuring larger libraries. Keep Candidate/Confirmed/Rejected decisions visible in copied blocks. |
| Capture | Destination is visible beside direct Select area & copy / Full page / Visible area actions. A side panel is optional. | Native screenshot/clipboard acceptance is the immediate verification gap. Nested scrollers and custom root folders require separate supported implementations. |
| Image editing | Copy and Edit are together; draw red arrows/circles or opaque black rectangles deliberately, Undo, Save & copy. | Keep original bytes separate. Advanced text/highlight tools are optional later; no automatic masking or image interpretation. |
| Capture history | Browse exact case/scan groups or a subject across scans; open one image inspector. Browsing does not change filing. | Measure large-library render/memory costs before adding search scope or virtualization. Never silently remove duplicate captures. |
| Subjects and account observations | Stable subject IDs survive renames; same names stay separate; association is an explicit analyst decision. | Subject/role labels can be configured. Name matching must never infer an account/person relationship. |
| Review and output | Review and inclusion are separate. Copy/Save image uses the selected image; folder export retains its own status and Retry. | Preserve the distinction between an image, findings report, capture record and private all-work backup. Any future output consolidation must show that distinction before download. |
| Continuing a case | Resume the exact scan and inspect earlier dated observations. | **New scan from selected confirmed identifiers**: preserve history, carry only chosen approved seeds, reset new coverage. Do not copy yesterday's observations as today's findings. |
| Privacy and recovery | Red Delete case / Clear recent lookup history in Settings; scoped capture deletion in history; optional private backup. | Logical deletion cannot retract downloaded files, browser history, clipboard or older backups. Archive/trash and encrypted backups need explicit recovery design, not misleading “secure erase” wording. |
| Client communication / documentation | Current copy blocks retain analyst decisions; no email sending or AI dependency. | The **local Quick Parts / Reference Library** is still missing. First ship pack import/update/remove → focused search → correctly typed preview → explicit Copy; then temporary composition and unresolved-field checks. |
| Setup and updates | Load the extension folder, update all files in the same installed path, Reload. Cloud setup is a separate agent environment. | Keep install/update instructions short and versioned. The cloud's managed extension block is a test restriction, not evidence that the user's Edge installation failed. |

## Narrow implementation order

1. Resolve actual installed-browser failures on an allowed Chrome/Edge installation, preserving the automated capture/privacy/lookup gate. This cloud runner cannot supply that evidence.
2. Add **Save selected account results** as one isolated checkpoint: selection, visible frozen destination, explicit save, idempotent success/retry and exact IDs. Keep quick lookup usable without saving.
3. Add the first useful **local Reference Library**, following [the implementation contract](QUICK-PARTS-DIRECTION.md). Use fictional packs until real reference material is available. Search is the primary UI; templates, examples and guidance must stay visibly distinct. Do not delay the generic engine waiting for proprietary content.
4. Add deliberate **confirmed-identifier carry-forward**, then reusable query recipes and field-level provenance/diagnostics. Show dates and source limitations; never interpret threat, identity or relationships automatically.

Keep ongoing-scan scheduling, sanitized archive/closure, broader evidence comparison, optional command palette/tab groups, nested scrolling and custom roots visible in the backlog. None is already shipped. A recurring task is not a configured ongoing scan and cannot drive such a suggestion.

## Changed decisions retained

- Public source is authorized; case data remains on the user's computer. No repository-privacy change is needed.
- Manual image editing is the requested redaction workflow. Automatic school/student/contact-name detection and a complicated outgoing-sharing pipeline were rejected.
- The blue/white presentation and red destructive controls remain. “Apple-inspired” means understandable wording, useful defaults, stable placement and fewer repeated steps.
- The accidental creative-video request was withdrawn and has no Gather work attached to it.
- Friendly-name export folders were superseded by stable role/record-ID folders for privacy; the folder layout is not the underlying relationship model.
- Quick Parts, selected-result saving, new-scan carry-forward, query recipes and field provenance were deferred, not cancelled. The broader blueprint is not permission to build every future feature at once.

See [current validation](TESTING.md) for what was actually exercised and [the handoff](NEXT-RUN-HANDOFF.md) for the next run. Do not label unverified native behavior, performance at arbitrary scale or legal compliance as guaranteed.
