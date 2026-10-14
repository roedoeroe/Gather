# Gather 1.8.18 RC product audit

The user adopted the next-morning stabilization plan. Work starts from the published 1.8.17 candidate, with the completed R10 and Inbox/finding-deletion changes preserved. Nested-scroller capture, custom export roots and a communication composer remain separate feature decisions.

| Finding | Change | Evidence |
|---|---|---|
| A successful page lookup still said “Retry this page.” An unrelated previous pasted batch also made the page action look like a retry. | Only a result from this current-page input controls its action label. Completed results say **Find again**; unfinished results retain **Retry this page**. | Rendered toolbar journey covers success, failure, recovery and a previous pasted result. Extraction/readiness logic is unchanged. |
| The current scan was repeated directly above its capture cards. | Omit the redundant group heading only when every matching record belongs to the current scan and the view is not All cases. Keep the accessible section name. Broader views retain group headings, including groups beyond the first displayed page. | Native history journey exercises scoped and All cases views with 100 real stored fictional captures. |
| Several popup labels, IDs and hints used 10–11 px text and faint gray. | Raise those sizes to 12 px and darken affected secondary text/placeholder colors. Preserve the bounded lookup pane and anchored screenshot actions. | Toolbar layout checks and screenshot inspection; actual Windows display scaling remains external verification. |
| Current guidance linked to an older audit; the historical Quick Parts proposal and bundled extension README described shipped tools as unbuilt. | Update current documentation and label the original Quick Parts design as historical, without reviving its deferred composer/coverage features. | Documentation and package review. |

## Regression and performance scope

The native performance journey creates 100 small fictional capture records, checks 12/24-card paging and search, then alternates Research/Captures ten times. It checks that each history replacement revokes old thumbnail URLs and leaving the view releases all URLs created by that test. This measures thumbnail lifetime, not every possible browser memory allocation.

Reference is measured in the installed Edge page with 1,000 fictional Markdown files and 50 warm searches. Browser-model search timing is separate from full UI/input latency and Windows performance. No production telemetry, new index service or speculative caching was introduced.

The bounded two-second Instagram readiness behavior, acquisition limits, frozen destination, original/derivative handling, storage schemas and browser permissions remain unchanged. [Testing](TESTING.md) records final results; [Future Plans](FUTURE-PLANS.md) retains the remaining integration and feature work.

## Harness corrections and measured limits

An early native run timed out waiting for a new page; its rejected event promise escaped before browser cleanup. The test now catches that event rejection immediately, retains the same 15-second timeout, records open pages/tabs on failure and lets finally close Edge. A missing unwrap introduced while making that test change was fixed before the successful 34-group run. Neither issue required a runtime capture change.

The new history test initially observed the previous hidden card nodes before asynchronous thumbnail reload. Its readiness condition now waits for the actual 12 live thumbnail URLs; assertions and resource cleanup checks were retained.

Final source journey: 1,000 fictional Markdown files (10,139,890 bytes), warm Reference search median 11.7 ms and p95 35.3 ms. An earlier isolated run measured p95 180.5 ms, illustrating cloud-run variability. These timings cover the browser search model, not full input-to-screen latency. The ten history click-to-ready samples ranged from 1.22 to 3.24 seconds in the final headed journey (earlier isolated maximum 7.21 seconds), including automation scheduling and thumbnail load. They do not establish a sub-100 ms interaction target or a speed improvement. Reprofile the history path on the target computer before adding caches or virtualization; all 100 records remained correct and thumbnail URLs returned to zero after leaving history.

The completed native journey reports no uncaught page errors. Windows/work-app and signed-in acceptance remain explicit pilot gaps, rather than hidden claims of completed verification.

The separate native cancellation test also attached to a capture window before its HTML existed. Its existing bounded readiness loop now treats a missing Cancel element as not ready, instead of dereferencing null. The actual cancellation, restored scroll and subsequent-capture assertions remain. This is a test synchronization correction, not an added runtime delay.
