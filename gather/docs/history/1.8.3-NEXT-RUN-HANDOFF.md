# Gather 1.8.3 — next run handoff

## Current state

The user explicitly resumed the prepared UX implementation after the usage pause. Active runtime was first verified byte-identical to the 1.8.2 release, and all 118 baseline tests passed. Earlier incomplete navigation drafts/checkpoints were preserved rather than shipped. The redesigned runtime is now **1.8.3**, under `gather/account-id-tool`; inspect actual HEAD/status before editing. Do not reset to an old upload or replay the unfinished draft.

Branch: `develop/1.8.0-r3` (historical name). Public source and development-branch publication are authorized. Case data stays local. Main/default branch is unchanged; do not merge or change repository visibility. Versioned ZIPs/checksums and delivery notes live in `releases/1.8.3/`, with local copies in `dist/`. Preserve all 1.8.2 artifacts for rollback. The source/package commit is recorded in the release delivery note rather than embedded in its own package.

## Implemented

Four stable views: Research / Captures / Case / Settings. Research contains web search, Add → Link or excerpt / Note / Task, Findings / Tasks / History and scoped reports. Capture cards prioritize previews; an inspector provides explicit review/include, existing derivative editor, folder export/retry and provenance. Subject management, case queue/coverage/associations and session tools are in Case. Settings starts with red privacy controls and selected-case scope, followed by backup/restore/export preferences. Inbox omits irrelevant subject controls; Case tab remains available with an honest empty state. Narrow workspace uses a collapsed Library chooser.

One New case form supports blank cases or optional reviewed intake. Raw intake edits invalidate old review. The side panel only shows destination, subject, save/capture, search and available next actions/tasks. Popup remains project-free with the 420px fix. Keyboard tabs, enum-only reload hashes, view text/filter state, focus restoration and bounded capture loading are implemented. Section clicks deliberately replace URL history; browser Back goes to the preceding page, not every tab click.

Validation found/fixed two real failures: panel refresh touched a privacy heading absent in compact mode; the older shared editor assigned read-only textarea.type and prevented note/excerpt dialogs opening. Add → Note now has a rendered end-to-end assertion. UI controls freeze async subject/export scopes; no storage/worker schema or permission changes were needed.

## Evidence and limits

118 Node tests; 21 rendered capture/UX groups; 18 rendered case/privacy groups; 9 actual Chromium service-worker groups passed. See TESTING.md and evidence/1.8.3. Browser APIs are controlled doubles. Screenshots were generated and visually inspected, including portrait/landscape/tall/partial/missing-image layouts. CSS 200% zoom is a reflow check, not native browser zoom. Native unpacked extension loading remains blocked: “Loading of unpacked extensions is disabled by the administrator.” Do not repeat identical attempts or disable security. Live-platform reliability remains unverified.

No cloud case storage, sync, analytics, AI writer, automatic identity inference, custom-root folders or nested-scroller capture. Quick Parts is designed, not implemented; preserve QUICK-PARTS-DIRECTION.md for the next bounded feature. Native acceptance takes priority. Runtime dependencies/bundler remain unnecessary.

## Resume safely

Read README, BUILD-NOTES, TESTING and LOCAL-ACCEPTANCE. Preserve user changes and verify manifest/package versions. Run existing Node/browser suites from `gather`; each browser harness owns its server/profile. Current cloud tools support Node 24, Python 3, Playwright 1.62.1 and sandboxed Chromium at `/usr/lib/chromium/chromium`. Preserve privacy generation/queue locks, archive scrubbing, late-write tombstones, frozen capture context, exact string IDs, original bytes and binary restore journals. Findings/URLs/pixels may contain names even in Ephemeral Case; do not claim anonymization or forensic erasure.

Update in place: finish captures, optionally back up work, replace all files at the installed path, Reload. Do not uninstall or clear storage. Reload releases ephemeral session values. Rollback uses preserved 1.8.2 and its matching backup in a separate clean browser profile until verified.

GitHub Release uploads previously failed with HTTP 400 Bad Content-Length using two supported CLI paths; the successful delivery route is versioned ZIPs committed on the development branch. Do not keep retrying the failed endpoint or claim a GitHub Release object exists. Use existing platform Git proxy authentication, not copied secrets. Cloud startup draft persistence and user environment publication are separate from GitHub source publication; a fresh restored task has not been verified.

Historical full privacy implementation notes: history/1.8.2-NEXT-RUN-HANDOFF.md. Original UX brief: NEXT-SESSION-UX-PROMPT.md; it is rationale/acceptance guidance, not a request to restart completed work.
