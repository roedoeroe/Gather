# Gather 1.8.9 capture checkpoint

On-page selection uses document coordinates and full-viewport dotted guides. Pointer wheel/edge scrolling is bounded to the initial top-level extent; Escape, navigation, visibility change, resize, controller closure and timeout clean the overlay and restore original scroll/focus. Successful release removes the overlay before acquiring pixels. Extended regions use paced validated viewport tiles and a selected crop derivative. Originals/geometry/limitations remain in binary storage. Bounds or changed page extent never claim complete. Horizontal overflow, nested scrollers, animation/lazy loading and pinch zoom retain stated limitations.

Manual editing uses an SVG gesture preview and redraws the binary canvas only on committed operations. Red arrows/circles and black redactions are flattened into PNG pixels; crops apply in order. Undo and numeric controls are available. Changed operations/notes disable Copy until saved; stale editors reject writes. Busy controls prevent edits during encoding/save. Repeated Save & copy without new edits reuses the saved image instead of adding duplicate derivatives. No automatic redaction or analytical classification.

Screenshot auto-copy defaults on and snapshots its preference at launch. The explicit Select area & copy action overrides off deliberately. Preferences merge in one IndexedDB transaction, so simultaneous folder/copy updates cannot erase each other. Existing ID auto-copy is separate and preserved.

Review sheets validate selected asset, inclusion and review state before output and invalidate open sheets on cross-window changes. Single-image source captions default off, outside original pixels. Privacy backups contain all originals; ordinary image output uses the selected derivative. All current permissions, binary/workspace schema and retention behavior remain unchanged. Source is public; real cases/uploads stay out of fixtures and ZIPs.

## Preserved 1.8.6 engineering notes (historical)

# Gather 1.8.6 stabilization

Preserved 1.8.5 source/packages were verified before edits. This run fixes confirmed existing capture failures and adds no product features. Previous architecture notes remain in [history/1.8.5-BUILD-NOTES](history/1.8.5-BUILD-NOTES.md).

## Lifecycle and completion

capture-launch queues finish with launch: an early controller cannot release before windows.create writes the lock. Window-removed cleanup uses the internal release while already inside that queue, avoiding nested deadlock. Wrong launch IDs cannot release another capture. Frozen source/token cleanup and page watchdogs remain.

capture.js releases acquisition after completeCapture commits, before preview loading/focusing. The initial preview verifies the current selected asset; failure recovers on focus. Completion refreshes persisted folder state on broadcasts. A busy-output set preserves disabled controls during concurrent refreshes. Deletion revokes preview URLs, displays deletion and keeps image actions disabled after delayed output success/failure. No layout redesign was added.

## Current-image guards

The editor supplies expected shareAssetId to addCaptureDerivative. Its image transaction rejects a newer selection, preventing an older editor from replacing a redaction with pre-redaction pixels. Current-editor subsequent saves remain supported. Original bytes and previous derivatives are retained.

Clipboard PNG conversion rechecks selection after encoding, before resolving ClipboardItem bytes. Save-as already had this guard. The print document monitors changes/focus, clears stale pages/Blob URLs, disables Print and requests reopening after replacement/deletion. The explicit Print action validates again. Captions stay outside original pixels; native printer/PDF acceptance is outstanding.

## Folder ownership and restore

An IndexedDB transaction claims one export with an attempt ID across documents. The local promise map remains a convenience. Rejected claims never mark another job failed. Ownership/selection checks run before each dispatch/completion; completion/failure patches require the same attempt. Late work cannot overwrite a newer retry. Claims increment attempts atomically and clear old completed-download fields.

Editing and capture/case deletion wait for active export. State broadcasts let other views display progress. Recovery waits five minutes instead of two, exceeding two supported 90-second completion waits. A snapshot guard prevents overwriting a changed attempt; unexpected storage failures surface. Already dispatched browser downloads cannot be recalled by later state changes. Image/companion downloads are separate OS operations: failed second downloads retain the capture, and Retry uses unique filenames.

Binary restore preserves bytes/relationships, remaps export.assetId and makes imported exporting jobs failed/retryable without a live attempt ID. A backup cannot restore the original browser's running download. Container/workspace schemas and original hashes are unchanged.

## Validation and boundaries

130 Node checks, 71 rendered-browser groups and 10 actual Chromium worker groups passed; TESTING defines their scope. New regressions fail before their fixes. Capture, lookup, case/privacy and worker suites were rerun after the final restore correction. Packages are byte-verified and tested from extracted contents.

Manifest/package/version_name agree on 1.8.6. Permissions/host permissions match 1.8.5 exactly. No dependency, cloud storage, analytics, passive collection, inferred identity or threat logic was added. Cases/images/history remain local; selected services and user-created exports keep their existing boundaries.

Native unpacked loading remains administrator-blocked. Do not weaken policy or equate API doubles with native acceptance. Native clipboard/save/print UI, activeTab/focus/screenshot acquisition, high-DPI/zoom, browser resets, Edge and live platforms require the permitted-browser checklist. Nested scrolling/custom roots remain unshipped.
