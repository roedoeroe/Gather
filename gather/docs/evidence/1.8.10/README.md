# Gather 1.8.10 evidence

165 Node checks, 104 unique rendered groups (21 capture, 24 toolbar, 18 case/privacy, 10 stabilization, 7 case clipboard, 8 shared workspace, 16 image tools), and 10 actual Chromium worker groups passed. The 16 image-tool groups also passed at 2× device scale; repeats are not extra unique groups. All fixtures are fictional. Current results JSON and run logs record the executed journeys.

The baseline reproduced disabled primary lookup and a findings filter hiding a real fixture task. Current tests cover primary page lookup/keyboard activation, pasted input priority, invalid input, changed tabs, exact IDs, independent filters, search launch from Activity, unsaved image confirmation/cancel/discard, delayed encoding, missing/deleted editor closure and stale-save rejection. Existing capture, privacy, recovery and continuity journeys remain. A test timing issue was corrected by waiting for the modal save to finish; an older stale-editor test now checks disabled controls and also forces an attempted stale save to verify the storage guard. Failed intermediate runs remain outside this passing evidence.

Real DOM/canvas/PNG pixels/clipboard/IndexedDB/BroadcastChannel and applicable locks/worker lifecycle; controlled Chrome extension APIs and Downloads doubles. Ordinary browser confirmation and script-opened window closure are exercised. Native extension invocation, OS paste/save/print, actual browser zoom/tab-close/reload dialogs and screen readers are not covered by these groups.

Fictional current-profile popup, desktop workspace and narrow editor were visually inspected. The toolbar geometry assertion uses the actual popup clipping boundary, not an assumed 580 px limit. No native FireShot test, live-platform lookup or user study was performed in this release.

Native preflight exits 2 before launching and records blocked/zero groups: administrator policy prevents loading unpacked extensions. No policy/security workaround. Prior authorized live observations remain private and separately qualified; no universal guarantee or legal-compliance claim.

Release verification records ZIP CRC, SHA-256, every runtime byte, unchanged permissions/storage versions and extracted-package gates. Package reruns are not additional unique groups. Prior release ZIPs remain immutable.

The extracted development ZIP passed all 165 Node checks, 24 toolbar groups, 8 shared workspace groups and 16 image-tool groups. The final packages retain every tested runtime byte. These repeats do not increase unique counts.
