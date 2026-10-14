# Gather 1.8.17 RC validation

Validation: October 13, 2026, America/Los_Angeles. Automated platform/account/case tests use deterministic fictional fixtures. No private organization corpus or signed-in Windows session was supplied.

| Layer | Result | What it verifies |
|---|---|---|
| Node | 230 passed; zero failed/skipped | Exact account binding, IDs, URL handling, storage, capture, Reference and completion rules. |
| Rendered workflows | 117 groups passed | Toolbar29, capture22, case19, stabilization10, case clipboard7, workspace9, image tools17, Help4. Real DOM/canvas/IndexedDB; controlled Chrome API doubles. |
| Repeated image tools | 17 at 2× DPR | Same scenarios repeated, not additional unique tests. |
| Pixel selection | 11 passed | Edge/corner markers and scrolling at simulated scales. |
| Worker / isolated reader | 10 / 5 passed | Worker lifecycle and bounded page extraction in browser contexts with controlled APIs. |
| Installed Linux Edge workspace | 10 passed | Genuine extension worker/storage, case/finding/task controls, query-free searching and navigation. |
| Installed Linux Edge toolbar/capture/editor | 23 passed | Actual toolbar invocation and activeTab, three capture modes, scrolling, cancel/repeat, clipboard, crop/annotations/redaction and original-byte preservation. |
| Same-folder native update | 3 passed | 1.8.16 → 1.8.17 preserves extension ID, Inbox/case/SOC findings, screenshot/source originals, edited derivative, Reference, Recents and preferences; finding deletion survives an actual Edge restart. |
| Native analyst journey | 32 groups per clean pass | Existing content/source/Reference/privacy journey plus R10 SOC discovery, immediate filing/filtering, keyboard paste and actual selected-image clipboard pixels, Inbox routing and scoped finding deletion. |
| Syntax / generation | 68 modules passed | Local generated profile reader checked; permissions, host patterns and CSP unchanged. |

Native layers total 68 groups (10 + 23 + 3 + 32), with overlapping product coverage. Repeated clean passes and extracted-package runs do not increase unique counts. Receipts: [evidence/1.8.17](evidence/1.8.17/README.md). Package receipts: [releases/1.8.17](../../releases/1.8.17).

## Final native journeys

Two consecutive runs use fresh temporary profiles and real Microsoft Edge 155.0.4283.45 on Linux with sandboxing enabled. Playwright/CDP and authenticated Xvfb/xdotool drive normal extension/UI operations; Chrome APIs are not replaced. These are automated analyst simulations with visual inspection, not coworker usability sign-off.

The actual image context menu saves the selected responsive WebP source, with a JPEG fallback present. Its original hash, dimensions and frozen SOC are checked. Saved images become visible in the open case without reloading, appear only under the right SOC, and retain their history after renaming. All captures is a view, never a filing destination. Opening a new filing case leaves a previous All cases view and restores case scope.

Add SOC is exercised by keyboard, with cancel, blank labels, duplicate names, explicit new selection, frozen case during another surface's context change, focus return and 400/640/1280px layouts. Panel content is tested at400px; this does not claim native side-panel opening.

Reverse Image uses actual Ctrl+V image bytes without clipboardRead. Switching providers keeps image A; replacing it with B copies B's independently checked dimensions and pixel color. Non-image paste and invalid replacements cannot leave stale Search enabled. Cancelling a file picker preserves the prior selection. Two immediate file-change events retain the later image; unrelated text fields keep normal paste behavior.

The full journey also covers five bound fictional content owners, Enter/Shift+Enter/duplicate guard, three native capture modes, native zoom80/100/125/150/200% with pixel comparison, five source-image formats, blocked/CORS/blob paths, delayed frozen filing, editing/original preservation, local completion, Reference import/exclusions/exact Copy, profile isolation, offline access and image backup merge restore. Fractional pixel boundaries round outward. Windows display scaling is a separate unverified capability.

## Live provider checks

Only a generated blue triangle PNG was used. Yandex accepted Gather's copied image through its ordinary Image search paste flow and returned results. TinEye accepted the same selected file through its ordinary upload input and returned results. Google accepted the normal upload flow but reached an unusual-traffic check; it was not bypassed. Lenso and Shutterstock returned403. Bing redirected to its Microsoft Explore visual-search page; Baidu/Sogou opened. Their image submission was not verified.

Reachability does not establish submission, result accuracy, universal access or account entitlement. Gather does not automate provider uploads. Raw challenge URLs, network identifiers and live screenshots remain outside public packages. [Provider matrix](REVERSE-IMAGE-PROVIDERS.md) and sanitized evidence record the exact boundary.

## Privacy and recovery

Fictional Case/SOC/note canaries are checked against observed outbound URLs, headers and bodies. A second Edge profile has none of the first profile's local data. Binary restore verifies original image hashes and relationship remapping. Reference import/export and revision-checked replacement remain separate from case backup. Existing deletion, history clearing, export retry, worker recovery and selected-derivative guards are covered by the regression suites.

The public scanner checks credential/path/archive patterns; manual review covers the changed source and fictional screenshots. It is not a universal personal-data detector or legal certification. No permissions or remote work-data services were added.

## Unverified boundaries

Signed-in Windows/managed Edge, Windows display scaling, native side-panel opening, OS Save/Print dialogs, clipboard managers and every destination work application remain unverified. Live signed-in platform UserID/owner acceptance was not performed. External platforms, protected images and dynamic feeds can change or refuse access. No universal reliability claim.

See [Product Audit](PRODUCT-AUDIT-1.8.17.md) for defects and harness corrections, [R10 acceptance](R10-ACCEPTANCE-1.8.17.md) for the scope ledger, and [Future Plans](FUTURE-PLANS.md) for remaining work.

## Reproduce

From `gather`, use Node24, Python3 and the supplied Playwright via NODE_PATH. Run `python3 scripts/build-profile-reader.py --check`, `node --test tests/*.test.mjs`, and browser-toolbar, browser-capture, browser-case, browser-stabilization, browser-case-clipboard, browser-installed-ui, browser-image-tools (also GATHER_TEST_DPR=2), browser-selection-pixels, browser-worker, browser-profile-reader and browser-help from `tests/`.

[Environment setup](ENVIRONMENT-SETUP.md) gives the native Edge/display commands. Run browser-acceptance.mjs, browser-native-update.mjs, browser-native-workflow.mjs and `GATHER_R6_HEADED=1 node tests/browser-r6.mjs`. The latter historical filename includes `fixtures/r10-journey.mjs`. Run only one headed/clipboard interaction journey at a time. GATHER_EXTENSION_ROOT selects extracted package bytes; GATHER_BROWSER_ARTIFACTS selects ignored output. Keep runtime/tests frozen while suites run.

Finding deletion additionally has a rendered fault-injection check: the workspace write fails after the IndexedDB link/journal transaction; recovery finishes exactly once and removes the journal. This is simulated write failure, separate from native restart verification.
