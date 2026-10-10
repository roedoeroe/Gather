# Gather 1.8.16 RC

A local Edge extension for exact account IDs, screenshots and deliberate research. **Open a page → Gather → inspect or copy.** A case is optional. Blue/white controls keep routine work in the toolbar; the full workspace has Research, Captures, Case, Reference and Settings.

## What changed

- Supported video/post URLs can resolve their explicitly bound author. TikTok videos, Instagram posts/reels, Threads posts, YouTube videos/Shorts and supported Facebook videos/reels return a clean canonical owner profile. Exact IDs remain strings; ambiguous/missing author structures fail visibly.
- **Save source image to Gather** is available by right-clicking an image. It preserves the exact returned PNG/JPEG/WebP/AVIF/GIF bytes, source URL, dimensions and hash under the frozen Case/SOC. No guessed CDN rewrites or screenshot fallback. Auto-copy source images is a separate option.
- **Reverse image** starts with a selected local file or stored capture. Preview, change/remove, then Copy & open the chosen provider. The image is not uploaded automatically. Manual upload options remain when clipboard/provider support differs.
- **Reference** imports a local Markdown folder or transparent versioned JSON pack, searches titles/sections/paths/text/aliases with conservative typo matching, and copies exact source wording. No proprietary content, remote AI, email composition or live OneNote dependency.
- Static gray search completions support Tab/Enter acceptance and Escape dismissal without retaining queries. Enter runs pasted account links; Shift+Enter adds a line.

The existing two-second conditional Instagram readiness check, exact selection pixels, scrolling selection, crop handles, red arrows/circles, manual black redaction, original/derivative separation, five Recents and guarded backup/deletion remain.

## Install, update and rollback

You need only **Gather-1.8.16-extension.zip**. Extract it to a permanent folder; in `edge://extensions`, enable Developer mode and Load unpacked → **account-id-tool**. Your organization must allow unpacked extensions. Pin Gather and open Help for workflow guidance.

To update, finish captures and close Gather windows. Preserve a private backup as appropriate. Replace all files at the **same installed account-id-tool path**, then Reload; confirm **1.8.16**. Do not uninstall or clear browser storage. Keep the immutable 1.8.15 ZIP and a matching pre-update backup. Test rollback in a separate profile: old builds cannot understand all new source-image formats or Reference features. Reference has its own collection export, separate from case backups.

## Local work and deliberate external actions

Cases, SOCs, findings, lookup history, images and Reference remain in this browser profile. Another profile using Gather has a separate store. Gather has no case cloud, storage.sync work data, telemetry or analytics. Lookups contact their platforms; explicit web searches contact their selected service. Search queries are not retained by Gather. Source-image retrieval requests only the clicked image URL; external reverse search is explicit and does not automatically upload an image.

Red deletion controls remove local records and image blobs in the selected scope. They cannot delete browser/provider history, clipboard history, exported files or endpoint backups. Manual redaction creates a derivative and leaves the original intact. Private `.gather` backups are unencrypted and include originals. Reference exports contain original source wording. This is not forensic erasure, encryption or legal certification.

[Storage/deletion](docs/PRIVACY-DATA-FLOW.md) · [Network inventory](docs/NETWORK-EGRESS.md) · [Provider capabilities](docs/REVERSE-IMAGE-PROVIDERS.md)

## Limits and verification

This is a controlled release candidate. Supported URL recognition does not guarantee a platform exposes a reliable author/ID. Opaque short links, ambiguous content and login/security challenges do not produce guessed identities. X remains search-only. Full-page capture is bounded to 24 tiles, 48 million pixels, 24,000 CSS pixels and 60 seconds; changing feeds/sticky content can cause partial output. Check completion status.

Storage limits: 4 MiB workspace JSON; 64 MiB image asset, 192 MiB capture and 512 MiB image total. Source-image access can fail on authenticated, redirected, temporary/blob, canvas-only or CORS-blocked resources. Clipboard conversion to PNG can flatten animation to a still frame; original bytes remain unchanged. Reference: 2,000 files, 2 MiB/file, 20 MiB/collection, 100 MiB total. Imports exclude common unsafe folders/credential markers but do not replace review of approved source material.

[TESTING](docs/TESTING.md) separates deterministic, rendered/mocked, native Linux Edge and external-provider checks. Windows signed-in sessions, native Windows scaling, OS dialogs and application clipboard integrations remain unverified. No universal browser/site reliability guarantee is claimed.

[Product Audit](docs/PRODUCT-AUDIT-1.8.16.md) · [Future Plans](docs/FUTURE-PLANS.md) · [Quick Start](account-id-tool/COWORKER-QUICK-START.md) · [Handoff](docs/NEXT-RUN-HANDOFF.md)

## Development

Runtime: `account-id-tool`, plain packaged modules with no server, bundler or runtime install. Node 24/Python 3 run checks. From `gather`:

```sh
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
```

See TESTING and ENVIRONMENT-SETUP for browser commands. Do not edit runtime/tests while suites run. Package only into a new immutable version directory after final verification. Public evidence must remain fictional; scanner pattern checks are not a universal sensitive-data detector.
