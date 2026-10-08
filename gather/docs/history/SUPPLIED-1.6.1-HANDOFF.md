# Gather — next run handoff

## Objective

Finish **Scan Continuity** as a coherent, usable browser workflow. The next candidate should be **1.6.2**, building on 1.6.1. Prioritize completing and validating the existing experience before adding more modules.

Gather’s long-term purpose is a publicly accessible, potentially paid, local-first research companion across desktop and mobile. It removes repetitive search, extraction, capture, organization and formatting work. Analysts retain judgment about relevance, corroboration, identity, relationships, intent and threat/risk.

Preserve the fast entry point: **open profile → Gather → inspect/copy**, with no project required. The broader workflow is **resume → search → inspect → save → organize → review → continue → export**.

## Start from the correct build

Use the latest delivered **Gather-1.6.1-development.zip**. Verify that `account-id-tool/manifest.json` says `1.6.1`. The earlier Google Drive source is **1.5.1**; do not accidentally restart development from it. Preserve 1.6.1 before editing. The package includes unchanged 1.5.1 and 1.6.0 reference implementations.

The source supplied through Drive was rechecked during the last run and retained its September 2026 modification dates. Original Drive files have not been changed.

### Implemented in the development source

- Existing popup and full account tool, including mixed batches, copy formats, notes, retries, cancellation and recovery.
- Five account extractors: Instagram, Facebook, Threads, TikTok and YouTube. **X search launching exists; X ID extraction does not.**
- Projects, scans, Inbox, shared active destination, saved accounts/sources/notes and next actions.
- Full workspace and responsive side-panel surface.
- Explicit page/link/selection capture and an external search launcher with action states.
- Project-scoped account grouping by exact platform ID, with dated observations retained.
- Lookup-origin metadata that survives completion, batch restoration, retries, recovery and backup import.
- Independent review and report-inclusion controls; guarded Undo for review, inclusion, analyst-note edits, moves and task status.
- Mechanical checks for duplicate URLs, unresolved/mismatched IDs, differing historical handles and newer observations.
- Markdown/JSON reports and all-work backup/restore.
- Quote-aware long-integer JSON parsing; unsafe unscoped ID fallback removed; narrower Facebook owner matching.

### Evidence and limits

**66 automated checks pass.** These include synthetic fixtures, actual worker/resolver code with controlled Chrome API/network doubles, persistence, interruption recovery, backup and message routing. They are not browser acceptance tests.

The included Playwright journey was attempted but Chromium could not launch because its executable was unavailable. The earlier browser download returned an unavailable-site HTML response. **Appearance, native popup/side-panel interaction, Chrome/Edge integration and live-platform behavior remain unverified.**

No independently measured speed improvement or live platform success rate has been established. The current workspace has a 4 MiB application limit; it is not an unlimited archive. Source capture stores links/titles/excerpts, not complete archived pages. Field-level source tracing remains incomplete.

## Next build: complete the connections

### 1. Establish real browser evidence

Load 1.6.1 in an isolated Chromium profile, run the existing browser journey, inspect the actual popup/full page/side panel and fix failures. Use only fictional data. If browser execution is still blocked, identify the exact blocker, try a reasonable alternative once, and continue useful engineering work. Do not spend the session repeating installation attempts or claim browser testing passed.

### 2. Connect a search to its resulting saves

This is the largest remaining continuity gap. Search events retain their scan and lookup batches retain their origin, but arbitrary result pages are not linked back to the initiating search. Their explicit capture currently uses the active destination.

Implement a minimal, visible research context for searches launched by Gather and their result tabs where the browser reliably exposes that relationship. Preserve an optional originating search reference on saved items. A result opened for Scan A should offer Save to Scan A even after another Gather window switches to B.

Show the destination beside the save action. Allow deliberate reassignment or detachment. If origin cannot be established, show the chosen active destination rather than guessing. Make restart/stale-tab behavior explicit and tested.

This is context for user-initiated work, not browsing surveillance. Do not collect page contents, unrelated navigation history or background activity. Research the exact browser events and minimum permissions needed before implementation; avoid adding broad permissions by default.

### 3. Make the side panel fit active research

Inspect its rendered layout first. Its primary job is to show the current project/scan, launch a search, save the current finding and expose next actions. Use a compact context selector and progressive disclosure. Keep deep management, backup and export in the full workspace. Reuse shared components, data and commands; do not create a second product or duplicate extraction logic.

Treat the Apple-inspired standard as clarity, consistent behavior, useful defaults, responsive interaction, keyboard/focus quality and understandable errors—not decorative styling.

### 4. Address one demonstrated repetitive step

After the connected workflow works, assess **Save selected account results** for batches. If implemented, show the destination and selected count, retain each observation’s status/date, and clearly handle unresolved or mismatched results. Do not force users to repeat the same save action across a large list. Keep this subordinate to correctness and browser validation.

## Acceptance journey

Use fictional Northbridge / October review and Southridge / Intake:

1. Complete quick lookup and copy with no project.
2. Resume Northbridge, launch a search, open a result and save an account plus a general source without retyping them.
3. Add an analyst note and next action; review a finding and undo that review.
4. Switch to Southridge during delayed work; confirm the original work stays attached to Northbridge and labels remain clear.
5. Return to Northbridge; confirm sources, searches, notes, pending work and drafts remain intact.
6. Save a later observation with the same account ID and a different handle; preserve both observations.
7. Close/reopen Gather, then export only the selected scan’s included findings with exact IDs and honest review labels.
8. Restore a backup into an isolated installation and verify records, relationships and legacy batches.

Report unit/fixture, mocked integration, real-browser and live-platform testing separately. Capture screenshots only from real rendered synthetic journeys. Measure performance if measured claims are made.

## Product boundaries and later work

Use deterministic synthetic data only—no employer, client, student or case material. Keep local-first processing. No telemetry, cloud case storage, background monitoring, AI case processing, identity inference, relationship inference or risk/threat scoring.

After the continuity release is validated, prioritize observed friction, field-level provenance and extraction diagnostics; then evaluate reusable search templates, scan carry-forward, archive/trash, output templates and a proper X adapter. Preserve the iOS View Source / Gather Source direction; its implementation must be retrieved and inspected before integration. Cross-device support and eventual paid distribution remain goals, not this release’s scope.

Deliver a runnable versioned package, concrete changes, test evidence, known limits, concise installation/update instructions, rollback and the next narrow backlog. Make routine decisions autonomously. Ask only when missing information materially changes the product or authorization.
