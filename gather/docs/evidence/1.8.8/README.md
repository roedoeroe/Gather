# 1.8.8 validation evidence

This was a validation-first run against the user's Edge/1.8.7 target. The existing 1.8.7 baseline freshly passed 132 Node checks, 85 rendered groups and 10 actual worker groups before runtime changes. Final 1.8.8 has **154 Node checks, 85 rendered groups and 10 actual worker groups**, zero failures/skips. Reruns/package checks are not additional unique groups.

- [Node results](node-run.txt) include 22 fictional Instagram checks. [Before-fix results](instagram-before.txt) reproduced five failures in the first 21 checks; the final check also rejects malformed primary keys.
- `capture-results.json`: 21 groups; actual canvas/IndexedDB/stitching/cancel/restoration, original/derivative hashes, binary backups and geometry. Screenshot APIs are doubles.
- `toolbar-results.json`: 22 groups; direct page selection/keyboard/copy, real PNG/text clipboard, frozen filing, history/deletion, exports and current-page lookup. The lookup now distinguishes fictional Instagram pk from its separate id.
- `case-results.json`: 18 groups; reviewed intake, explicit associations, local/session retention, privacy deletion/backup denial, late writes and restore.
- `stabilization-results.json`: 10 groups; cross-window exports, stale redaction/print/editor/copy, acquisition/preview recovery and interruption retry.
- `case-clipboard-results.json`: 7 groups; current reviewed blocks, exact IDs/labels/dates, stale scope, Cancel, denied clipboard/manual fallback, case deletion and 400px reflow.
- `installed-ui-results.json`: 7 current workspace journey groups, rendered with API doubles rather than an installed extension.
- `worker-results.json`: 10 actual Chromium worker/IDB/Web Locks/stop-restart groups. Chrome extension APIs are doubles.

## Live verification boundaries

Ordinary sandboxed Chromium loaded three anonymous Instagram profiles: one user-authorized profile and two official platform accounts. All returned HTTP 200, rendered without page exceptions, and were visually inspected. Old code rejected their loaded DOM as ambiguous; current code resolves their account pk, corroborated by the account-bound initial profile route. The initial HTTP response also resolved without inventing unavailable display name/privacy/content metadata.

The actual popup quick worker/resolver, Run on this page and Copy IDs were exercised with those loaded DOM snapshots. All three exact keys were copied using real clipboard readback. Tab/scripting access was controlled replay: **not native extension injection or Edge acceptance**. No credentials were requested or sent. Real HTML, screenshots, identifiers and local report/backup stay in ignored artifacts outside public source/packages. This evidence publishes only the result/scope, never the actual account data. Three successes are not a platform-wide reliability rate or identity proof.

Other live platforms, signed-in Instagram and native FireShot were not tested. Existing native install blocker was rechecked as unchanged managed `ExtensionInstallBlocklist:["*"]`; no prohibited load or security bypass was attempted. There is no native toolbar/activeTab screenshot/OS save-print dialog, native browser zoom or screen-reader acceptance claim.

## Usability and performance

[Measured fixture results](ux-results.json) use actual modules/DOM/IndexedDB and extension API doubles, with 1,000 fictional notes and 100 small PNG captures. All four views at 400/800/1440 CSS pixels and a 420px popup reflowed without horizontal overflow. Tab arrows/Home/End, Escape and image-inspector focus return passed without changing the scan. Offscreen findings still render on scroll and open/cancel their note dialog. Capture history initially renders 12 images, then Show more renders 24.

Before the CSS fix, clear-filter-to-two-animation-frames took about 397 ms and reload-to-ready 855 ms; afterward about 116 ms and 300 ms. Capture filter measured about 48 ms and Show more 112 ms. Single-run Linux Chromium measurements include harness overhead and vary with content, storage and hardware. The public JSON is the final fixture observation; it is not a latency distribution or Edge guarantee. Initial fixture-driver errors were corrected (ambiguous partial-title matching, observer lifetime across reload, and waiting a frame for deferred contents); they are not counted as product tests or successes.

The offscreen rendering choice follows [Chrome's content-visibility documentation](https://web.dev/articles/content-visibility), fetched with verified TLS. DOM/search/accessibility-tree retention differs from display:none; print styling disables containment. Actual assistive technology and native printing remain untested.

Visually inspected screenshots: [workspace](workspace-desktop.png), [narrow workspace](workspace-narrow.png), [capture history](capture-history-desktop.png), [image inspector](capture-inspector.png), [popup](popup.png), [narrow Settings](settings-narrow.png). Existing typography/hierarchy and four task views remain; this is not a design overhaul or a universal accessibility/visual-perfectness claim. Linux's fallback font renders some external-arrow glyphs differently from Windows.

Node 24.19, Python 3.12.14, Playwright 1.62.1 and sandboxed Chromium 151 were used. Package checks verify SHA256, CRC, versions, every runtime byte, source inclusion and exclusion of real observations. See the independent release delivery receipt for exact ZIP hashes and final source/package commit; LOCAL-ACCEPTANCE lists the remaining installed Edge checks.
