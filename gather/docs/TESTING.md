# Gather 1.8.19 RC validation

Current source checks use deterministic fictional data. Real Edge/Chromium execution is distinguished from mocked platform responses and extension-API doubles. No signed-in live-platform or Windows acceptance claim is made.

| Check | Result | Scope |
|---|---|---|
| Node tests | 243 passed; none skipped | Existing storage/privacy/extraction regressions plus post date, author binding, comment exclusion, precision and X background-access refusal. |
| Rendered toolbar | 30 groups passed | Real DOM/canvas/IndexedDB with extension API doubles; lookup, capture, manual editing, history/deletion and backup. |
| Rendered Help | 4 groups passed | Current guidance, search, narrow layout, no external requests or storage. |
| Isolated reader | 5 groups passed | Real Chromium isolated world and same-origin fetch with fictional network. Exact IDs, bounded returns, source fallback and conflict rejection. |
| Native post tools | 12 groups passed | Installed sandboxed Linux Edge. Normal toolbar invocation and real OS clipboard for six platform fixtures, delayed Instagram post, source fallback, comment/conflict/navigation handling and profile guidance. |
| Same-folder update | 3 groups passed | 1.8.18 → 1.8.19, native Reload and browser restart; findings, image originals/derivatives, Reference, preferences and deletion persistence. |

Native workflow: **23 groups passed** (real toolbar, delayed lookup, screenshot acquisition, scrolling selection, full-page cancellation/restoration, editing and clipboard). Exact-package results are recorded in the versioned release receipts. Repeated extracted-package runs do not increase unique scenario counts.

## Important boundaries

Native post tests intercept HTTPS responses with fictional metadata. They validate the extension, browser permissions, parser, controls and clipboard—not current signed-in platform markup. Metadata availability changes by platform, session and page. Windows Edge, native Windows save/print dialogs, work-app clipboard, display scaling and side-panel invocation remain pilot checks.

The two-second Instagram buffer is conditional: already present metadata returns immediately. Post dates are fetched only after clicking Get real post date. A timestamp is site-supplied information; an exact-looking value is not independent proof of publication or authenticity. Date-only/minute precision and conflicts are explicit. No date history or automatic cloud transfer was added.

The first native harness attempt closed the popup before confirming that Copy IDs completed; the clipboard still held the prior date. The harness now waits for a settled control and the actual copy confirmation, then checks pasted bytes. The completed run passed. No product failure was hidden or assertion removed.

## Reproduce

From `gather`:

```sh
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
```

With Playwright through NODE_PATH, run browser-toolbar.mjs, browser-help.mjs and browser-profile-reader.mjs in sandboxed Chromium. Use ENVIRONMENT-SETUP for the signed Edge path and authenticated X display, then run browser-post-tools.mjs and browser-native-workflow.mjs. Run browser-native-update.mjs headlessly with the immutable 1.8.18 package. GATHER_EXTENSION_ROOT selects an extracted extension for native checks. Do not edit runtime/tests while suites execute.

Historical 1.8.18 and earlier capture/performance/provider evidence remains available at immutable tags; it is not silently counted as a new 1.8.19 run. No privacy pattern scanner constitutes legal certification or universal sensitive-data detection.

Final review added a shared Facebook guard against comments carrying a parent post ID. The Node suite and exact-package native post journey were rerun after this guard. The other unchanged workflow checks above ran earlier in the same release preparation.
