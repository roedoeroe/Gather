# 1.8.15 RC evidence

Final source regression: every suite in regression-summary.json exited 0. Node output contains 214 passes, zero failures/skips. The scenario JSON files separate rendered API doubles, actual worker/isolated-world tests, native installed Edge and sanitized live diagnostics. See ../../TESTING.md for counts and boundaries. Native suites total 36 groups; repeating them on an extracted package does not create new unique scenarios.

Screenshots listed below were visually inspected. All page/case/account/image content is deterministic fictional test data. The native popup uses an intercepted fictional platform page, not a real account. Help is local. Old failure/debug screenshots were excluded. Public live-edge.json contains status/timing only; raw live source/account details and the private diagnostic helper were not copied.

The native repeated-capture assertion verifies nine unique records for nine actions, three cancelled, and a successful capture after cancellation with no ghost tab or lock. Native editor verifies manual redaction pixels and unchanged original hash. edge-update.json verifies the same-folder/profile 1.8.14 → 1.8.15 update.

Inspected images:

- edge-native-native-edge-desktop.png
- edge-native-native-editor.png
- edge-native-help-narrow.png
- edge-native-native-scrolling-selection.png
- capture-panel-rendered.png
- capture-workspace-desktop.png
- capture-settings-desktop.png
- toolbar-all-case-history.png
- case-simple-case-create.png
- toolbar-current-page-failure.png
- capture-workspace-narrow.png
- image-tools-crop-handles.png

Pixel/DPR rendered checks are not native zoom. Native side-panel opening and OS image-save/print dialogs remain untested.
