# Gather 1.8.17 RC product audit

R10 was explicitly adopted by the user on October 13, 2026. Its interrupted 1.8.15 baseline was stale: 1.8.16 was already published, clean and synchronized. A complete Git archive checkpoint was saved outside package inputs before edits. The new release preserves all older artifacts.

| Issue / reproduction | Expected vs actual / analyst impact | Severity | Root cause and fix | Verification / status |
|---|---|---|---|---|
| Open a case and add a second SOC | Frequent action should be beside the heading; it was hidden in Case management. | P1 | Added a primary Add SOC action at the heading and beside the panel SOC selector; existing stable-ID storage reused. | Keyboard, cancel, blank, same-name IDs, focus, narrow layout and reload/storage checks. Fixed. |
| Add SOC while one is selected | New name should be blank; prior dialog reused the selected subject name. | P2 | Creation and rename now use distinct initial values; dialog names its frozen case and states that the new SOC will be selected. | Empty creation field and duplicate-name tests. Fixed. |
| Open New case after viewing All cases | New case should show its own SOC filters; global history mode persisted and hid them. | P1 | A filing-case destination change resets browsing to that case. Explicit All cases remains available. | Real native journey asserts immediate case-only history and filter identity. Fixed. |
| Ctrl+V in Reverse Image | Clipboard image should preview; there was no paste target/handler. | P1 | Focusable paste/drop target and user-initiated paste events; no background read or clipboardRead permission. | Real OS clipboard paste, byte geometry/color, non-image and text-field checks. Fixed. |
| Replace selected image with invalid/rapid input | Search must not use stale A; failed B previously retained A. | P1 | Invalidate old preview during a real replacement; serial-check asynchronous decode/status; keep valid selection on picker cancel. | Invalid PNG, rapid two-file events, provider switching and actual B clipboard pixels. Fixed. |
| Source-image completion dominated the screen | Keep exact saved image/actions available with a compact completion window. | P2 | Reduced controller to 640×620; truthful Saved source image to Case/SOC confirmation. | Physical context-menu path, original-format hash and immediate history/SOC visibility. Fixed. |
| Provider handoff instructions were generic | Analyst needs the provider-specific next step; several providers had only a landing URL. | P2 | Shared guidance for all eight providers; exact selected image remains local and usable through copy/save fallback. | Live Yandex paste and TinEye upload succeeded; Google challenged; remaining boundaries documented. Fixed within provider capabilities. |

## Harness findings kept separate from product defects

An initial browser baseline reported Unexpected token `<`. Enhanced error diagnostics localized recurrence to an external provider page. The fixture returned HTML for provider script requests while a native tab attached; it now supplies an empty JavaScript response for that mocked resource class and retains strict page-error checks. This is not a claim that live provider code was repaired.

A new physical context-menu assertion exposed that polling for any saved row was an insufficient completion gate. The test now awaits the actual source-image controller's saved actions, reads that job's record, and verifies the responsive WebP URL and hash. The product's stored-success signal remains authoritative.

The image-paste work deliberately changed initial focus from the file chooser to the paste target. One rendered assertion still expected the old button; it was updated to the accessible paste-target label and rerun. Another new assertion expected abbreviated Unsupported image wording; it was corrected to the real format-validation message. No product validation was weakened to pass a test.

## Release decision

No known P0/P1 product issue from this run is deferred. Final release requires green deterministic regression, two consecutive fresh-profile native journeys, update checks, public package review and verification of extracted ZIP bytes. The candidate remains an RC because Windows/signed-in and external-provider limits cannot be certified from Linux testing. [TESTING](TESTING.md) and [R10 acceptance](R10-ACCEPTANCE-1.8.17.md) separate completed gates from external limits.

## Continuation fixes

- **P1 — Inbox routing:** the Library button selected `activeScanId=null` and the findings subview but never selected the main Research section. From Captures/Settings it looked inert, especially with zero cases. The click now explicitly opens Research, resets the subview, highlights Inbox and clears case/SOC presentation without deleting case data. Native tests cover zero/one/multiple cases, all main sections, keyboard, narrow Library, reload and last-case deletion.
- **P1 — Individual finding removal missing:** every Research finding now has a small red labeled Delete control and cancel-first confirmation. A snapshot guard rejects concurrent changes. The worker serializes deletion; an IndexedDB transaction removes only links to the finding and journals the workspace removal for restart recovery. Subject/account links, research associations and old Undo/activity payloads are cleaned. Images, tasks and other findings stay intact. Tombstones prevent stale association writes from reviving links. Native deletion, backup-validity and byte checks plus reducer regression cover the change.
- **Harness — asynchronous SOC refresh:** the first added navigation test asserted Add SOC was hidden before the existing asynchronous capture refresh completed. It now waits for the visible state, without weakening the routing assertion.
- Bulk finding clear is deferred: individual deletion solves the reported need without introducing another ambiguous destructive scope.

- **Update harness:** restarting Edge alone retained the 1.8.16 worker cache while new page files/manifest were visible, so the newly added delete command returned Unknown workspace action. The test now performs the documented supported extension Reload after file replacement, then checks new functionality and unchanged data. No production cache-bypass or storage clearing is introduced.
- **Help harness:** the new deletion answer increases the topic count from 18 to 19; the exact search/reset expectations are updated.
