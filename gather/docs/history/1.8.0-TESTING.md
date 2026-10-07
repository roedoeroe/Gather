# Gather 1.8.0 validation

Final evidence was generated on 2026-10-07 UTC (2026-10-06 Pacific) using deterministic fictional Northbridge / October review, Southridge / Intake, TEST-28175 and Alex Example material. No real case or live account data was used.

| Layer | Result | Meaning |
| --- | --- | --- |
| Supplied 1.6.1 baseline | 66 passed | Rerun before implementation. Original evidence remains in `evidence/baseline-66.txt`. |
| Preserved 1.6.2 checkpoint | 76 passed | Integrated tab context and originating references; not the earlier unsaved prototype. |
| Preserved 1.7.0 checkpoint | 94 automated + 18 rendered scenario groups passed | Historical evidence and source remain unchanged. |
| **Final 1.8.0 Node suite** | **109 passed, 0 failed, 0 skipped** | Deterministic model, adapter fixtures, state/store/worker doubles, source structure and all shipped JavaScript syntax. |
| **Final rendered Chromium capture journey** | **18 scenario groups passed** | Real product DOM/canvas/IndexedDB with controlled extension API doubles. |
| **Final rendered Chromium R3 case journey** | **16 scenario groups passed** | Real case, role, queue, evidence and closure UI/storage with controlled extension API doubles. |
| Native Chrome extension integration | **Blocked** | Administrator disables unpacked extension loading. |
| Native Edge / live platforms | **Not run** | No native Edge or live extractor acceptance claim. |

The 34 rendered scenario groups are integration checks, not 34 additional Node unit tests and not native extension acceptance. Final logs, scenario lists and screenshots are under `evidence/1.8.0/`. Older evidence files remain historical rather than being overwritten as 1.8 results.

## Exercised journeys

The capture journey launches Northbridge / October review research, supplies a browser-opener double, starts the actual selection controller, switches the global destination to Southridge during delayed work and verifies the image remains attached to Northbridge / Alex Example with its search reference. It covers duplicate subject names, stable rename history, original/derivative hashes, real canvas stitching and bottom overlap, cancellation restoring actual scroll/sticky styles, opaque redaction, denied Downloads followed by retry, binary backup merge, restore into separate empty browser-origin storage, corrupt image rejection, aborted transactions, interrupted-write journal recovery, missing assets, reload persistence and scan-isolated reports.

The R3 journey reviews/edits locally parsed intake, excludes a private contact and unwanted term, creates three distinct roles and verifies ephemeral values are absent from durable context. It launches tokenized queue searches, records negative coverage, verifies manual queries/drafts remain session-only, and saves role-filed metadata after the global destination changes. Similar names do not associate; an explicit reviewed confirmation records a reason. Clipboard preview preserves a long exact string ID.

It stores a visible-image fixture in real IndexedDB, checks Evidence IDs and role-only paths, explicitly includes the image, exports a selected derivative without original bytes/hash, renames an ephemeral friendly label without changing durable role history, and backs up/restores relationships without session names. Simulated session loss requires seed re-entry. Close Case rejects a stale snapshot; denied backup retains images; retry verifies download completion before removing only that project. Quick Lookup remains project-free and focused. Actual popup rendering puts five usable rows first, one technical group next and two quiet gone rows last without current-ID fields.

The Node fixtures additionally exercise positive structured YouTube gone evidence versus ambiguous/authentication/markup cases, restored gone-state validation, previous exact ID history, Local Case retention, role duplication, coverage semantics, association validation, research ID remapping, limits and removal scoping.

## What the browser evidence does and does not establish

The harness uses Playwright screenshots of an actual fictional rendered page as the screenshot API double. It runs the real capture controller, page manipulation, canvas and IndexedDB code. It does **not** establish native `captureVisibleTab` permission, toolbar/controller focus or native download completion. Browser session loss and worker interactions are controlled simulations; they are not a real installed-extension lifecycle acceptance.

Screenshots were actually generated. Visual inspection covered the full/narrow workspace, panel document, collapsed-capture popup, selection and redaction screens, Case Start review, final default case workspace, narrow case view and evidence sheet. Native popup/panel opening, context-menu selection grant, OS folder writes, native print/PDF pagination, full keyboard/screen-reader acceptance, live adapters and comprehensive zoom/DPI behavior remain unverified. Local Case is covered by deterministic model tests; the full R3 rendered journey uses Ephemeral Case.

## Reproduce

From the extracted development package root, using Node 24 and Python 3:

```sh
node --test tests/*.test.mjs
python3 scripts/package.py
```

The extension has no install step or runtime dependency. Browser tests additionally used Playwright 1.62.1 and Chromium 151. If these are not supplied by the runner, install Playwright separately from the extension:

```sh
npm install --prefix .tools --no-save --package-lock=false playwright@1.62.1
NODE_PATH="$PWD/.tools/node_modules" GATHER_CHROMIUM_PATH=/path/to/chromium node tests/browser-capture.mjs
NODE_PATH="$PWD/.tools/node_modules" GATHER_CHROMIUM_PATH=/path/to/chromium node tests/browser-case.mjs
```

`GATHER_BROWSER_ARTIFACTS` optionally selects the evidence output directory. Tests serve temporary internal HTTP fixtures; this is test infrastructure, not a replacement hosted product. Both journeys clean their temporary browser profiles.

Use a browser with a working security sandbox. This runner's tool filesystem sandbox presents incorrect ownership for Chrome's setuid helper and prevents namespace setup. Approved execution outside that tool sandbox restored the normal helper/namespaces while keeping `chromiumSandbox:true`. Do not use `--no-sandbox`, weaken TLS, or change administrator policies. The current runner supplies Playwright at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright` and Chromium at `/usr/lib/chromium/chromium`.

## Native blocker and single next milestone

The existing supported DevTools diagnostic returned:

> Protocol error (Extensions.loadUnpacked): Loading of unpacked extensions is disabled by the administrator.

This is recorded in `evidence/native-extension-status.txt`. Repeating the same command cannot validate the extension; use a runner/profile whose administrator permits unpacked extensions, or local Chrome/Edge. The separate Playwright browser download also returned proxy `403 Domain forbidden` from `cdn.playwright.dev`. No policy or network bypass was attempted.

On a permitted runner:

```sh
GATHER_CHROMIUM_PATH=/path/to/chromium node tests/browser-acceptance.mjs
```

`browser-journey.mjs` forwards to this sandbox-enabled entry point. That harness is a starting diagnostic, not the entire acceptance checklist; do not count a zero-worker launch as success.

Accept the packaged **1.8.0** extension in isolated Chrome and Edge profiles before adding features:

1. Project-free exact-ID lookup, keyboard focus, native toolbar/side-panel sizing, selected-text Case Start and activeTab grant/expiry.
2. Northbridge / Alex → search → related result → visible/selection/full-page capture; switch global destination to Southridge during delayed work. Verify actual opener availability and explicit assign/detach.
3. Tab switch/navigation during capture, sticky/lazy/infinite/nested fixtures, zoom/DPI, size/time limits, cancellation and abrupt controller closure restoration. Nested scrolling remains unsupported, with honest limitations.
4. Native Downloads subfolders, interrupted download/retry, independent saved/export states and completed private backup before Close Case removal.
5. Worker suspension, browser restart, ephemeral value loss, Local Case retention, private image backup/restore into another installation and report isolation. Verify no cross-project loss during closure.
6. Evidence-sheet export pixels/metadata and native Print / Save PDF. Review live platform adapter fixtures separately, using permitted fictional/test accounts.

No performance superiority, live success rate, production readiness or store readiness is claimed.
