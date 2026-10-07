# Gather — next session: finish the workspace UX redesign

Continue implementing Gather in the real extension. This is an implementation and validation task, not another roadmap. The previous session deliberately paused at my request to save remaining usage and prepare this brief. Read this document completely, then the linked design research and current handoff. Make routine decisions autonomously; ask only if an answer materially changes the product or authorization.

## What I want

I tested Gather 1.8.2 and found the workspace crowded, hard to understand and inefficient. I want the product thinking associated with Apple: a clear hierarchy, useful defaults, consistent wording, obvious next actions, thoughtful placement, responsiveness and keyboard accessibility. Do not imitate a person's voice or decorate the existing clutter. Redesign the actual workflow and interaction structure.

The two screenshots showed:

- An empty Inbox displaying zero-value metric cards, web search, an Active context card with disabled subject tools, duplicate Case Start entry points, a case-workflow panel and privacy controls before the findings.
- A very large capture card with a small thumbnail, many metadata lines, evidence IDs, export statuses, and a long action row. Reports and backup controls were mixed together at the bottom.
- A side panel repeating too much of the full workspace.

No source account/person in those screenshots should become a fixture. Use only deterministic fictional data.

## Actual starting point and preservation

Repository: `roedoeroe/Gather`, working directory `/workspace/Gather`, current development branch `develop/1.8.0-r3` (historical name; do not mistake it for the current product version).

The **completed runnable version is 1.8.2**, runtime source `gather/account-id-tool`. Its code/package commit is `13db06de81bce578e5a0ba4f1aef3739329bd0cd`. Later commit `6abedc94c244eac51377ec1673dd4da824fe7221` adds the reference-library proposal, better README and durable ZIP mirrors; later preparation commits may follow. Inspect actual HEAD/status rather than resetting to a listed commit. Main remains `e721d70807062e5e1b1df4b94b6f7059eca5e308`.

The prior session began but did not complete a 1.8.3 navigation sketch. It preserved it at `checkpoints/gather-1.8.3-navigation-draft`, plus `artifacts/1.8.3-navigation-draft.patch`, then restored the active runtime to committed 1.8.2. That draft is **incomplete, untested and not shipped**. It references missing CSS, hides the Case tab and has not adapted dynamically generated UI. Use only useful ideas after reading the research; don't apply it blindly. If the checkpoint isn't present after restoration, implement from the committed release and this specification. No lost prototype is needed.

Read `gather/README.md`, `gather/docs/NEXT-RUN-HANDOFF.md`, `gather/docs/design/WORKSPACE-UX-RESEARCH.md`, `gather/docs/BUILD-NOTES.md`, `gather/docs/TESTING.md`, and relevant source. Keep current 1.8.2 ZIPs and checksums immutable. New completed UI work should become **1.8.3** after checking for a newer local version. Preserve user edits/checkpoints and confirm command execution plus a reversible file write before edits. Use the existing checkout, not a new worktree unless needed/explicitly requested.

## Product and privacy contracts that must survive

Gather remains a local browser extension, not a hosted prototype. Quick lookup remains: open profile → Gather → inspect/copy; no case required. Five account extractors, exact string IDs, separate technical/private/Gone states and X search-only behavior remain.

Cases/projects have scans and explicit subjects/roles. Names do not infer identity or merge people. Gather-launched searches and reliable browser opener relationships retain context; never infer relationships from timing, names or URLs. View navigation must not reassign a tab or change capture filing. Save/Capture still shows its destination; capture freezes it at invocation. Assignment is context, not discovery proof.

Preserve visible/selection/full-page capture, original bytes/tiles, immutable derivatives, source/timestamps/timezone/geometry/status/limitations/hashes, storage/recovery, missing-asset behavior and complete-versus-partial labels. Saved in Gather and Exported to folder stay separate. Failed export retains the image. Redacted share export excludes unselected originals. No new permissions are expected.

The source repository remains public by my explicit choice; case data stays local. No cloud case storage, sync, telemetry or passive collection. Searches/lookup deliberately contact chosen sites. Preserve 1.8.2 generation/lock/queue protections, archive scrubbing, project/scan tombstones, backup journal and signature/revision guards. Red Delete case requires the typed name and offers optional backup; Clear recent lookup history preserves saved cases/images. Browser history, clipboard and exported files remain outside deletion. Never promise forensic erasure.

## Chosen information architecture

Use a modest library sidebar for **Inbox → Cases → Scans**, and four **stable, labelled top-level views**:

| View | Main job | Contents |
| --- | --- | --- |
| Research | Search and work with saved findings | Web search, Add action, findings, task/history secondary views |
| Captures | Inspect and review images | Preview-first library, focused capture inspector, scoped exports |
| Case | Organize the current case/scan | Subjects, search queue, coverage, associations, rename/new scan, session tools |
| Settings | Manage local data and preferences | Data & Privacy first, backup/restore, capture export preferences, storage detail |

Apple's tab guidance says not to hide/disable tabs when empty. Keep Case in the same position for Inbox; show a short explanation that a case is optional. Hide irrelevant **controls within its content**, not the stable navigation entry. Settings remains globally available and clearly discoverable. Avoid nested stacks of full-size tab bars.

Use one scope header, e.g. Northbridge / October review and an optional subject selector. Do not repeat Active context/Save destination/Case title in several large cards. Case selection changes filing context as it already does; view selection does not. Keep exact destination text beside actual save/capture controls on compact surfaces. For full workspace, an explicit scope/header can serve nearby manual Add actions.

Switching views preserves entered search/filter text, scroll position and selected detail when still valid. Changing scans normally preserves the chosen task view (particularly Captures) while refreshing its content for that scope. Don't force Research after every scope change. Navigation state is per window; no sensitive search text in URL hashes. Enum-only hashes such as `#captures` can preserve reload location. Back/forward behavior must be deliberate and tested; don't accidentally create a history entry for every keystroke or silently break explicit links.

## Design the key states before completing the UI

### Research: empty Inbox

At ordinary desktop size, the first viewport should show a readable Inbox heading, concise scope guidance, web search and the findings empty state. No zero metric cards, disabled subject form, Case workflow panel, destructive buttons or backup block should precede findings.

Web search is clearly labelled **Search the web** with the provider and Search action. Local filtering is clearly **Find saved findings** and located beside that list. Do not combine them into an ambiguous omnibox. A local filter may be omitted while there are no findings, but must stay visible if its own query/filter produces zero results so the user can recover.

One **Add** control exposes Link or excerpt / Note / Task; keep primary commands discoverable without turning every action into an ellipsis. The page toolbar should not have several equally dominant colored actions. New case and Quick lookup remain easy to find, but they need not compete visually with Search.

Tasks and History are secondary Research views. History may switch between Search history and Activity without promoting both to additional top-level sections. Optional small neutral counts belong near the corresponding view. No red notification badges for ordinary unreviewed work and no zero badges.

A populated state should show meaningful title/content, concise source/platform and review status. Move secondary evidence IDs/technical fields into details while retaining exact IDs where the analyst needs to inspect/copy them. Keep report inclusion and review reachable and explicit; no automatic inclusion based on opening an item.

### Captures: make the image the content

Replace the giant mostly empty metadata cards. Use an adaptive preview library: typically two or three useful-width columns on desktop and one on narrow views. Choose the column count by available width, not fixed device names. Maintain aspect ratio; fit the selected shareable image without visually clipping content. Very tall full-page previews need a sensible height and an Open action, not an unreadable squeezed strip.

Default card: meaningful source title/host, useful preview, concise date, review indication, saved/export state and one obvious **Open capture** interaction. Full IDs, coordinates, hashes and technical limitations belong in a labelled detail view, not a wall of default metadata. A failed/partial/missing-asset condition remains visible on the card, not hidden as “clean design.”

Open a focused capture inspector with readable preview; review/inclusion controls; edit/crop/redact/caption entry to the existing editor; export/retry; and expandable source/traceability details. The record download is secondary. Preserve distinction between original and selected derivative, and clearly warn about originals when appropriate. Never mark reviewed/included simply by viewing it. Escape/Close returns to the same library position with focus restored.

Export commands must state their scope. Browsing a subject across scans must not make “Export current scan” look like “Export these results.” Freeze the chosen record/scan set at invocation so delayed work isn't redirected by a view/case change. Keep existing Downloads behavior and original preservation. Decide the minimal export confirmation needed to make scope clear, not repeated naming dialogs.

Capture-specific feedback must appear in Captures or the open inspector. Today `capture-ui.js` reports some errors to the separate capture-tools block; don't move that block out of sight and lose errors. Missing-asset errors and Retry must stay actionable.

### Case: setup without forcing intake

Use **New case** consistently as one main creation entry. The first form asks for Case name and first Scan. An optional **Add intake to prepare searches** disclosure enables the current local parser/review and intake-retention choice. If raw intake changes after review, invalidate the preview and require review again; never create from an old preview.

Current `prepareCase()` rejects zero approved seeds. A blank case can use the existing `project.create` path; don't weaken review validation to bypass that guard. Don't offer retention promises irrelevant to an empty case. Existing subject creation/manual searches remain available later. Don't promise “add intake to this existing case” unless you implement/test the required model operation; the present reviewed flow creates a new case.

Case view groups subject management, search queue, coverage and deliberate associations. Avoid one row of eight equal buttons. Favor a next useful action, with secondary controls grouped by purpose. The common subject selector can stay near the scope header; New/Rename/Display label/Associations belong here. Empty Inbox Case view explains the workflow briefly without repeating the same creation CTA several times.

### Settings and deletion

Settings first shows **Data & Privacy** and the currently selected case. **Delete case…** and **Clear recent lookup history…** are visibly red, labelled and keyboard accessible. They remain easy to find from any view in one navigation step. In Inbox, omit the disabled destructive case action and explain that a case must be selected. Clearing recent history remains available.

Keep typed confirmation, Cancel, optional backup, denied-download retention, cancellation during pending backup and stale-write protection. Closing a confirmation must restore focus logically even if the case/launcher disappeared after deletion. Successful deletion and errors must be announced in the current view, not left in a hidden Case panel.

Backup/restore and opt-in Downloads export preferences live below privacy settings. Storage quotas belong in a labelled Storage details disclosure. Ordinary scan report export stays close to the research/capture scope; it is not mixed with global backup.

### Side panel and popup

The side panel is for action on the current page: concise page/destination, optional subject, Save source/Capture, web search and a small next-step/task area. Avoid duplicate Save page/Save metadata only actions doing the same thing. Explain metadata-only saving briefly where needed. No gallery, full case setup, settings or disabled management controls in the panel. When there are no tasks or queued actions, don't fill space with large empty cards. A full-workspace link is always available.

The popup remains focused on project-free exact-ID lookup. Preserve the 420 px sizing fix and static worker imports. Test it for stylesheet/module regressions; don't add the workspace's management navigation to it.

## Visual and interaction quality

Use system typography, consistent spacing, restrained separators and one coherent accent. Keep normal body/control text comfortably readable (roughly 14–16 CSS px; secondary text usually at least 12–13), not a smaller font to fit more widgets. Fit the layout to desktop, laptop, narrow windows and zoom. Avoid both crowded controls and enormous empty cards. Red denotes explicit destructive actions/errors, not everyday work states.

Use conventional browser controls and clearly labelled actions. Don't import Apple-specific glass effects, SF Symbols licensing/dependencies or mobile interactions without a reason. The intended inspiration is decision quality and restraint, not a visual costume.

Real tabs need `tablist`/`tab`/`tabpanel`, linked IDs, one selected panel, roving tabindex, Arrow Left/Right, Home/End and Enter/Space as appropriate. Auto-activation is suitable only for instant local panels. Hidden panels must not retain focusable controls in the tab order. Preserve browser scrolling keys. Dialogs have visible titles, reliable Escape/Cancel, contained focus and restored focus. Respect reduced motion, visible focus, semantic headings and contrast. Don't make primary controls hover-only.

No full DOM replacement that drops focused controls after storage refresh. Maintain controlled local UI state across live updates. Loading/error/empty states must look intentional; show a useful bootstrap error if the worker isn't available rather than a permanently inert page. Do not auto-open the side panel when opening the workspace merely to demonstrate features.

## Implementation map and traps

Inspect before editing: `workspace.html/js/css`, `capture-ui.js/css`, `case-ui.js/css`, `workspace-client.js`, `workspace-store.js`, `case-model.js`, `capture-store.js`, `capture-files.js`, popup styles, and all browser harnesses.

Prefer a small explicit navigation controller and stable DOM panel hosts. Keep business/storage logic in existing modules. Give subject management, privacy, library preferences and feedback explicit hosts instead of brittle `host.after(...)` placement. Decide whether the capture inspector reuses safe existing viewing/editing pieces without duplicating the capture pipeline. Scope new CSS to full workspace/section where appropriate. Do not retain obsolete CSS/hidden duplicate controls just to keep old tests green.

Data arriving in another window must not silently change a frozen action. Preserve request ordering, ID references and cleanup for Blob URLs/listeners. Loading a hidden gallery should not eagerly decode hundreds of images or block tab navigation; load visible content sensibly and revoke no-longer-used URLs. Hidden panel changes must not override the active view.

Do not add a bundler, framework, cloud service or permissions for a navigation redesign. Do not add Quick Parts implementation, AI writing, new extractors, custom folders or nested-scroll capture in this release. The separate reference-library specification stays preserved as a future feature once this usability problem is solved.

## Verification and acceptance

Run the existing baseline first. Last completed 1.8.2 results: **118 Node tests**, **19 capture browser groups**, **18 case/privacy browser groups**, **9 real Chromium worker groups**. Counts are separate; they are not native installed-extension passes.

From `/workspace/Gather/gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Node 24/Python 3 and Playwright 1.62.1 with Chromium at `/usr/lib/chromium/chromium` are available in the prepared environment. Keep `chromiumSandbox:true`. Follow current tool permissions; do not use stale escalation arguments. Native unpacked-extension loading has the recorded administrator blocker “Loading of unpacked extensions is disabled by the administrator.” Use existing rendered/worker harnesses honestly; don't repeat identical blocked native launches or weaken security. Test live platforms separately only with appropriate scope; fictional fixtures cover this work.

Update browser interactions to use the real new navigation, not programmatically unhide panels to preserve old selectors. Retain every meaningful privacy/capture/backup assertion. Add a focused UX journey that can fail if the hierarchy or keyboard behavior regresses:

1. Empty Inbox at 1280×800 and 1440×900 shows search and findings above the fold, without zero metrics/disabled management/destructive controls. Four stable tabs; one main New case launcher. No horizontal overflow.
2. Create a blank fictional case without intake. Cancel a second creation with no writes. Create a reviewed-intake case, require re-review after raw text edits, and verify stored retention behavior is unchanged.
3. Navigate all four views by keyboard. Exactly one active tab/panel; hidden controls can't receive focus. Preserve query/filter/scroll, reload hash, and logical back/forward behavior. Switch case while browsing captures and remain in Captures with correct scope.
4. Northbridge / October review / Alex Example → launch search → related result → capture; switch global destination to Southridge during delayed work. Verify original filing remains Northbridge and Alex, with explicit displayed context.
5. Inspect portrait, landscape, tall full-page, derivative, failed/partial and missing-image fictional captures. Open/close inspector; review/include only explicitly; export/retry from the correct scope. No original fallback for missing selected redaction. Restore focus and library position.
6. Reach Settings from any view, find red privacy buttons, check exact case scope, Cancel, typed name, optional backup failure/cancel, deletion without backup and unrelated-case preservation. Clear history with popup/full tool open; stale writes cannot resurrect it.
7. Side panel at 360–420 px stays task-focused; popup still 420 px. No duplicated current-context block or duplicate save action. Full workspace at 400 px adapts the library without stacking every scan above content. At 200% browser zoom, important text/actions remain reachable without horizontal page overflow.
8. Worker restart, binary backup/restore, string IDs, coverage, associations, hash/original protection and full-page cancellation/restoration still pass. CSS reorganization cannot count as permission/API acceptance.
9. Screenshots: empty Inbox, populated Research, Captures grid, capture inspector, Case, Settings, narrow workspace, side panel and popup. Actually open and inspect them; revise issues instead of declaring success from a zero-error log.

Measure interaction burden: opening Captures/Settings is one view switch; opening an image takes one deliberate selection; adding a note/task is at most Add → action; destructive confirmation remains intentionally deliberate. These are concrete targets, not permission to remove necessary review.

## Completion and delivery

Finish the real UI and tests before calling it polished. No “perfect” or “everything works” claim without limits. Package a new version only after the new visible workflows and preserved behavior pass. Keep release 1.8.2 immutable and available for rollback. Update README, build/testing notes, handoff, local acceptance checklist, product direction and source hashes around the actual completed release.

The user authorized public development-branch publication. Publish source and fictional evidence to `develop/1.8.0-r3`; verify remote SHA. Keep main/default branch unchanged unless explicitly requested. Public packages for 1.8.2 are mirrored under repository root `releases/1.8.2/`; new release assets should have their own versioned directory. GitHub Releases upload endpoints returned HTTP 400 Bad Content-Length with both CLI upload paths, so do not repeatedly retry that known failure; Git artifact mirroring works. No successful GitHub Release object was published.

Deliver a runnable extension ZIP, source/development ZIP, checksums, concise changes, exact test evidence, installation/update/rollback instructions and known limitations. Update at the same installed path and Reload; don't tell me to uninstall/clear storage. Native Chrome/Edge acceptance remains a distinct checklist until actually performed.

Begin with inspection and baseline verification, use the prepared research to make decisions, then implement. Do not spend the next session rewriting this plan or asking me to choose routine tab labels. Show concise progress and complete the redesigned build.
