# Gather 1.8.15 release candidate

Prepared October 8, 2026 (America/Los_Angeles). Suitable for a **small controlled coworker pilot**, with the platform-specific limits below. This is an unpacked browser extension, not a hosted application.

## Recovered and finished

The interrupted tree contained the 1.8.15 manifest, conditional Instagram readiness changes, shared Help, Quick Start, new tests and partial engineering/handoff notes. No 1.8.15 ZIP or commit had been published. Preserved that work and all prior immutable packages; did not restart from 1.6 or discard edits.

The repeated native capture-window problem was **QA harness target selection**, not a reproduced Gather defect. Some normal action-created windows were absent from Playwright's page list, and an old closing CDP target could be selected. Tracking only new target IDs and detaching closed sessions fixed the harness. Nine capture actions now yield nine distinct records, including three cancellations; the next capture succeeds with no ghost window or lock. Capture production code is unchanged.

## Changes and compatibility

Missing Instagram profile metadata gets checks every 250 ms within a **two-second deadline**. An ID already present returns immediately. Existing source/public fallback runs afterward if necessary; its network duration is separate. Explicit pending URLs are respected, while pinned document, profile match, exact strings, conflict rejection and cancellation remain. No new extraction heuristic or guessed number.

One searchable local Help page serves popup, panel, workspace and account tools. Fifteen topics cover normal use, failures, privacy/deletion, image editing, backups and updates. Search is focused, clears with Escape, reflows at 400px, and makes no case reads, persistent writes or external requests. The extension ZIP includes COWORKER-QUICK-START.md. Lookup settings retain the existing browser-fallback toggle.

**Permissions and host permissions: unchanged. Storage schema, retention, capture/export behavior: unchanged. Network endpoints and credentials: unchanged.** Readiness uses DOM polling and can avoid an existing fallback request when metadata arrives. No case-data cloud service, sync, analytics, automatic sensitive-image analysis or identity inference was added.

## Evidence

- **214 Node tests**; **116 rendered groups** (including four Help groups); image tools repeat at 2× DPR (17 groups); **11 pixel**, **10 worker**, **five isolated reader** groups passed.
- **36 native Linux Edge groups:** 23 toolbar/lookup/capture/editor/Help, 10 workspace, three same-folder update. See [TESTING](TESTING.md) for distinctions and reproducible commands.
- Native real toolbar/activeTab, visible capture, horizontal and vertical selections, scrolling selection, full-page stitching, clipboard and local image storage passed. Cancellation before drawing, during extended selection and during full-page capture restored the page. Subsequent capture succeeded.
- Native editor passed adjustable crop handles/keyboard geometry, Undo, red arrow/circle, manual black redaction pixels, unsaved-close cancellation, Save and Save & Copy. Original bytes retained their hash.
- Native 1.8.14 → 1.8.15 same-folder/profile update retained extension ID, Case/scan/SOC relationships, capture and original bytes; reload preserved them.
- Live signed-out installed Edge returned an exact ID on the first operation in **271 ms**. Page load was 871 ms. Public evidence excludes the actual account and source. The diagnostic followed the originally authorized chat URL; the attached brief has a spelling variation, which was not treated as the same account.
- Controlled native readiness: loaded 109 ms; metadata at 650 ms resolved in 810 ms; at 1450 ms in 1581 ms; existing source fallback after readiness in 2074 ms. These are measured examples, not guarantees.
- Visual inspection covered blue/white popup and fixed capture actions, native editor/Help, rendered panel, workspace, capture history, Case controls and red privacy controls. No speculative redesign added.

Final suite results and sanitized screenshots are in [evidence/1.8.15](evidence/1.8.15/README.md). ZIP CRC, SHA-256, runtime byte comparison and extracted-package checks are recorded alongside the versioned packages.

## What remains unverified or unshipped

No signed-in session was available. Linux Edge does not establish signed-in Windows Edge behavior, Windows/native zoom/DPI, native side-panel opening, OS image-save/print dialogs or integration with every clipboard destination. WebDriver is installed/version-checked; tests use Playwright/CDP and ordinary OS input. Do not describe mocked extension APIs or simulated DPR as native verification.

Provider landing access varies: Bing redirected to Microsoft Explore here; Lenso/Shutterstock returned 403. No images were uploaded and no reverse-search results were validated. Launchers remain unchanged. Dynamic/lazy/infinite pages may hit documented bounds or produce partial captures; inspect status. Source-image acquisition, Reference Library, nested scrollers and custom folder roots remain unshipped and ordered in R4. These are not part of this stabilization release.

There is no encryption/legal certification/forensic erasure claim. Manual redaction creates a derivative; private backups retain originals. Gather deletion cannot remove external downloads, clipboard/browser/provider history or older backups.

## Install, update, rollback and handoff

Use the extension ZIP and select **account-id-tool** in Edge's Load unpacked dialog, where organization policy allows it. For updates, finish capture, close Gather windows, retain a private backup if needed, replace **all files in the same installed folder**, then Reload at edge://extensions and confirm 1.8.15. Do not uninstall or clear storage. Keep the immutable 1.8.14 ZIP and a matching backup; test rollback in a separate clean profile before changing the working installation.

Development publication remains on develop/1.8.0-r3. Main and repository visibility stay unchanged; no GitHub Release object is created. Only fictional/sanitized evidence is published. Root README and release DELIVERY provide download links and verification receipts.

Cloud startup instructions must reference the final published development HEAD and restart the authenticated display when native tests need it. **Saving the configuration draft does not publish the environment**; review/save settings and use Publish environment when offered. A fresh restored task has not been verified by this run.
