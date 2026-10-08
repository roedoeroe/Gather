# Gather 1.8.10 — usability checkpoint

## Resume safely

Use `/workspace/Gather`, branch **develop/1.8.0-r3**, runtime `gather/account-id-tool`. Manifest/package/version_name are **1.8.10**. Inspect Git status, local instructions and newer versions before editing. Preserve user edits, original uploads, existing checkpoints and immutable release ZIPs. Prior complete handoff: [1.8.9](history/1.8.9-NEXT-RUN-HANDOFF.md). Current packages/checksums/receipts: `../../releases/1.8.10/`. Main stays unchanged.

The latest request asked for easier use across all functions and another review of forgotten requirements. It authorized bounded improvements, not building the entire blueprint. Direct chat corrections override attached proposals. Publishing the development branch is already authorized; public source/local case data and no main merge remain the decisions.

## What changed

- With a supported profile open and empty input, **Find IDs on this page** is enabled, visible above optional pasted input and receives keyboard focus. Pasted links take priority; invalid text never silently falls back to the current page. Duplicate secondary action is hidden only when it is the primary action. Opening Gather does not run a lookup. Invocation rechecks the current tab; exact strings, origin snapshots and retry behavior remain.
- Findings, Tasks, Searches and Activity have separate temporary filters. A scan change clears them. Filtered empty lists say **No matching…**. A search launched from Activity shows the search record; returning to Activity retains its own filter. No extra durable case data or permission is added.
- Image Close confirms unsaved marks/caption; Cancel keeps work; deliberate discard closes once. Saving clears the unload guard. Close is disabled during saving, including Save & copy. Missing/deleted images remain closable. Stale editors disable editing; forced old saves still reject without replacing newer images. Browser unload guards are registered but installed-browser tab-close/reload dialogs remain unverified.
- The [whole-workflow audit](USABILITY-AUDIT.md) reviews lookup, batches, search, findings/tasks, capture/edit/history, subjects, review/output, case continuation, privacy/recovery, communication and setup. It keeps unfinished work explicit and avoids restoring the former crowded workspace.

No new permissions, runtime dependencies or storage migration. Blue/white presentation and red deletion controls remain. This is a small improvement to the real extension, not a hosted replacement.

## Preserved product contract

Quick Lookup remains open/paste profile → Gather → inspect/copy, without a case. Five extractors remain; X is search-only. Account IDs stay exact strings. Missing markup, login/network failures and ambiguity stay technical rather than inferred identity or Gone. Research remains case/scan → search → inspect and deliberately save → review/export → resume.

Browser-provided opener links and explicit assignment carry tab context; no timing/name/URL relationship guesses. Save/Capture shows destination and freezes it at invocation. Subject/role records and account observations are separate; same names never merge. Stable IDs survive renames. No automatic identity, relationship or threat conclusions.

1.8.9 dotted full-viewport guides, drag/wheel/edge/PageDown selection, bounded stitching, scroll/focus restoration, red arrows/circles, manual opaque black redaction/crop/Undo, screenshot auto-copy and Save & copy remain. Screenshot and ID auto-copy preferences are separate. No automatic masking or outgoing-sharing pipeline was requested. Original pixels/tiles and hashes remain unchanged; selected derivatives drive ordinary copy/save/export.

Cases, findings, images and history stay locally in the browser. Searches/lookups contact chosen services. Exports are separate local files. IndexedDB stores binary assets outside the 4 MiB workspace. Private `.gather` backups include unredacted originals, are not encrypted and preserve relationships. Logical case/capture deletion and history clearing cannot erase downloads, clipboard, browser history or older backups. Restoring a backup deliberately restores its records. Do not claim forensic erasure or legal certification.

Downloads-relative folder export has its own Saved/Exported/Retry state. Arbitrary custom roots and nested scrollers are not shipped. Full-page limits remain 24 tiles / 48 million pixels / 24,000 CSS-pixel height / 60 seconds; dynamic pages can be partial. Asset/capture/total limits remain 64/192/512 MiB. Minimum Chrome version 116; Chromium Edge is the user's target.

## Evidence and restrictions

Fresh source: **165 Node checks; 104 unique rendered groups** (21 capture, 24 toolbar, 18 case/privacy, 10 stabilization, 7 case clipboard, 8 shared workspace, 16 image tools); **10 actual Chromium worker groups**. Image tools also pass at 2× device scale; repeats are not extra groups. Actual PNG/clipboard/IndexedDB and applicable worker lifecycle are real; extension APIs are controlled doubles. Fictional popup/workspace/editor screenshots were visually inspected. See [TESTING](TESTING.md) and `evidence/1.8.10` for the saved results and package gates.

The baseline reproduced disabled current-profile lookup and a filter-hidden task. Intermediate checks caught a stale test trying to edit disabled stale controls and a modal timing problem; both test paths now reflect the current interaction while preserving data-integrity assertions. Visual inspection caught the primary action below the smaller popup's clipping boundary; the heading placement, initial focus and actual clipping-bound check address it.

Native preflight exits **2**, zero native groups: `/etc/chromium/policies/managed/extensions.json` blocks all unpacked extensions. No Chrome/Edge alternative is installed here. Do not repeatedly attempt prohibited loading, alter policy, disable sandbox/TLS or claim native screenshots/OS dialogs/actual zoom/screen readers passed. Use [LOCAL-ACCEPTANCE](LOCAL-ACCEPTANCE.md) on an allowed installed browser. No new live lookup was performed in this checkpoint; real prior observations remain excluded from public packages.

## Next useful work

1. Resolve actual native failures on a permitted Chrome/Edge installation; keep the core lookup/capture/privacy gate. The cloud restriction is not an observed user-installation defect.
2. **Save selected account results**: explicit selection/count, visible frozen destination, idempotent filing/retry, exact IDs; Save never means Confirmed identity. Keep lookup independent.
3. **Local Quick Parts / Reference Library**: first generic local import/update/remove → focused weighted search → clearly typed preview → explicit Copy. Then temporary block composition/placeholders/final human review. Follow [QUICK-PARTS-DIRECTION](QUICK-PARTS-DIRECTION.md); no AI dependency, email sending or runtime OneNote dependency. Fictional packs unblock generic engineering; proprietary pack contents remain local/separate.
4. **New scan from selected confirmed identifiers**, **field-level provenance/adapter diagnostics** and **analyst-owned query recipes** remain. Preserve dated history, reset coverage and require deliberate seed carry-forward. Ongoing scan frequency/schedule is not currently modeled.
5. Nested scrolling/custom roots, archive/trash/sanitized closure, broader saved-work search/evidence comparison, optional tab groups/command palette and Safari/iOS interoperability remain later or conditional. Do not present them as shipped or cancelled. The [goals audit](GOALS-AUDIT.md) preserves the full conversation reconciliation, including withdrawn requests.

## Delivery and setup

Update all files at the same installed path, close Gather windows, Reload and verify **1.8.10**; do not uninstall or clear storage. Reload releases ephemeral session values, not durable evidence. Keep the 1.8.9 package and its matching pre-update backup. Validate rollback in a separate clean profile; retain current work until recovery is verified.

Development-branch Git publication and pinned ZIP mirrors are the delivery route. No GitHub Release object, main merge or repository-visibility change is claimed. Exact pins/hashes are in the release delivery/verification files. Cloud setup has no install script intentionally. The saved startup draft uses the verified development commit at mount Gather; saving it is not proof of fresh-task restoration. User environment review/save/Publish remains a separate action. Preserve network/credentials and minimum permissions; see [ENVIRONMENT-SETUP](ENVIRONMENT-SETUP.md).
