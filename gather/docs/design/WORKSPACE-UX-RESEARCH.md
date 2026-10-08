# Workspace redesign research and decisions

Prepared after the user tested 1.8.2 and shared two screenshots. Research retrieved 2026-10-07 UTC. This is a design brief, not implemented behavior or a claim of usability testing. The user explicitly paused implementation until the next session.

## Evidence from the actual product

The first screenshot shows an Inbox with no case selected. Before its findings, the workspace displays three zero-value metric cards, a web-search composer, an Active context card with disabled subject-management buttons, a Case workflow card with another Case Start button, and destructive privacy controls. The actual findings navigation is below all of them. The side panel repeats several of those sections.

The second screenshot shows a capture thumbnail occupying a small fraction of a very large card. Its long evidence ID, filing path, timestamp, mode/status, saved/export states and full action row all compete with the image. Export/report/backup controls appear together at the page bottom. These are observed information-hierarchy problems, not just colors or spacing.

Source inspection confirms why:

- `workspace.html` places every feature on one document flow. Existing Findings/Tasks/Search history/Activity controls change only the item list, not the rest of the page.
- `workspace.js` renders metrics even when zero and routes many actions through the same generic editor. Some navigation resets list state. Search drafts already have scoped persistence that must be preserved.
- `capture-ui.js` creates both subject management and the entire image library, including global export preferences. Its full-workspace error/status output lives in the separate capture-tools block. Moving that block without moving feedback would hide errors.
- `case-ui.js` inserts its privacy section after the case block and appends controls programmatically. It also creates a second Case Start trigger. Render/refresh replaces subtrees, which can lose focus and disclosure state.
- `workspace.css`, `capture-ui.css`, `case-ui.css` have shared/global rules; popup imports capture styling too. A workspace-only redesign must not shrink or restyle the corrected popup inadvertently.
- Capture processing, original-byte storage, guarded deletion and frozen filing already have substantive tests. Reorganizing controls must not weaken these contracts.

## Primary guidance actually read

Apple's web pages are documentation applications. Their official JSON documentation payloads were retrieved over verified HTTPS and the main article text read. Platform-specific native materials/controls are not directly transplanted into this Chrome/Edge extension.

| Primary source | Relevant principle | Gather application |
| --- | --- | --- |
| [Apple: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Order by importance; group related functions; progressively disclose detail; adapt to window/text sizes. | Put the current task first, eliminate zero-value summary panels, test reflow and zoom. |
| [Apple: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | Tabs navigate, preserve section state and remain available even when a section is empty. Avoid hidden overflow tabs. | Four stable labelled workspace sections; Inbox Case view has an honest empty state. The initial draft's hidden Case tab is rejected. |
| [Apple: Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) | Select controls by importance, group logically, avoid overcrowding and make the primary action clear. | One dominant action for the current task; secondary commands near their content, not a global wall of buttons. |
| [Apple: Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) | No more than two hierarchy levels; concise labels; allow space for content at narrow widths. | Inbox → Cases → Scans only; collapse the library into an explicit chooser at narrow widths. Don't stack every case above content. |
| [Apple: Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls) | Reveal advanced detail when relevant; label what is revealed. | Traceability and file records behind a meaningful Details control, without burying primary save/review actions. |
| [Apple: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields) | Make search scope clear; place local filtering near its content; return responsive, relevant results. | Distinguish “Search the web” from “Find saved findings.” Do not blend local and external search deceptively. |
| [WAI-ARIA APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | One selected panel, linked roles/states, roving focus, arrows; automatic activation only without noticeable latency. | Real keyboard-operable tabs with no hidden-panel focus targets. Preserve normal browser Up/Down scrolling. |
| [WAI-ARIA APG: Modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Contain focus, label dialogs, support Escape/Close and restore focus; favor the safe action in irreversible confirmations. | Reliable capture inspector/new-case/privacy dialogs; typed deletion guards and Cancel stay explicit. |

Research payloads are cached locally under `/workspace/Gather/artifacts/ux-research/`. JSON source paths follow `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<article>.json`. The broad Navigation and search index was fetched but supplied no substantive article text; conclusions above use the specific articles instead. Raw third-party article text is not included in public source.

## Design interpretation, not a platform imitation

Use Apple's discipline of hierarchy, consistency and restraint. Do not add frosted glass, floating ornamental controls, oversized whitespace or icon-only commands to make the extension “look Apple.” This is a working desktop research tool used in Chrome/Edge, including Windows. Familiar browser semantics and readable text labels are appropriate.

A clean interface is one in which the next useful action is obvious and the result is trustworthy. Hiding everything under ellipses is not simplicity. Each task needs a clear entry point, a clear destination and a visible result. Preserve advanced capabilities through named secondary surfaces.

## Decisions for the next build

1. **Keep the library and task navigation separate.** Sidebar selects Inbox/case/scan. Stable top tabs select Research, Captures, Case and Settings. Switching tabs is a view change only. Switching scans should normally preserve the chosen task view instead of forcing Research.
2. **Default Research is deliberately sparse.** Show scope, web search, findings and one Add action. Replace the three large metric tiles with optional neutral counts where useful. Do not show zero badges or load management sections above empty findings. Tasks and History are secondary views inside Research; history can offer Searches/Activity without another row of primary tabs.
3. **Captures is a content library.** Show an actual useful image preview, source title/host, short date, and honest saved/export state. Open a focused inspector for review/inclusion, derivative editing, export and full provenance. Keep evidence IDs and hashes available without making them headline text. Never silently crop or substitute a redacted derivative/original.
4. **Case contains deep setup.** Subjects, queue, coverage, deliberate associations, rename/new scan and session-value tools belong together. A short subject selector can remain near the common filing scope when applicable. An empty Inbox Case view explains that a case is optional; it has no disabled management form.
5. **Settings is clearly findable.** Its first section is Data & Privacy with the red Delete case and Clear recent lookup history controls. Backup/restore and capture export preferences follow. Show which case deletion affects; in Inbox, explain that a case must be selected rather than present a prominent disabled destructive button. No deletion behavior changes.
6. **One New case flow.** Initial form asks for name and first scan. Optional intake expands a reviewed creation flow. Keep the two meanings clear: creating a blank case versus retaining approved intake. Existing `prepareCase` rejects empty research fields; route a blank case through `project.create` unless a separately justified model change is necessary. Do not bypass intake review to make a button work.
7. **The side panel is a companion, not a compressed workspace.** Current page/destination, optional subject, Save source/Capture, search, then a small actionable next step. No full gallery, settings, disabled subject administration or empty case-workflow card.
8. **Popup quick lookup stays fast.** Preserve 420 px sizing, input focus and exact-ID copy. Check it for CSS regressions, not as a place for new management tabs.
9. **Quick Parts follows this redesign.** Its documented local engine/composer remains planned. No dead Client Communication button or placeholder navigation in this build.

## Why the preliminary draft is not the implementation

A draft was started immediately before the user paused work. It is preserved at `/workspace/Gather/checkpoints/gather-1.8.3-navigation-draft`; its tracked-file patch is `/workspace/Gather/artifacts/1.8.3-navigation-draft.patch`. It was not tested or committed. The active runtime was restored from committed 1.8.2.

The draft changes only `workspace.html`, `workspace.js`, and a new `workspace-navigation.js`. It references a missing `workspace-layout.css`; it has not adapted dynamically inserted case/privacy/capture UI. It hides Case in Inbox (contrary to the refined stable-tab decision), resets context selection to Research, can hide feedback, and still needs all corresponding browser tests. Treat it as a disposable sketch. Do not apply it wholesale or count it as shipped/tested work.
