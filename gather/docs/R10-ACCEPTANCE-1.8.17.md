# R10 acceptance ledger — 1.8.17 RC

This maps the adopted brief to shipped behavior and evidence; historical suggestions superseded by the user's utility-first direction remain out of scope.

| Area | Status and evidence |
|---|---|
| Recovery / baseline | PASS: clean 1.8.16 inspected, checkpointed; deterministic baseline and native headed/headless confirmation run before product changes. |
| Five profile extractors / four fields / string IDs | PASS in deterministic and controlled browser fixtures. X remains search-only. Live signed-in platform acceptance is UNVERIFIED because no authorized Windows account session is available. No wrong-owner guess fallback. |
| Content-owner / canonical URLs / tracking | PASS: five supported explicit content bindings, canonical account output, source URL separately retained; Facebook identity query retained. Unsupported structures fail visibly. |
| Enter / current page / auto-copy / five Recents | PASS in Node, toolbar and native journeys; navigation/cancel and duplicate guards remain. Two-second conditional Instagram readiness is unchanged. |
| Minimal Case > SOC / prominent Add SOC | PASS: direct heading/panel action, no intake wizard; keyboard, cancel, blank, distinct same-name IDs, local persistence and explicit selection tested. |
| Frozen filing / All Captures / SOCs | PASS: shared frozen context, delayed source and selection tests, three native capture modes; source image appears immediately, filters never change filing, no cross-case results in case scope. |
| Select Area / HUD / exact pixels / scrolling | PASS: 11 marker groups, native zoom, native scrolling/restore/cancel/repeat, visible/full-page paths and independent auto-copy. Bounded dynamic/nested content remains an explicit limitation. |
| Crop / annotation / redaction / selected output | PASS: image17 and native editor checks, side/corner handles, geometry/reset/apply/cancel, crop/move/Undo, arrows/circles/manual black redaction and immutable originals. OS print/save dialogs are UNVERIFIED here. |
| Source Image end-to-end | PASS: actual context menu, responsive WebP instead of JPEG fallback, original hash and Case/SOC; five formats, large/delayed/blocked/temporary images, copy/edit/reverse and immediate history/filter visibility. |
| Reverse Image paste/upload/saved asset | PASS: actual clipboard image paste, file/drop and saved asset selection, preview/change/remove, stale/invalid/rapid replacement guards and provider switching. No background upload or persistent search history. |
| Reverse provider capability | PASS for honest handoff: live selected-image Yandex paste and TinEye normal upload reached results. Google challenged after upload; Lenso/Shutterstock blocked. Bing/Baidu/Sogou submission UNVERIFIED. No private upload API or bypass; documented public flows only. |
| Web search / completion | PASS: static local suggestions, no query retention, no scraping/relevance or identity conclusions. |
| Reference | PASS: recursive local Markdown/JSON, hierarchy/exclusions, atomic revision checks, prepared index, aliases/fuzzy fallback and exact preview/Copy. Real proprietary corpus UNVERIFIED/not supplied; no corpus shipped. |
| Privacy / lifecycle / deletion / backup | PASS in automated evidence: no work-data sync/telemetry, fictional outbound canaries, profile isolation, offline, worker/reload, binary backup/restore hashes and relationships, guarded deletion/history separation and public-package scan. Not a legal-compliance guarantee. |
| Stress / keyboard / layout / error handling | PASS in automated analyst simulations and inspected screenshots: repeated modes, navigation/cancel, exact-copy replacement, delayed case change, keyboard creation/paste/completion, 400px layout and 80–200% native capture zoom. Actual first-time coworker testing, assistive technologies and Windows display scaling remain UNVERIFIED. |
| Two clean passes | PASS only when both final native receipts say passed with 32 groups. Packaging script enforces both. |
| Package / publication | Release receipts record the exact hashes, extracted-package checks and actual GitHub publication. Existing ZIPs/tags remain immutable. |

No new intake, coverage automation, AI composition, cloud collaboration, threat conclusions or live OneNote dependency was added. Nested scrolling-element capture and arbitrary custom export roots remain P3 backlog. Other environment-dependent P2 work is in FUTURE-PLANS.

## Added continuation acceptance

Inbox navigation and per-finding deletion are included in `inbox-finding-journey.mjs`, run in both final fresh profiles and the extracted extension. Reducer tests cover exact scope, stale guards, account observation preservation and retained Move Undo. The same-folder native update preserves existing Reference, source images/derivatives and findings; deleting a finding then restarting verifies persistence. Full results live in TESTING/evidence and the package receipt, not this scope checklist alone.
