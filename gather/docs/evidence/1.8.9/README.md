# Gather 1.8.9 evidence

165 Node checks, 100 unique rendered groups (21 capture, 22 toolbar, 18 case/privacy, 10 stabilization, 7 clipboard, 7 shared workspace, 15 new image tools), and 10 actual Chromium worker groups passed. The 15 image-tool groups also passed at 2× device scale and are not counted twice. See each current results JSON and run log. Tests use fictional data only.

DOM/canvas/PNG bytes/clipboard/IndexedDB/BroadcastChannel and applicable Web Locks/worker restart are real; Chrome extension APIs and downloads are controlled doubles. Manual arrows/circles/black fills are verified in output pixels, with original hashes unchanged. Extended selection, restoration, frozen filing, edited backup/restore, denied export retry, stale review sheets and logical deletion passed. Current screenshots include desktop/narrow editor, dotted guides, blue toolbar and workspace; these were visually inspected.

Native preflight exits 2 with status blocked and zero native groups: managed wildcard ExtensionInstallBlocklist prevents unpacked installation. No policy/security workaround. Native Edge/activeTab/screenshot focus/OS paste/save/print/zoom and screen readers remain unverified. No new live-platform lookups in this release; prior 1.8.8 evidence is historical and private observations remain outside source/packages. No universal reliability or legal-compliance guarantee.

Package CRC, hashes/runtime byte identity and extracted gates are recorded in the release verification receipt. Repeated tests are not additional unique groups.

The extracted development ZIP passed 165 Node checks, all 15 new image-tool groups and 7 shared workspace groups. Final packaging preserves every tested runtime byte.
