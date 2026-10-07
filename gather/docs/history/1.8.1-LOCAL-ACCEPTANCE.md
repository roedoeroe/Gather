# Check Gather 1.8.1 in Chrome or Edge

The cloud tests reproduced and fixed the reported worker exception. This checklist verifies the remaining native behavior on the browser where Gather is installed. Use a small fictional project; no case deletion is needed to check the popup fix.

## Update without losing storage

1. Preserve the installed folder. Back up work if the current build opens. If 1.8.0 cannot open, keep the browser profile and stored data intact; do not uninstall or clear site data.
2. Extract `Gather-1.8.1-extension.zip`. Replace all files in the existing installed `account-id-tool` folder with the ZIP's `account-id-tool` contents. Include the new `backup-validation.js` file.
3. Close Gather pages, open `chrome://extensions` or `edge://extensions`, click Gather's **Reload**, and verify version **1.8.1**. Reopen the popup. Reload clears Ephemeral Case session values; saved evidence remains.

## Pass criteria

- **Opening:** the popup is about 420 CSS pixels wide, its header/input/actions are readable, and no `import()` error appears. Save destination finishes loading instead of remaining at “Reading page destination…”.
- **Quick Lookup:** with no project selected, open a supported profile, choose Run on this page, inspect the result and copy its ID. A missing/login/technical result must be labelled honestly. IDs remain strings; a lookup that needs sign-in must not be called “Gone.” No live success rate is implied by this checklist.
- **Workspace and panel:** Workspace opens; Inbox and project navigation work. Side panel opens compactly. Use a fictional Northbridge / October review project and Alex Example subject; confirm Save/Capture shows that destination.
- **Continuity/capture:** launch a Gather search, open a result and inspect its destination. If Chrome supplies no opener relationship, use explicit assignment. Start a visible/selection capture, switch the global destination in another Gather view to Southridge, and confirm the original destination is retained. Cancel a full-page capture and verify source scroll/styles restore. Keep the source tab selected during acquisition.
- **Saving/export:** the image says Saved in Gather. Enable Downloads export and verify the relative folder plus companion JSON. A failed download must retain the image and offer Retry. Original screenshot data is not a shareable redacted export; explicitly choose/review a derivative.
- **Persistence:** close/reopen Gather, select the original scan and verify its saved items/images. Create a private `.gather` backup. Test restore in a separate clean browser profile/installation, keeping the original profile intact until relationships and image bytes are verified.

Do not use Close Case on valuable work just to test this fix. Its guard/download behavior is exercised with fictional data in automated journeys; native closure testing should use a disposable fictional project with a verified private backup.

If opening still fails, the browser Extensions page lists errors for Gather. Record the displayed version and the newest error's message/file/line after reloading 1.8.1; old 1.8.0 errors can remain in that list. Never include private intake or screenshots of unrelated case data in a diagnostic report.
