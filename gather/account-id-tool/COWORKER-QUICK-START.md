# Gather 1.8.16 RC — Quick Start

Gather keeps deliberately saved work in this browser on this computer. A case is optional. It supports analyst judgment; it does not establish identity, account ownership or threat level.

## Install in Edge

1. Extract `Gather-1.8.16-extension.zip` into a permanent folder.
2. Open `edge://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the extracted **account-id-tool** folder. Your organization must permit this.
3. Pin Gather through Edge’s Extensions menu. Choose **Help** in Gather whenever you need a reminder.

## Find and copy an account ID

Open an Instagram, Facebook, Threads, TikTok or YouTube profile, then open Gather. With no pasted draft, Gather checks that page automatically. **Find IDs on this page** runs it manually. Copy the result with **Copy IDs**.

Already available IDs return immediately. Instagram data arriving late gets up to two seconds to settle before the existing source fallbacks. Keep the profile open. If the site requires sign-in or a security check, complete that yourself and retry. Gather never guesses an ID. Paste one or more profile or supported post/video links; Enter runs the list, Shift+Enter adds a line. Content pages return a verified owner’s clean profile URL when usable author data is exposed. Recent holds five local lookup batches.

## Capture and edit

Choose **Case / SOC** (or leave **Inbox / Unassigned**), then **Select area**, **Full page** or **Visible area** directly in the toolbar popup. Drag and release to capture a selection; scroll while dragging to extend it. **Escape** cancels. The destination is fixed when capture starts.

Use **Copy image**, **Save image** or **Edit image** afterward. Page options has a separate screenshot auto-copy switch. Editing offers crop, red arrows/circles and manual black redactions. Save creates an edited image while preserving the original. Review the image and completion status before copying or sharing. **History** opens saved captures.

## Save a source image or reverse search

Right-click a webpage image → **Gather → Save source image to Gather**. It keeps the returned image bytes and format in Captures under the current Case/SOC. Blocked or temporary image sources fail visibly. Auto-copy source images is independent of screenshot auto-copy; clipboard conversion never changes the stored original.

**Research → Reverse image** lets you choose/drop an image locally. A capture’s **Reverse image search** loads its selected image directly. **Copy & open search** copies the image and opens your chosen provider; paste/upload there. Nothing is uploaded automatically. **Upload options** offers Save and open-without-copying when needed.

## Search local Reference wording

**Reference → Manage local library → Import Markdown folder** reads a private local export, including nested folders. Type words such as “no accounts” or “snap username”; Down/Up selects a result and Enter previews it. **Copy exact text** preserves source wording. Template/example labels remain visible. Import, update, export and delete collections here; Reference is separate from case backups.

## Organize only when useful

**Workspace** has five sections: **Research**, **Captures**, **Case**, **Reference** and **Settings**. New case creates a local destination; SOCs are optional. Search the web and Reverse image open your chosen provider. Gather does not retain automatic search queries or upload images for you.

## Privacy and deletion

Gather has no case-data cloud sync or analytics. Lookup and search services receive your deliberate requests. Red deletion/history controls are in **Settings → Data & Privacy**; captures can also be deleted individually or in a selection. Deletion affects Gather’s local records, not previously downloaded files, clipboard history, provider/browser history or backups.

Backups are unencrypted and can include original, unredacted images. Keep them in an approved private location. Gather does not automatically detect or redact sensitive information, certify legal compliance or guarantee forensic erasure.

## Update safely

Finish captures and close Gather windows. Preserve a private backup if needed. Replace all files in the **same installed account-id-tool folder**, then click **Reload** at `edge://extensions`. Confirm **1.8.16**. Do not uninstall or clear storage to update.

Keep the previous ZIP and a matching backup. Test rollback in a separate Edge profile before replacing a newer working installation; older versions may not understand later data.

This is a release candidate for a controlled pilot. See the accompanying QA report for the exact browser tests completed and remaining limits. Windows clipboard managers, printing/save dialogs and signed-in platform behavior can differ from the test environment.
