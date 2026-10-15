# Post dates and author lookup — 1.8.19

One toolbar action, **Get real post date**, supports recognized Instagram, Facebook, Threads, TikTok, YouTube and X/Twitter content URLs. Lookup/copy remains case-optional. The existing Copy IDs action resolves an explicitly bound author; it never copies the post’s identifier as an account ID.

## Evidence and precision

The isolated packaged reader matches a post ID/shortcode, exact permalink or post-linked structured data before accepting a date. Instagram/Threads taken_at, TikTok createTime, Facebook creation_time, X created_at and YouTube publishDate are read only in their post-specific structures. ISO datetime requires a timezone. Ten-digit Unix seconds and thirteen-digit milliseconds are accepted. A time element must link to the exact post, with known comment/reply links excluded. Facebook requires a post/story actor structure, a typed content record or a video/photo owner; bare parent-post references, comment/reply types and comment IDs are rejected. Conflicting candidates fail explicitly. Modified times, relative labels, unrelated posts, user creation dates and snowflake-derived estimates are not used.

UTC is copied for exact timestamps; local time is a display aid. Date-only and minute precision are labeled, including in copied text. YouTube publishDate can be date-only and is not replaced by uploadDate. Millisecond input is retained; no subsecond accuracy claim is made. A date is site-supplied metadata, not independent proof of publication or authenticity.

## Privacy and lifecycle

User-initiated only. The reader uses the current DOM, then at most one existing bounded same-origin source fetch when data is missing. No backend, platform API endpoint, broad host or clipboard-read permission is added. X uses activeTab from normal toolbar invocation and is unavailable for background pasted-only lookup. Page/document and pending navigation are checked before and after reading. Tab activation/navigation clears the transient UI. Date results are not saved in workspace, Recents, captures or exports. Existing deliberate account lookups retain their normal five-batch local history.

## Limits

URL recognition does not guarantee data availability. Facebook obfuscated/nested story markup, X client-only data, login walls, private content and platform changes may expose no usable author or timestamp. Short/share links are not guessed. A matching date-only and absolute date that disagree is conservatively rejected rather than resolved by an assumed timezone. Feed posts require opening their individual permalink. No live signed-in compatibility guarantee is made.

## Primary documentation checked 2026-10-15

- https://developer.chrome.com/docs/extensions/develop/concepts/activeTab — temporary access follows explicit toolbar invocation; it is revoked on cross-origin navigation or closure.
- https://schema.org/datePublished — first publication or broadcast, accepting Date or DateTime.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time — datetime may contain date, time or duration; only validated absolute dates/times qualify here.
