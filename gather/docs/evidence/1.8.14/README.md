# Gather 1.8.14 evidence

208 Node tests; 112 rendered workflow groups (toolbar 29, capture 21, case 19, stabilization 10, case clipboard 7, shared workspace 9, image tools 17); 11 pixel-selection groups; 10 actual ServiceWorkerGlobalScope groups and five isolated-world profile-reader groups passed. Extension APIs are controlled doubles; DOM, canvas, IndexedDB and clipboard run in real Chromium. All published fixtures are fictional.

The new toolbar journey opens a fresh popup with a controlled missing signed-in ID, automatically fetches one credential-free profile response, copies the exact ID and keeps pasted input closed. It also checks primary screenshot actions and Retry remain visible after failure with Case/SOC controls. Success/failure screenshots were actually inspected. The image-tools journey opens Page options to exercise the relocated, remembered screenshot auto-copy toggle.

The live-public receipt records a real signed-out browser read of a user-authorized profile, then the actual resolver/isolated parser against its live public response while missing DOM/session-source data is controlled. One public request succeeded on the first operation and matched the live-page ID. No actual account ID, handle, URL, source, cookie or screenshot is published. This is not a signed-in or installed Windows Edge test. The administrator's unpacked-extension block remains; no bypass occurred.

The pixel-selection suite was rerun at five simulated DPR scales. Native browser zoom, Windows DPI and OS dialogs remain unverified. Extracted-package and immutable public-download receipts live outside the ZIP in releases/1.8.14.
