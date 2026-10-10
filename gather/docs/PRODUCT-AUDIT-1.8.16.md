# Product audit — Gather 1.8.16 RC

Scope: R6 implementation, reviewed against the supplied R9 workflow brief. Real work and private source attachments remain outside the repository. Findings are classified P0 (wrong output/privacy/data loss), P1 (materially broken core path), P2 (friction), P3 (future capability). No claim of universal perfection.

| Area / reproduction | Expected / observed | Severity, cause and action | Regression / status |
|---|---|---|---|
| Narrow workspace, Reference added | Five sections remain reachable; Settings extended past the page edge. | P2. Tab padding/intrinsic width. Allow contained horizontal scrolling and reduce narrow padding. | Native 400px Reference/page-width assertion; fixed. |
| Keyboard arrows across Reference tab | Arrow navigation keeps focus on the tab; Reference focus-on-open could steal it. | P2. Event ordering. Restore requested keyboard tab focus after view event. Mouse selection still focuses search. | Rendered navigation sequence; fixed. |
| Blocked source-image fetch | Useful failure stays visible; broadcast refresh could replace it with a generic missing-image message. | P2. Refresh ran for unsuccessful records. Refresh previews only for saved captures. | Native denied/CORS/blob failures with no fake saved action; fixed. |
| Reference search in a large collection | Keystrokes should not repeatedly normalize all source text. | P2. Repeated allocation. Cache prepared normalized index per immutable loaded pack. | Large fictional-corpus timing and rank checks; fixed. |
| POSS TEMPLATE source label | Possible wording must not look approved. | P2. Broad template classification. Preserve separate possible-template type and label. | Node import/type test; fixed. |
| Reverse search with saved/local image | Image selected in Gather before opening provider; old tool only opened a landing page. | P1 workflow gap identified by R9. Shared local selection/preview/change/remove, explicit Copy & open, safe manual fallback. | Native saved-asset and local-file paths; implemented. |
| Full account-tool paste Enter | Same validated execution as button; full tool required Ctrl/Cmd+Enter. | P2. Popup already had normal Enter; align full tool while preserving Shift+Enter/IME/repeat/busy guards. | Toolbar/batch and native analyst keyboard checks; implemented. |
| Restore test expected all remapped IDs in workspace result | Verify relationships from actual stored restored records; capture IDs use a separate map. | Harness correction, not data-loss defect. Compare project, scan, subject and original bytes in restored capture store. | Native binary merge restore; passed. |
| Native folder picker automation | Picker receives focus as a user would; unfocused background-page injection timed out. | Harness correction. Bring the workspace forward before selecting local folder. | Native recursive import/preview/exact Copy; passed. |
| Worker message test from wrong extension page | Sender restriction remains enforced. | Harness correction. Quick-lookup requests originate from popup, not workspace. | Native five-platform content tests; passed. |

Provider 403s are external access limitations, not successful searches. Signed-in Windows/native display scaling and OS dialog checks remain explicitly unverified. Blocked/temporary source images and ambiguous content owners fail visibly. See [Future Plans](FUTURE-PLANS.md) for P2/P3 work and [TESTING](TESTING.md) for the final test receipts and clean-pass status.
