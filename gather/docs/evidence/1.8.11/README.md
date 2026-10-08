# Gather 1.8.11 evidence

178 Node checks; 105 unique rendered groups (capture21, toolbar24, case/privacy18, stabilization10, case clipboard7, shared workspace9, image tools16); 10 actual Chromium ServiceWorkerGlobalScope groups. All passed. Image tools also repeated at 2× device scale; repeats do not increase unique counts. Fixtures are fictional. Logs and results JSON accompany this note.

New checks cover: no persisted typed queries/drafts or search events; removal of old query text/drafts including nested archives; import cleanup with retained evidence references; context through delayed launch/default switch; reverse-image provider allowlisting; empty-field examples; same-document automatic source fallback; exact long IDs; wrong-profile/conflicting-ID/login/cancellation/HTTP/size failures; complete-list capture history refresh; existing image editing, hashes, clipboard, deletion, recovery and backup/restore.

A capture-history refresh briefly exposed an incomplete list in an intermediate run. The UI now builds the replacement offscreen, publishes once, retains current selection/focus and releases superseded object URLs. A MutationObserver assertion verifies refresh never publishes a partial card count. Intermediate failed runs are not passing evidence. Older search-log/draft tests were revised to the user’s explicitly changed retention requirement.

Real DOM, canvas, PNG bytes, clipboard, IndexedDB, BroadcastChannel, applicable locks and worker lifecycle. Chrome tabs/scripting/screenshot/Downloads APIs are controlled doubles. The toolbar source fallback journey supplies separate hydrated and source responses; it does not claim native scripting permission. Desktop and narrow workspace and current-profile popup screenshots were visually inspected.

Native preflight exits 2: the machine administrator’s wildcard extension block prevents loading an unpacked extension. Zero native groups; policy remains intact. Native Edge invocation, signed-in source fetch, OS paste/save/print, browser zoom and screen readers remain unverified.

One separate authorized anonymous Instagram source read returned HTTP200 and a matched exact string ID. The raw source was deleted after parsing; no real account identifier/source is published. This is one observation, not an installed-browser or multi-platform success rate. Reverse-image destination checks are in SEARCH-AND-LOOKUP-1.8.11.md; no reverse-image upload was performed.

Package CRC, SHA-256, per-file comparison and extracted-package gates are recorded in the release verification receipt. Earlier releases remain immutable.

Extracted development ZIP gates passed:178 Node,24 toolbar,9 shared workspace and16 image-tool groups. Final runtime bytes match the tested package.
