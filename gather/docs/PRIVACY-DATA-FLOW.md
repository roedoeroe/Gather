# Local data and deletion — Gather 1.8.16 RC

Gather behaves like a local document utility: another installation cannot see your documents merely because it uses the same software. Each browser profile has its own extension storage. This is local isolation, not encryption, anonymity, forensic erasure or legal certification. Public source does not contain local work.

| Data | Storage / lifetime | Removal and boundary |
|---|---|---|
| Cases, scans, saved accounts/links/notes/tasks | `chrome.storage.local`, bounded 4 MiB workspace | Red case deletion removes scoped local records. Saved content remains until deliberately deleted. Legacy scan structures preserve relationships; Case > SOC is the normal filing model. |
| Quick lookups | At most five recent local batches; operation/destination IDs in session | Clear recent lookup history removes drafts/results with generation guards. Does not delete saved findings, cases, images or Reference. IDs are exact strings. |
| Web/reverse-search input | DOM memory only; explicit provider navigation | Not a Gather search history. Providers and browser history are outside Gather. Partial queries are not used to train autocomplete. Reverse-image local files are not automatically saved to cases. |
| Original screenshots, tiles, source images | Extension-origin IndexedDB `gather-captures-v1` | 64 MiB/asset, 192 MiB/capture, 512 MiB total; browser quotas may be lower. Records include URL, time, hash, geometry, completion state and frozen Case/scan/SOC. |
| Image edits | Separate derivative asset with parent/operations | Copy/Save/Print uses the selected derivative; a missing/stale selection fails, never silently exposes the original. Manual redaction does not delete the original. |
| Subjects/SOCs | Stable project-scoped IDs, names and explicit observation associations | Renames preserve history. Same names have distinct IDs. No inferred identity or account merging. |
| Legacy ephemeral fields | Session overlay, when present from earlier cases | Reload/browser restart releases session names. Saved findings, source URLs and image pixels may still identify people. |
| Source-image pending job | One-use `chrome.storage.session` job consumed by controller | Frozen destination before retrieval; cancellation/failure creates no false saved image. Interrupted binary writes recover through existing capture recovery. |
| Local Reference | Separate IndexedDB `gather-reference-v1`, atomic versioned packs; 20 MiB/import, 100 MiB library | Delete collection removes the local pack/index. Case deletion/backup does not include Reference. Export/import each collection separately. No proprietary corpus ships. |
| Operational guards | Session/local IDs, IndexedDB revision/tombstones/restore journal | Block stale writers and recovery races. Guard IDs may outlive removed content. |
| Clipboard | OS clipboard after Copy or separately enabled auto-copy | Outside Gather after copying. OS history/sync and pastes elsewhere cannot be erased by Gather. No silent clipboard read. PNG clipboard conversion can flatten an animated source to one frame; stored original is unchanged. |
| Downloads/exports/private backups | Separate local files | Not removed by case/history/collection deletion. Private `.gather` backups are unencrypted and include unredacted originals. Reference exports contain the original imported text. Protect these files using your organization's controls. |

All captures offer guarded individual/bulk deletion. Case deletion removes that case's related local image blobs and records. Failed folder export retains the saved image and can be retried. Logical deletion is not proof of physical disk erasure; device backups, filesystem snapshots and endpoint access controls are separate.

Reference imports exclude Login-Info, ARCHIVED-DONT-USE, media and duplicate export folders, and reject common credential markers. This is not a universal secret detector: choose approved source folders and inspect the imported collection. Markdown previews use `textContent`, not HTML execution or live embeds. No Reference file or user query is sent to a remote index/AI.

[Network-egress inventory](NETWORK-EGRESS.md) documents deliberate site requests, session use, permissions and verification limits. Actual work can contain personal information; Gather does not automatically redact, decide disclosure, determine threats or certify organizational/legal compliance.
