# Check Gather 1.8.11 in Chrome or Edge

The cloud tests reproduced and fixed the reported worker exception. This checklist verifies the remaining native behavior on the browser where Gather is installed. Use only disposable fictional cases for the privacy checks.

## Update without losing storage

1. Preserve the installed folder. Back up work if the current build opens. If 1.8.0 cannot open, keep the browser profile and stored data intact; do not uninstall or clear site data.
2. Extract `Gather-1.8.11-extension.zip`. Replace all files in the existing installed `account-id-tool` folder with the ZIP's `account-id-tool` contents. Include every module and stylesheet, including `capture-region.js`, `capture-annotations.js` and `capture-edit.css`.
3. Close Gather pages, open `chrome://extensions` or `edge://extensions`, click Gather's **Reload**, and verify version **1.8.11**. Reopen the popup. Reload clears Ephemeral Case session values; saved evidence remains.

## Workspace acceptance

- Inbox shows Research / Captures / Case / Settings; search and findings are visible without scrolling past management. Arrow keys, Home/End and Tab have visible focus.
- New case works with just a name/scan. Optional intake requires review again after edits. Add → Note and Link or excerpt open editable dialogs.
- Open Captures and an image; Close/Escape returns focus. Review/inclusion changes only deliberately. Missing/partial/failed states stay visible. Export identifies its scan even while browsing a subject across scans.
- Settings shows the selected case and red deletion/history buttons. Native browser zoom at 200%, a narrow workspace and the native side panel keep actions reachable.
- Switch sections, reload and use browser Back/Forward: section clicks replace the current URL, not add history entries. They must not change filing destinations.

## Direct toolbar acceptance

- On a disposable fictional page, open Gather: Save to and all three screenshot buttons are visible without opening a disclosure or side panel. Select Northbridge / SEO 6 and Alex Example.
- Change the default to Southridge / SD 73 in another Gather view while the popup is open. Save to must still show SEO 6. Full page must file to SEO 6/Alex, including its original tiles.
- View in scan must select SEO 6, activate Captures and open that exact image. Fit width allows reading/scrolling; Fit image provides an overview. Viewing does not mark it reviewed/included.
- Return to the source page, open Gather, explicitly choose SD 73, capture Visible area and verify its filing. Page options → Use workspace default must explicitly detach the tab; no guessed discovery attribution.
- Select area supports drag/release directly on the source page and optional keyboard coordinates. Page options retains a frozen-screenshot fallback. Check originals plus derivative in a private backup.
- Invoke without page access and on restricted pages: actions should fail/disable with useful advice, leaving lookup usable. Navigate/switch tabs during full page: no other-tab pixels may be retained; partial/cancelled state and source restoration must be honest.
- Run on this page on a known permitted profile for each supported platform, inspect/copy the exact ID, then test delayed markup, login/challenge, denied access and Retry. Do not report a live success rate without executed evidence. Missing markup remains technical; retry keeps input/row/original destination.

## Pass criteria

- **Opening:** the popup is about 420 CSS pixels wide, its header/input/actions are readable, and no `import()` error appears. Save destination finishes loading instead of remaining at “Reading page destination…”.
- **Quick Lookup:** with no project selected, open a supported profile, choose Run on this page, inspect the result and copy its ID. A missing/login/technical result must be labelled honestly. IDs remain strings; a lookup that needs sign-in must not be called “Gone.” No live success rate is implied by this checklist.
- **Workspace and panel:** Workspace opens; Inbox and project navigation work. Side panel opens compactly. Use a fictional Northbridge / October review project and Alex Example subject; confirm Save/Capture shows that destination.
- **Continuity/capture:** launch a Gather search, open a result and inspect its destination. If Chrome supplies no opener relationship, use explicit assignment. Start a visible/selection capture, switch the global destination in another Gather view to Southridge, and confirm the original destination is retained. Cancel a full-page capture and verify source scroll/styles restore. Keep the source tab selected during acquisition.
- **Saving/export:** the image says Saved in Gather. Enable Downloads export and verify the relative folder plus companion JSON. A failed download must retain the image and offer Retry. Original screenshot data is not a shareable redacted export; explicitly choose/review a derivative.
- **Persistence:** close/reopen Gather, select the original scan and verify its saved items/images. Create a private `.gather` backup. Test restore in a separate clean browser profile/installation, keeping the original profile intact until relationships and image bytes are verified.

Privacy acceptance: confirm New case says **Case name** and explains local storage. With a fictional Northbridge case selected, check the red **Delete case…** button in Settings → Data & Privacy. Cancel first; then test the typed-name guard and each backup choice on disposable cases. A denied backup must retain the complete case. Delete without backup must create no new download. Confirm Southridge and its images remain. With popup and full tool open, clear recent lookup history and confirm old results/drafts disappear, saved cases/images remain, and fresh lookup works. Reload Gather and confirm cleared data stays cleared. Browser history, clipboard and old downloaded files intentionally remain outside these controls.

If opening still fails, the browser Extensions page lists errors for Gather. Record the displayed version and the newest error's message/file/line after reloading 1.8.11; old 1.8.0 errors can remain in that list. Never include private intake or screenshots of unrelated case data in a diagnostic report.

## New capture acceptance

- Choose Select area & copy from the toolbar on a controlled page. Drag/release on the page, paste the image into an image-capable local application, and verify its exact bounds with no overlay. Check high-DPI screens and native browser zoom. Keyboard: Tab to Precise selection, Enter, enter coordinates, then Capture selection.
- Cancel with Escape, close the controller, resize/navigate/switch the source tab, and verify selector/page scroll/styles restore. No other tab image may be saved. Reopen Gather after worker suspension and repeat.
- Save PNG and JPEG through the real save dialog; cancel/deny and retry. Verify no overwrite, the local capture remains, and folder-export state is separate. Print / Save PDF must use only the selected derivative and keep source captions outside pixels; verify actual page boundaries on long images.
- Open History: saved screenshots appear grouped by case/scan; Filters reveals attempts, status and case/scan choices. Browsing all cases must leave the current save destination unchanged. Export must identify its scan.
- On disposable captures, test Delete selected Cancel, confirmed scoped deletion, a concurrent edit during confirmation, and individual deletion. Other cases/images remain. Close/reopen, then restore a matching private backup in a clean profile and verify image hashes/relationships.

## Stabilization acceptance

- Keep a print preview open, redact the same capture elsewhere, and confirm the stale preview removes its image and disables Print. Reopen to see the updated pixels. Delete the disposable capture and confirm an open preview clears again.
- Open two image editors; save a redaction in one, then try saving the older editor. Gather must request reopening; the newer redaction remains selected. Further saves in the current editor must still work.
- Start folder export in one window, attempt another export/edit/Delete case elsewhere, and confirm active work is protected. Denial/interruption must retain the image, display the correct state and offer Retry. No completed older attempt may replace a newer retry's status.
- Make a private binary backup during an export; restore it in a separate clean profile. Images/relationships/hashes remain, and the imported unfinished export offers immediate Retry.
- Save two captures successively while the first completion window remains open. Test deletion from History while a clipboard/save action is pending: the deleted preview stays empty and its image actions remain disabled.

## Lookup and clipboard follow-through

- In Edge, open a permitted Instagram profile and choose Run on this page. Current hydrated `pk`/`id` data must resolve the account key, not the separate ID. Copy IDs must match the inspected key. Raw source fallback must remain account-bound, with login/mismatch/ambiguity labelled honestly.
- Preview a fictional role account block: Candidate/Confirmed labels, original dates and exact IDs remain. Change an association or coverage in another Gather window; the stale preview must clear. Changing only the global scan preserves its reviewed scope. Cancel a delayed Copy; nothing copies afterward.
- Deny a clipboard write: advice appears inside the preview, text is selected for manual copying and Retry remains available. Previously copied text is outside Gather deletion.
- In a larger fictional findings list, scroll to an offscreen item, review it and reopen its note editor. Filtering must retain all matching records; tab/focus navigation and report export must still work.

## New capture/editor checks

On a disposable fictional page, drag a selection, scroll down while holding, and release. Guides should reach all viewport edges; the copied rectangle should include the extended content and remain in the original scan. Cancel a second extended drag and verify the starting scroll position returns. Try upward/reverse drag and browser zoom/high-DPI. Nested scroll containers remain visible-only.

In Edit image draw a red arrow, red circle and a black redaction, then Save & copy. Paste into your normal document app and inspect the pixels. Crop/Undo/precise coordinates should work; original bytes remain in a private backup. Auto-copy screenshots can be turned off/reopened; Select area & copy still deliberately copies. Toggle account-ID auto-copy separately. Denied clipboard access keeps the image and explicit Copy retries. Single-image print source details start off.

Review sheets must clear stale images if the selected derivative changes in another Gather window. Confirm edited PNG export, denied folder retry, private binary restore and deletion with disposable data. These are native installed-browser checks, not instructions to upload private data or make cases public.

## Usability checkpoint

With a supported profile open and no pasted input, Find IDs on this page should be enabled. A pasted link takes priority. Opening the popup alone must not start a lookup. Filter Findings, switch to Tasks/History, then return; each view should keep its own filter. A scan change clears them. Draw a manual mark or edit a caption, choose Close, then Cancel; the edits must remain. Save edits, then Close without a discard prompt. Check the browser's native tab-close/reload prompt separately with unsaved work.

## Search and source-read changes

- Type a fictional query in Search the web. Its gray example disappears, the label remains, Enter opens a new provider tab, and the query clears. Reload before submitting a different draft: it must be gone. Browser/provider history is separate.
- Switch to Reverse image. Select TinEye (or another provider), Open image search, and choose an image yourself there. Gather must not upload/read any image or clipboard content automatically. Confirm the result tab keeps the original scan after a workspace switch.
- Open a supported profile, then Find IDs on this page. If hydrated data is missing, Gather should read source automatically. Check the final exact ID against that profile; test navigation/cancellation and login-required recovery. No automatic extractor can guarantee every platform’s markup/access state.
- Confirm old search text/drafts are absent after update and old-backup restore, with saved findings/captures preserved. Check only fictional data. Query-free legacy references remain internal; older releases may reject them, so do not downgrade the active profile in place.
