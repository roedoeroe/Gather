# Gather 1.8.16 RC engineering notes

Plain MV3 extension modules; no runtime dependencies/build server. Manifest permissions and host patterns are unchanged. New entry pages and modules are included directly by the deterministic ZIP packager. `profile-reader.js` is generated from local adapters; run `python3 scripts/build-profile-reader.py --check`.

Content lookup keeps profile normalization strict and adds a separate allowlisted content descriptor. Extraction requires the requested content ID/code and explicit User/Page/channel author structure. Conflicting owners/IDs fail. Exact string IDs survive parsing, result copy and backup. Accepted content output is rebuilt from canonical profile identity; the originally requested URL remains separate local provenance. Instagram profile readiness stays conditional, bounded to two seconds before the existing source/public fallbacks.

Source-image jobs freeze workspace/tab context and selected subject before asynchronous acquisition. One-use session jobs launch a visible controller. An explicit exact-URL request has no credentials/referrer, rejects redirects, enforces byte/time/pixel limits and preserves the original response Blob. The existing binary store supplies hashes, guarded completion/deletion and backup/restore. Added asset MIME types are WebP/AVIF/GIF alongside PNG/JPEG; old releases cannot safely restore all new formats. Blob/canvas/blocked sources do not silently become screenshots.

Reverse selection is transient UI state. Local files are not filed or logged. Saved assets are verified again before use; selected derivatives cannot silently revert to originals. Clipboard output is PNG because the browser clipboard interface requires it. Providers share one allowlisted landing configuration. No private upload endpoints, browser permission expansion or automatically transmitted source URLs.

Reference uses its own origin-scoped IndexedDB. Imports are bounded, validated and committed atomically with revision checks; malformed/stale updates retain the prior pack. Original file text and slice offsets preserve exact sections. Markdown is inert text. Loaded immutable packs use a prepared WeakMap index; keystrokes do not reparse all files. Collection JSON is inspectable/versioned and exported separately from case backup. No real organization corpus is bundled.

Autocomplete uses static operator/domain candidates only. It honors provider capabilities, quote/caret boundaries, paste/IME behavior and explicit acceptance. No query-learning storage. The main account input follows the same button execution path for Enter and preserves Shift+Enter.

Same-folder updates preserve the extension ID and local data; never uninstall to update. Run regression on source and selected suites on the **exact extracted ZIP**. The release upload workflow reads the immutable committed package, verifies receipt/hash/CRC/manifest and attaches it without rebuilding. Preserve older tags and ZIPs. GitHub Releases carries only the extension asset; source/checksum receipts remain available for developers.

See [TESTING](TESTING.md), [Network Egress](NETWORK-EGRESS.md), [Product Audit](PRODUCT-AUDIT-1.8.16.md), and [Future Plans](FUTURE-PLANS.md).
