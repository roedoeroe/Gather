# Gather 1.8.16 RC validation

Validation: October 9, 2026, America/Los_Angeles (artifacts may be October 10 UTC). Fixtures, private-data canaries and published screenshots are fictional. No signed-in Windows session or private Reference corpus was supplied.

| Layer | Result | Scope |
|---|---|---|
| Node | **226 passed**, zero failed/skipped | Existing 214 plus content-owner/canonicalization, source-image failures, Reference import/rank/type and static completion checks. |
| Rendered workflows | **116 groups passed** | Toolbar 29; capture 21; case 19; stabilization 10; case clipboard 7; shared workspace 9; image tools 17; Help 4. Real DOM/canvas/IndexedDB; Chrome APIs are controlled doubles. |
| Repeated image tests | **17 at 2× DPR** | Same groups repeated, not new unique scenarios. |
| Pixel selection | **11 passed** | Marker edges/corners at five simulated scales, including scrolling. Screenshot adapter, not native screenshot API. |
| Worker | **10 passed** | Real ServiceWorkerGlobalScope with controlled Chrome APIs; lifecycle/restore/deletion. |
| Isolated reader | **5 passed** | Real isolated-world parsing and bounded return values on fictional pages. |
| Installed Linux Edge workspace | **10 passed** | Native storage/worker, cases/findings/tasks, query-free search and explicit image-provider launch, report/reload/narrow UI. |
| Installed Linux Edge capture/lookup/editor/Help | **23 passed** | Actual OS toolbar invocation and activeTab, all capture modes, scrolling, cancel/repeat, clipboard, crop/annotations/redaction/original hash, Help. |
| Installed Linux Edge update | **3 passed** | Same-folder 1.8.15 → 1.8.16 keeps extension ID, Case/scan/SOC, capture and original hash, including reload. |
| New native Edge analyst journey | **23 groups per clean pass** | Five content-owner bindings; full-tool Enter/Shift+Enter/duplicate guard; actual image context menu; three screenshot modes; native zoom pixel comparison; five source formats; blocked/CORS/blob and delayed filing; local/saved reverse images; edit/original; autocomplete; Reference; profile isolation; offline; binary restore and canary egress. |
| Syntax/generation/public scan | **Passed** | 68 runtime JS modules; packaged reader matches local source. Credential/path/archive scanning, plus manual source/image review. Not general PII/legal certification. |

Native suites total **59 groups** (10 + 23 + 3 + 23), with overlap in exercised functions. Repeat clean/package runs do not increase unique totals. Exact receipts are under [evidence/1.8.16](evidence/1.8.16/README.md); extracted-package receipts accompany the release package.

## What “native Edge” means here

Microsoft Edge 155.0.4283.45 on Linux loaded the genuine unpacked extension with sandboxing enabled. Verified official Edge/WebDriver files are retained; Playwright/CDP and OS xdotool drove the tests, not WebDriver. No Chrome API replacements in native suites, no policy edit, permission override, TLS bypass or no-sandbox switch. Chromium's separate managed extension restriction is unchanged.

The new headed journey uses the actual Edge image context menu, then native screenshot acquisition. A separate hands-on diagnostic selected a responsive image in a modal: exact 600 × 360 WebP bytes were saved instead of its 80 × 80 fallback source. Native browser zoom at 80%, 100%, 125%, 150% and 200% compares selected pixel bytes against the original screenshot's requested region. Fractional scaling rounds selection boundaries outward; at 150% the browser's rounded CSS viewport can yield 151 physical pixels for 100 CSS pixels. This preserves edge pixels and is distinct from a nominal DPR multiplication. Windows display scaling remains untested.

Two consecutive final fresh-profile analyst journeys cover lookup → Case/SOC screenshot work → source image → reverse image → manual edit → web completion → Reference search/copy → separate-profile/offline/restore checks. These are automated native analyst simulations with screenshot review, not tests performed by two human coworkers. Failed intermediate assertions were investigated; only completed final receipts count.

## Privacy, storage and performance

Fictional Case/SOC/note canaries never occurred in captured outbound URL/headers/bodies. Profile B had none of Profile A's cases, images, lookup IDs or Reference. Offline reload retained images and local Reference search. Binary merge restore verified source formats, original hashes and remapped relationships. Reference replacement, JSON round-trip, stale-write rejection and deletion retained exact text. No private corpus was used.

A 1,000-file, 10,158,890-byte fictional Reference corpus indexed in about 102 ms in this Node environment; repeated queries measured about 12.7 ms median / 16.8 ms p95. These are measurements, not latency guarantees. The index is built per loaded pack rather than reparsing source for each keystroke.

Provider landing requests were live HTTP checks with no image submission: Google, Lenso, Yandex, Baidu, Sogou and TinEye returned 200; Bing and Shutterstock returned 403. Native reverse-image workflow tests intercept provider pages with fictional responses. Neither layer claims live upload/search-result acceptance. See [provider matrix](REVERSE-IMAGE-PROVIDERS.md).

## Boundaries still unverified

Signed-in Windows/organization-managed deployments, Windows display scaling, native side-panel opening, OS image save/print dialogs, clipboard managers and paste into every work application are unverified. The side-panel **content** was opened as an extension page and inspected at 400px; that is separate from Edge's native panel-opening UI. No new live signed-in account/owner tests were performed; 1.8.15's signed-out live diagnostic is historical evidence only. Dynamic feeds and protected images remain externally variable. No universal reliability or compliance claim.

Visual review includes the actual native popup/editor/Help, source inspector, image-first reverse tool, Reference desktop/400px and side-panel content. Screenshots in evidence are fictional. [Product Audit](PRODUCT-AUDIT-1.8.16.md) documents fixes and harness diagnoses; [Future Plans](FUTURE-PLANS.md) holds remaining P2/P3 work.

## Reproduce

From `gather`, Node 24/Python 3 and Playwright 1.62.1:

```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
node tests/browser-toolbar.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-stabilization.mjs
node tests/browser-case-clipboard.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
node tests/browser-selection-pixels.mjs
node tests/browser-worker.mjs
node tests/browser-profile-reader.mjs
node tests/browser-help.mjs
```

Native commands/display setup are in [ENVIRONMENT-SETUP](ENVIRONMENT-SETUP.md). `GATHER_BROWSER_ARTIFACTS` selects ignored output; `GATHER_EXTENSION_ROOT` selects the exact extracted runtime for native checks. `GATHER_R6_HEADED=1 node tests/browser-r6.mjs` exercises the complete native journey. Run one headed suite per display. Do not edit runtime/tests during suites. The new Verify Gather GitHub workflow runs generation, Node and public-pattern checks; browser receipts are separate.
