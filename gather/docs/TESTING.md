# Gather 1.8.18 RC validation

Validation: October 14, 2026, America/Los_Angeles. All account/case/image fixtures in this run are fictional. No private organization corpus, Windows computer or signed-in platform session was available.

| Layer | Result | What it verifies |
|---|---|---|
| Node | 230 passed; zero failed/skipped | Account binding, exact IDs, URL handling, local storage, capture, Reference and completion rules. |
| Affected rendered workflows | 56 groups passed | Toolbar 30, capture 22, Help 4. Real DOM/canvas/IndexedDB with controlled Chrome API doubles; current-page action wording, readable labels, bounded popup, capture history and scoped deletion recovery. |
| Installed Linux Edge analyst journey | 34 groups passed | Actual extension APIs, toolbar/context menu, all three capture modes, native zoom 80–200%, source formats, copy/edit, SOC/history, deletion, backup/restore, offline and profile isolation. Platform responses are fictional. |
| Installed Edge toolbar/capture/editor | 23 groups passed | Real OS invocation, activeTab, capture, cancel/repeat, actual clipboard, annotations/redaction and original preservation. |
| Installed Edge workspace | 10 groups passed | Genuine worker/storage, query-free search, case/finding/task controls and navigation. |
| Same-folder Edge update | 3 groups passed | 1.8.17 → 1.8.18, supported extension Reload and subsequent real browser restart. |
| Syntax / generation | 68 runtime modules passed | Local generated reader matches adapters; only version/version_name changed in manifest. No permission, host-pattern or CSP change. |

Native layers total 70 groups (34 + 23 + 10 + 3), with overlapping product coverage. The same-folder update preserves extension ID, Inbox/case/SOC findings, screenshot/source originals, edited derivatives, Reference, Recents and preferences; a deleted finding stays deleted after an actual browser restart.

See [receipts](evidence/1.8.18/README.md) and [packages](../../releases/1.8.18). Repeated extracted-package runs do not increase unique scenario counts. This is targeted current-release regression coverage; the broader 1.8.17 rendered/pixel/worker/reader results remain [historical evidence](https://github.com/roedoeroe/Gather/blob/1.8.17-rc.1/gather/docs/TESTING.md), not freshly rerun 1.8.18 claims.

## Connected native journey

Microsoft Edge 155.0.4283.45 on Linux runs with sandboxing enabled. Playwright, authenticated Xvfb and ordinary OS input drive the extension. Chrome APIs are not replaced in native tests. The suite exercises bound fictional content owners on five platforms, exact string IDs, query-free keyboard search completion, all three screenshot modes, scrolling selection and pixel dimensions at native browser zoom 80/100/125/150/200%.

It saves the clicked responsive image through Edge's real context menu, preserves PNG/JPEG/WebP/AVIF/GIF bytes and hashes, rejects blocked/temporary sources visibly, and keeps the original destination during delayed saving while the global case changes. Manual redaction produces a distinct derivative; the original hash remains unchanged. Reverse Image copies independently checked pixels after normal Ctrl+V/replacement without clipboardRead or hidden upload. Add SOC, same-name subjects, rename/history, narrow layout, Inbox and finding deletion remain covered.

Offline access and a separate browser profile confirm local data boundaries. Binary backup merge-restore checks image bytes and Case/scan/SOC relationships. Reference folder exclusion, alias search, exact Copy, JSON round-trip, replacement and deletion are checked separately. Fictional private-field canaries are absent from observed outbound requests. These checks are not a legal certification or proof about the browser/OS's own services.

## History and Reference measurement

The new journey stores 100 real fictional captures, verifies 12/24-card paging and search, and alternates Research/Captures ten times. Previous thumbnail URLs are revoked and none remain live after leaving history. This measures those URLs, not every browser memory allocation. The current scan's repeated heading is gone; All cases retains group headings and accessible region names remain.

The final source run used 1,000 fictional Markdown files (10,139,890 bytes): warm search median 11.7 ms, p95 35.3 ms over 50 searches. Earlier isolated p95 was 180.5 ms. This is search-model timing, not complete UI latency or Windows performance. Headed history click-to-ready samples were 1.22–3.24 seconds, including automation/thumbnail scheduling; an earlier isolated run reached 7.21 seconds. Functional checks passed, but these variable cloud measurements do not establish the proposed 100 ms interaction target or justify a performance improvement claim. Reprofile on target hardware before adding caches/virtualization. Raw measurements are in the evidence folder.

Toolbar and history screenshots were visually inspected. The UI uses larger/darker secondary text while keeping direct screenshot actions anchored. Windows scaling, screen-reader acceptance and analyst usability sign-off remain separate.

## External boundaries and previous provider evidence

No fresh live-provider image submission or signed-in account test occurred in 1.8.18; provider/extraction algorithms are unchanged. In 1.8.17, a generated triangle reached results through normal Yandex paste and TinEye upload. Google presented unusual-traffic protection and was not bypassed; Lenso/Shutterstock 403, other providers landing-only. See [provider matrix](REVERSE-IMAGE-PROVIDERS.md) for that historical boundary. Reachability is not successful submission or result accuracy.

Managed Windows installation, live signed-in platform IDs, Windows display scaling, native side-panel opening, OS Save/Print dialogs, clipboard managers and destination work applications remain unverified. Protected sources may refuse access; dynamic feeds can yield explicitly partial captures. Keep the release a controlled RC. [Target-computer check](LOCAL-ACCEPTANCE.md).

## Reproduce

From `gather`, with Node 24 and Python 3:

```sh
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
```

With supplied Playwright through NODE_PATH, run browser-toolbar.mjs, browser-capture.mjs and browser-help.mjs for affected rendered checks. [Environment setup](ENVIRONMENT-SETUP.md) gives the sandboxed Edge/authenticated-display commands. Run browser-acceptance.mjs, browser-native-workflow.mjs, browser-native-update.mjs and `GATHER_R6_HEADED=1 node tests/browser-r6.mjs`. The historical R6 filename includes R10, Inbox/finding-delete and polish journeys.

Run one headed/clipboard suite at a time and keep runtime/tests unchanged while running. GATHER_EXTENSION_ROOT selects extracted package bytes; GATHER_PREVIOUS_PACKAGE overrides the previous release ZIP; GATHER_BROWSER_ARTIFACTS selects ignored output. Product Audit records the corrected page-event cleanup and new test's asynchronous thumbnail readiness issue. Neither required changing capture algorithms or removing assertions.
