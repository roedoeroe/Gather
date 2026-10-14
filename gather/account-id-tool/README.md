# Gather 1.8.18 RC

Gather is a local browser extension for exact account IDs, screenshots, source images and organized research. **Open a profile → Gather → inspect or copy.** A case is optional.

## Install or update

You need only **Gather-1.8.18-extension.zip**. Extract it into a permanent folder. In `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select **account-id-tool**. Your organization must allow unpacked extensions. Pin Gather in the browser toolbar.

For an update, finish captures and close Gather windows. Replace all files in the **same installed account-id-tool folder**, then click **Reload** at `edge://extensions`. Confirm **1.8.18**. Restarting Edge alone may leave an older worker cached. Do not uninstall or clear browser storage to update.

Keep the previous 1.8.17 ZIP and a matching private backup for rollback testing in a separate profile. Reference has its own collection export/import and is separate from case backups. See [Quick Start](COWORKER-QUICK-START.md) or **Help** in Gather for the everyday workflow.

## Everyday tools

- **Account lookup:** Instagram, Facebook, Threads, TikTok and YouTube profiles, plus supported content-owner routes. X is search-only. IDs remain exact strings. Available IDs return immediately; late Instagram metadata gets a bounded approximately two-second readiness window before the existing fallbacks. Completed page lookups say **Find again**; unfinished checks offer Retry. Site sign-in, network failures and ambiguous ownership are not guessed away.
- **Screenshots:** choose Case/SOC or Inbox, then **Select area**, **Full page** or **Visible area** directly in the toolbar. Scroll while dragging a selection; Escape cancels. The side panel is optional. Destination is fixed when capture starts.
- **Review and reuse:** Copy image, Save image, Print / Save PDF or Edit image. Editing provides crop, red arrows/circles and manual black redaction. Originals stay intact; selected derivatives are used for sharing. Screenshot and source-image auto-copy have separate switches.
- **Source images:** right-click a page image → Gather → Save source image to Gather. Gather saves returned PNG/JPEG/WebP/AVIF/GIF bytes when accessible; a blocked or temporary source fails visibly. Clipboard conversion does not alter its stored original.
- **Reverse image:** paste, choose or drop an image locally, then **Copy & open search**. Complete the provider's normal paste/upload step yourself. No image upload is automatic.
- **Reference:** import a local Markdown folder or JSON collection, search by words/aliases, preview the source and copy exact text. Template/example labels remain visible. The organization library is local and separate from case data; no composer or AI service is required.
- **Workspace:** Research, Captures, Case, Reference and Settings. Add SOC beside the case heading, browse saved images, and return to Inbox at any time. Individual findings and captures have scoped deletion controls. Web search opens the chosen service without keeping a Gather query history.

## Local data and deletion

Cases, SOCs, saved findings, recent lookups, images and Reference packs stay in this browser profile. Gather has no case-data cloud sync or analytics. Deliberate lookup/search requests still contact the selected platforms and providers. Public source code is separate from your local work.

Red controls delete the indicated local Gather records. Deleting a finding keeps separately saved images/tasks; deleting a case removes its scoped local records/images. Previously downloaded files, backups, browser/provider history and OS clipboard history are separate. Logical deletion is not forensic erasure.

Redaction is manual. **Private `.gather` backups are unencrypted and include originals**, which can contain more than a cropped or redacted image. Review what you copy/export and keep backups in an approved private location. Gather cannot control system clipboard or folder synchronization outside the extension.

## Capture and storage limits

Workspace metadata is bounded to 4 MiB; binary capture storage uses IndexedDB with a 512 MiB application limit, 192 MiB per capture and 64 MiB per asset. Browser quotas may be lower. Backup/restore includes images and stable relationships; keep backups because browser data can be cleared or evicted.

Full-page capture is bounded to 24 tiles, 48 million pixels, 24,000 CSS-pixel height and 60 seconds. Sticky elements, lazy loading, infinite feeds and layout changes can produce explicit partial results or seams. Scroll positions and temporary changes are restored on completion/cancellation. Independently scrolling containers and custom export-root folders remain unsupported.

Optional automatic folder export uses **Downloads / Gather** subfolders. Saved in Gather and Exported to folder are separate states; a failed export retains the image and offers Retry. The Downloads API does not grant arbitrary absolute-path access. SHA-256 checks byte integrity, not authenticity or identity.

## Verification

This is a release candidate. Automated checks and installed Linux Edge workflows use fictional data. Windows scaling, signed-in managed-browser behavior, native Windows dialogs and work-app clipboard targets require target-computer verification. External sites can change or refuse access.

See the [versioned testing report](https://github.com/roedoeroe/Gather/blob/1.8.18-rc.1/gather/docs/TESTING.md) for this build's results and limits. The extension needs no runtime server, install script, bundler or cloud credential.
