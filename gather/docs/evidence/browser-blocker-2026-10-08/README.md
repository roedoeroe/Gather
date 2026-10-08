# Fresh Gather checks and browser restriction — October 8, 2026

Runtime remains 1.8.6. This pass repairs development testing tools/documentation; no feature, runtime file, permission, dependency or published package changed.

| Check | Fresh outcome |
| --- | --- |
| Node suite | 130 passed, zero failed/skipped |
| Existing rendered capture/toolbar/case/stabilization suites | 21 + 22 + 18 + 10 = 71 passed groups |
| Actual Chromium worker suite | 10 passed groups; Chrome APIs are doubles |
| Repaired runner's shared UI journey | 7 passed rendered groups with API doubles; real file download |
| Installed-extension runner | Blocked before launch, exit 2, zero native groups |
| Live platform checks | Not run |

Logs and structured results in this directory are from this run. [verification.json](verification.json) records counts, scope and unchanged release hashes. [installed-blocked.json](installed-blocked.json) names the policy and reports that no browser was launched by that check. Native and rendered results are not interchangeable.

The runner was stale: it used pre-redesign button names and assumed Add stayed open and Findings was always the visible subview. Its current shared journey was exercised through the existing rendered fixture setup; an initial assertion exposed the closed Add menu, another inspected the hidden Findings list. Both were corrected by following actual user navigation, retaining case isolation and file-content assertions. Those diagnostic runs are separate ignored artifacts, not release passes. The final seven groups passed through the maintained `node tests/browser-installed-ui.mjs` command from `gather`.

The 71 existing groups include actual DOM/canvas/IndexedDB/clipboard and controlled extension APIs. Fresh direct-toolbar and shared-journey desktop/narrow screenshots were opened and visually inspected; images remain under ignored artifacts/blocker-check. Native activeTab/captureVisibleTab/focus/OS dialogs/browser zoom and live platform reliability are unverified. No administrator policy, sandbox or TLS setting changed.

[Plain-language blocker and short check](../../BROWSER-TEST-BLOCKER.md) · [Testing commands](../../TESTING.md).
