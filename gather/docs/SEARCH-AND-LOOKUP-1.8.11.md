# Search and lookup — 1.8.11

- Web searches open a new tab without saving the query, a draft or a launch log. Related tabs keep only their filing context for the browser session.
- Reverse image search sits beside Search the web: Google Lens, Lenso.ai, Bing, Yandex, Baidu, Sogou, TinEye and Shutterstock. Choose/upload the image on the provider’s website; Gather uploads nothing automatically.
- Find IDs on this page reads the same authorized profile’s source automatically when rendered account data is missing. Instagram `profile_id` and Facebook `userVanity`/`userID` remain bound to the requested account; unrelated/conflicting IDs are rejected.
- Short gray examples in empty fields supplement persistent labels. They disappear as you type and never become saved values.
- Saved findings / Tasks / Changes clarifies what you deliberately keep. Capture history refreshes as one complete list, avoiding empty/partial flicker while thumbnails load.

## Retention and compatibility

Search privacy cleanup runs on update/first workspace use. Older automatic query text, search URLs, search activity and search drafts (including archived drafts) are removed from Gather. Query-free legacy reference IDs/timestamps remain so existing findings/captures and backups keep valid relationships. No new search records are created. Older backup imports receive the same cleanup. Deliberately saved case fields, search plans, account observations, tasks, findings and images are preserved. Browser/provider history, clipboard and previously exported files are separate and cannot be cleared by this update. Previously exported backups can still contain old search text.

The pending input exists only in the open page DOM. It clears after a successful launch, a scan change or reload; failure keeps it available to retry. No query enters `chrome.storage.local` or `chrome.storage.session`. Case-plan queries are deliberately saved templates and are labelled as such. Explicit queued launches may update the plan/coverage status, without keeping another resolved query. New search tabs receive project/scan IDs in session storage before navigation. Browser-provided opener relationships continue that filing context; there is no new stored discovery claim.

## Source reading

A resolved hydrated ID takes the fast path. Missing account data triggers one same-document `chrome.scripting` source read with same-origin credentials, no cache, a 12-second timeout and a 15-million-character limit. A current-document target and URL recheck reject navigation; cancellation discards the result. Login/security screens, different profiles and ambiguous IDs do not trigger repeated requests. No source HTML is saved. Site access controls remain in force. Manual source import remains optional in the full lookup tool.

Supported extra shapes are assigned Instagram JSON containing a matched username/profile_id, Facebook matched userVanity/userID, and a Facebook initial route linking the same vanity and URL to its own views. JSON is parsed, never executed, and long integers remain exact strings. Fictional mismatch/conflict tests cover recommendations and nearby unrelated IDs. These fixtures do not establish support for every live page variant.

## Reverse-image provider research (2026-10-08)

The launcher uses fixed HTTPS provider pages, no undocumented upload API and no automatic image/clipboard read. The selected provider decides its upload, account and payment requirements. Gather does not interpret or save provider results automatically.

- [Google Search Help](https://support.google.com/websearch/answer/1325808?hl=en) documents camera/upload and image-link interaction. HTTP 200. [Google Images](https://images.google.com/) returned 200 and is the launcher; lens.google redirected to a marketing page, so it was not used as the launcher.
- [Lenso.ai](https://lenso.ai/en), [Yandex Images](https://yandex.com/images/), [Baidu Images](https://image.baidu.com/), [Sogou Images](https://pic.sogou.com/) and [TinEye](https://tineye.com/) returned HTTP 200. Baidu graph.baidu.com redirected to a mobile homepage; use its image-search homepage instead.
- [Bing Visual Search](https://www.bing.com/visualsearch) and [Shutterstock](https://www.shutterstock.com/) returned 403 to this cloud’s ordinary HTTP requests. Their launch destinations are included as requested; their current upload UI was not verified here. Shutterstock opens its homepage; use the camera/image search control if available.

These are destination/document checks, not executed reverse-image searches. No image or case content was submitted. No universal platform reliability, identity conclusion or legal certification is claimed.
