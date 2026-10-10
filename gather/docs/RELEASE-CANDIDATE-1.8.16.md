# Gather 1.8.16 RC — release scope

This release extends 1.8.15 after preserving its baseline and existing packages. It includes R6's local/privacy/content requirements and R9's image-first reverse-search and analyst-workflow review. See [Product Audit](PRODUCT-AUDIT-1.8.16.md) for fixes and [TESTING](TESTING.md) for completed evidence.

Shipped: five supported content-owner bindings with clean profile output and separate provenance; exact clicked source-image acquisition; separate source-image auto-copy; shared image-first reverse search with explicit copy/provider launch; local Markdown/JSON Reference import and retrieval; static keyboard search completion; consistent pasted-link Enter behavior. No permissions, host patterns or remote services were added.

Existing screenshot integrity, bounded scrolling selection/full-page capture, original/derivative separation, manual crop/arrows/circles/redaction, five Recents, case deletion and binary recovery remain. The two-second conditional Instagram readiness buffer is unchanged. Tests use deterministic fictional account and case data. The real organization corpus was not available and is not bundled.

## Platform behavior

| Platform | Profiles | Content input | Bound-owner requirement |
|---|---|---|---|
| Instagram | Existing adapter | `/p/code`, `/reel/code` | Matching code/shortcode and explicit owner/user object. |
| Facebook | Existing adapter | Supported `/reel/id`, `/videos/id`, `/watch/?v=id` | Matching content ID with typed User/Page author. Identity-critical `profile.php?id` is retained. |
| Threads | Existing adapter | `/@handle/post/code` | Matching code and explicit author matching the handle. |
| TikTok | Existing adapter | `/@handle/video/id` | Matching video ID with explicit author matching the handle. |
| YouTube | Existing adapter | `/watch?v=id`, `/shorts/id` | Matching `videoDetails.videoId` and exact channel ID. |
| X | No ID extractor | Search only | No ID/owner claim. |

Native controlled fixtures exercise each implemented content binding; this is not a live signed-in acceptance claim. Site structure changes, security checks, missing authors, conflicts and unsupported short links remain explicit uncertainty. No identity/person/threat inference.

## External limitations

- Native Linux Edge is available and tested. Signed-in Windows/managed deployments, Windows display scaling, destination application clipboard managers and OS save/print dialogs require verification on that actual system.
- Reverse-search providers receive no image automatically. Some landing pages return 403 or vary by region/session. [Capability matrix](REVERSE-IMAGE-PROVIDERS.md) separates navigation from real submission.
- Source images may be protected, temporary/blob, redirected, canvas-only or CORS-blocked. Failure remains visible; no screenshot is substituted. Clipboard/edits use a decoded frame for animation; original bytes remain unchanged.
- Full-page/dynamic feeds are bounded; nested-scroller capture and custom export roots remain deferred. Partial status must be reviewed.
- Local storage is not encrypted. Private backups include originals. Deletion does not remove external files or clipboard/browser history. Reference has a separate collection export/import.

## Update and rollback

Download only the extension ZIP. Extract it into the same installed `account-id-tool` directory after closing Gather/captures, then Reload at `edge://extensions`; confirm 1.8.16. Do not uninstall or clear storage to update. For new installations, enable Developer mode and Load unpacked if organization policy permits.

Keep 1.8.15 and a matching pre-update backup. Verify rollback in a separate Edge profile; 1.8.15 cannot interpret every new source-image type or Reference collection. Export Reference separately before changing profiles. Old packages/tags remain immutable.
