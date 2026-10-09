# Gather 1.8.13 evidence

201 Node tests, 110 rendered workflow groups, 11 real-pixel selection groups, 10 real ServiceWorkerGlobalScope groups and five isolated-world reader groups passed. Seventeen image-tool groups repeat at 2× (not counted twice). Scenario JSON preserves exact checks. Test fixtures are fictional; no new live-platform read occurred.

The pixel pipeline tests visible and scrolling selections at simulated DPR 0.8/1/1.25/1.5/2, all corner/edge/center markers, outermost pixels against acquired original PNGs, stored binary hash, real clipboard pixels, downloaded-byte SHA and page restoration. Fractional browser rasterization antialiases canvas edges; comparisons use actual acquired pixels, not ideal CSS colors. Screenshot acquisition is a Playwright adapter, not native captureVisibleTab. Native zoom and Windows scaling are unverified.

The included popup, crop-handles, new-case and Case/SOC-history screenshots were actually inspected. The earlier unsupported-page popup was also inspected. Screenshots are rendered fixtures, not installed Edge screenshots. The current popup test checks the primary Select area button is visible after a resolved profile; it is not only a screenshot review.

Extension API doubles are used in rendered/worker suites. The isolated reader uses actual isolated-world code with intercepted fictional network. Native runner reports blocked, exit 2, zero groups: administrator policy denies unpacked test extensions. No policy or sandbox bypass. Signed-in Edge Instagram and the original reported horizontal-loss case need the permitted local check; these passing fixtures do not close them.

Release receipts under releases/1.8.13 record extracted-package and public-download checks. The R4 Reference/source-image features remain gated and unshipped. This is a runnable development release, not an R4-complete/native-Edge-accepted claim.
