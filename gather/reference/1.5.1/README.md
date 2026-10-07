# Gather — Account IDs · 1.5.1

Paste links, a finished list, or a messy conversation. Gather keeps each account together, without numbering:

```
Display name:  Example Name
https://www.tiktok.com/@example (POSS/EMPTY)
User ID: 1234567890123456789
```

## Install once

1. Extract `Gather-Account-IDs.zip`. Keep the `account-id-tool` folder somewhere permanent.
2. In Chrome, open `chrome://extensions`. In Edge, open `edge://extensions`.
3. Turn on **Developer mode**, click **Load unpacked**, and select the **account-id-tool** folder containing `manifest.json`.
4. Open your browser’s Extensions menu and pin **Gather — Account IDs**. Clicking its toolbar button opens the compact lookup panel beneath it.

No build, server, API key, or subscription is required. Opening `index.html` directly does not enable live lookup.

**Already installed?** Replace the files in the same extension folder, click **Reload** on its Extensions-page entry, and refresh Gather. Keeping the same folder preserves its browser-local batches. Do not uninstall first if you want to keep saved data. Updates from 1.1 also add Threads site access; your browser may ask you to enable it.

## Quick toolbar panel

Paste a profile link or mixed list, then press **Enter** or click **Get UserIDs**. **Shift+Enter** adds a new line; Ctrl+Enter / Command+Enter still runs. When lookup finishes, the input clears for the next account. Results stay below and in Recent batches. Reopening the panel focuses the empty box, ready to paste. Results keep the same display name, original link with notes, and user ID. The panel stays small; longer results scroll inside it.

Already viewing an account? Open Gather and click **Run on this page**. It grabs the current profile link and starts immediately, reading the open page first to avoid an extra request when the account data is already available. Your page stays open. Auto-copy follows your saved setting. The button is greyed out on unsupported pages, posts, videos, homepages, or while a page is still loading. Gather checks the page again before running, so a changed tab cannot be silently used for the wrong account. If the page cannot provide its account data, normal live lookup is still available.

**IDs only** copies eligible IDs with new lines, commas, or spaces. **Account details** copies the full formatted list. Supplied IDs are still checked, and a mismatch requires **Use found ID** before it can enter IDs-only output. If clipboard access is blocked, selected text appears for manual copying.

In **Account details**, use the **Display names** switch to include or omit the name line. It updates the visible account details, copied and automatically copied text, and the full tool's text download. Links, notes and IDs stay together. Names remain stored with the batch, so switching them back on does not require another lookup. The choice is shared between the quick panel and full tool and remembered next time. IDs-only output is unaffected.

The browser closes the panel when you click elsewhere. Lookup continues in the background, and its input clears when it finishes even if the panel is closed. Results remain available when you reopen it. Unsubmitted drafts and interrupted work are preserved. **Auto-copy** copies on completion while open, or when you reopen after it finishes. It does not repeatedly copy the same completed batch. Stopped lookups never auto-copy. Use **Stop** or **Retry unfinished** as needed; an interrupted lookup keeps its completed results and can be retried.

Each submitted quick list saves as a separate batch in the same **Recent batches** as the full tool. **Full tool ↗** opens the current finished batch for naming, editing notes, source import, or rechecking. During an active lookup it opens the full tool without moving the quick lookup. The full tool also contains upload and history controls. Changing the input marks the displayed output **Previous results** until you submit the new links. Signed-in fallback follows the full tool's setting and closes its temporary tabs after lookup. This update adds no browser permissions.

## Improvements in 1.5

Copy settings stay in sync between the full tool and quick panel. Changing one option cannot reset a different option in the other view, and settings finish saving even if you immediately close the panel. A new lookup clears any old manual-copy text. Oversized rich-text pastes are rejected without replacing your draft. Current-page lookup adds no browser permissions and never closes the page you were viewing.

## Earlier improvements

Rich-text paste recovers account links even when the clipboard text only contains a link label. Pasted HTML stays inert and native Undo works for recovered links and file uploads. Rapid double clicks create one batch, and an immediately closed tab retains a just-edited project name. Reopening a recent batch reads its latest saved version. A batch becomes editable again after its owning tab closes and you reopen it from history. IDs obtained only from a URL are clearly marked as not checked against a page.

## Use

- Paste Instagram, Facebook, Threads, TikTok, or YouTube profile/channel links. Commas, spaces, new lines, tabs, semicolons, Markdown links, and older numbered lists work. **Upload a list** accepts plain .txt, .csv, and .tsv files under 100 KB.
- Message authors, timestamps, headings, family references, and `(edited)` clutter are ignored. IDs stay with the immediate account block. A number separated by unrelated prose is flagged for review. A `Banned Account:` prefix becomes a supplied `(BANNED)` note on the following link; Gather does not independently infer bans.
- Click **Find accounts**, or press Ctrl+Enter / Command+Enter.
- Results show **Display name:**, your original link, and the user ID. Missing names are marked unavailable. Names supplied in an imported list are marked until checked against the page.
- **Copy list** keeps all accounts and their notes. **IDs only** copies eligible IDs separated by new lines, commas, or spaces, removing repeated IDs within each platform. Excluded accounts are counted in the copy notification.
- **Auto-copy** copies the selected format when lookup finishes, when you save notes, and when you accept an ID correction. Each eligible ID also has its own Copy button.
- **Save list as text** downloads a record you can paste or upload again. The results scroll inside one compact list.

## Check an existing list

An ID belongs to the supported profile link directly before it. A following ID does not get shared across Instagram and Threads, even when the handles match. For example:

```
https://www.instagram.com/example/
https://www.threads.com/@example 123456789
```

The supplied ID belongs to Threads. Instagram has no supplied ID in that example.

Notes appear next to the link with a space, such as `(POSS/PRIV)` or `(POSS/EMPTY)`. **POSS is always your decision**. It is never inferred or added automatically.

Clear account data can add PRIV or EMPTY. EMPTY means an explicit zero public-post/upload count; it does not mean no private, hidden, or deleted content exists. A private profile takes PRIV, even when hidden content is reported as zero. Login failures, blank feeds, unavailable accounts, and generic page text never establish either status.

When fresh page data changes an older PRIV/EMPTY annotation, Gather shows the change and retains the original note in the saved batch and text report. If a new check cannot establish status, original annotations remain marked as unverified. Old automatic tags are not treated as fresh evidence.

Use **Notes** beside an account to edit annotations or switch off automatic PRIV/EMPTY updates for that account. Turning it off makes your entered status authoritative for output.

Status support depends on exposed profile data: TikTok and Instagram can provide privacy and post counts; Threads can provide privacy; Facebook can indicate a locked profile; YouTube can provide a public-upload count in its channel header. Facebook and Threads empty status is not inferred from missing content. Fields absent from the page remain unknown. YouTube's [documented public-video count](https://developers.google.com/youtube/v3/docs/channels#statistics.videoCount) explains why EMPTY refers to public uploads.

- **Matches page** means the supplied ID matched freshly fetched profile data. **Matches pasted source** identifies a match against HTML you supplied.
- **ID mismatch** shows both the supplied and found IDs. **Use found ID** accepts the correction while retaining the old value for reference.
- **Not verified** means Gather could not independently check it. A matching ID in a Facebook or YouTube URL alone does not verify an imported ID against the page.
- Duplicate links merge notes and supplied IDs. Different supplied IDs on the same account remain visible as a conflict.
- **IDs only** excludes unresolved, unverified, or conflicting supplied IDs until checked or a found correction is explicitly accepted. **Account details** always retains supplied IDs, including unresolved ones.

Reimporting a report starts a new check. Previously written verdicts and found-ID comparison lines are not treated as fresh evidence. IDs remain strings so long numeric values cannot be rounded.

## Recent batches

Submitted batches save locally as results arrive. **Recent batches** reopens them without running another lookup. Add an optional SST project name above the results; multiple batches can share a name.

**New batch** starts a separate list. **Recheck** refreshes all results. **Retry unfinished** resumes failed or interrupted lookups. Saved verification reflects its original lookup time, shown when hovering over the check label. Rechecking clears earlier correction approval so a changed result can be reviewed again.

Up to 50 batches can be saved. Nothing is automatically deleted. A batch open in another Gather tab is read-only to prevent accidental overwrites. Unsubmitted input is saved as a draft. History is specific to this browser/profile; save important lists as text before uninstalling or clearing extension data.

## If a lookup cannot finish

Open the profile and sign in or complete the site’s security check yourself, then retry. Under **? → Use signed-in pages**, Gather can try up to two temporary background tabs using your browser session. They close after lookup or when Gather closes.

**Source** lets you paste the account’s HTML from View page source, usually Ctrl+U on Windows. HTML is parsed as data, never executed or saved. Threads uses matching Threads profile data; it does not assume an Instagram ID is the same. Some Threads responses expose no usable account data, so those remain unverified.

Use profile/channel links, not posts, videos, stories, groups, or shortened share links. Names are profile display names, not independently verified legal names. TikTok returns a numeric user ID, using nonzero shortId only as a fallback. YouTube returns a UC channel ID. These are website IDs, not app-scoped OAuth identifiers.

## Privacy and validation

Gather connects directly to the supported platforms. There is no Gather server, analytics, third-party resolver, or API key. Browser storage contains drafts, batches, preferences, and temporary-tab ownership; it does not store page HTML or passwords. Clipboard permission is write-only.

Validated September 29–30, 2026 in isolated Edge extension profiles: live names and IDs resolved for Instagram’s account, Meta’s Facebook page, TikTok’s account, and Google for Developers on YouTube, including fresh lookups from the new quick panel's background worker. The actual native toolbar popup opened successfully. Quick-panel checks covered closure during lookup, restoration, deferred auto-copy without repeated writes, stopping/retrying, correction acceptance, full-tool handoff, manual clipboard fallback, interrupted-job recovery, and signed-in temporary-tab reading and cleanup while the panel was closed. The supplied eight-account example and the 14-account messy chat were checked for exact link/ID association and note retention. The latter preserved ten supplied IDs while removing chat clutter. Controlled browser cases tested matching, mismatched, and unavailable responses; those controlled tests do not verify the example accounts’ actual IDs. Separate live TikTok spot-checks resolved the supplied IDs for the private and empty examples and confirmed their respective statuses on September 29. History, corrections, source import, copying, upload, draft recovery, duplicate project names, status updates, manual overrides, and compact desktop/mobile layout were checked. Parser checks cover copied Markdown, rich-text quotes, bullets, zero-width characters, parenthesized IDs, punctuation, and 100 KB noisy inputs.

Platform page formats, login requirements, rate limits, and account availability can affect lookup. Gather leaves these failures visible and never guesses an ID.

Version 1.5 was also checked in the actual native popup with controlled profile-page data: one-click current-page lookup read the existing page without an extra fetch, preserved its original URL, automatically copied both name formats, and left the profile tab open. Non-profile navigation disabled the button, and a changed-page request was rejected before creating a batch. Name toggles, preview visibility, copy/download formats, settings synchronization, immediate-close persistence, oversized paste, and stale manual-copy clearing were checked in browser tests. These controlled fixtures are separate from the live platform checks above.
