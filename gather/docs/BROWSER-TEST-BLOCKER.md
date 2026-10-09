# Historical Chromium installation blocker

**1.8.15 update:** the user authorized installing Edge. Verified official Edge now passes 36 native groups without changing Chromium policy or disabling sandboxing. See [current tests](TESTING.md) and [setup](ENVIRONMENT-SETUP.md). The account below explains the earlier Chromium-only blocker.

Historical diagnosis checked October 8 UTC (October 7 in the user’s timezone) against this machine and Gather 1.8.6. Historical release: [1.8.7 delivery](../../releases/1.8.7/Gather-1.8.7-DELIVERY.md), with 132 automated checks, 85 rendered groups and 10 worker groups passed; native installation remains blocked under the unchanged policy.

“Browser acceptance” means checking Gather after installing it in Chrome/Edge: open the toolbar, select an area on a page, copy the screenshot, save it and check its destination. It is a testing step, not another product mode or a requirement to set up a case.

## The exact restriction

This cloud machine's managed Chromium policy is:

```text
/etc/chromium/policies/managed/extensions.json
ExtensionInstallBlocklist: ["*"]
```

[Chromium's official policy definition](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Extensions/ExtensionInstallBlocklist.yaml), retrieved successfully over verified HTTPS, explicitly says this blocks **all unpacked extensions**. Exceptions for signed installed extensions do not permit unpacked ones. The prior browser diagnostic reported “Loading of unpacked extensions is disabled by the administrator.” The restriction still exists. At that time this machine had Chromium 151 and no separate installed Chrome or Edge. Changing the network allowlist or saving startup instructions cannot remove this browser policy.

The restriction belongs to this cloud machine. The user's earlier screenshots show Gather already installed on their computer. It does not establish that their browser has the same policy or that Gather is failing there.

Administrator policy remains intact. The supported path to an installed-extension test is a browser environment whose administrator permits loading development extensions. Publishing a cloud configuration draft alone does not supply that capability. Installing another browser to evade the policy is not the remedy.

## Work completed despite the restriction

- Reran **130 automated checks**, **71 rendered-browser groups** and **10 actual worker groups**; all passed. They cover lookup, exact IDs, scan continuity, capture/copy, cancellation/restoration, export retry, redaction, deletion/history races and binary backup/restore.
- Repaired the stale installed-extension test runner: current New case/Add/Findings/Settings controls, current disclosure behavior, no assertions on a hidden old list, bounded worker startup, temporary-profile cleanup and fresh structured results.
- Verified its seven shared interface groups separately through actual rendered product documents and extension API doubles, including a real file download. The reproducible command is `node tests/browser-installed-ui.mjs` from `gather`. This is **not** seven native passes.
- Verified the managed-policy check returns **blocked / exit 2 / zero native tests**, immediately and without launching another forbidden extension attempt. Unexpected failures are exit 1; completed native smoke checks use exit 0.
- Checked fresh toolbar/desktop/narrow screenshots and original release ZIP hashes/CRC/runtime-byte identity. Runtime 1.8.6 and the published packages are unchanged.

The installed-extension smoke runner covers actual worker startup plus case/source/task/search/reload/export/privacy-cancel/reflow. It does **not** automate clicking Chrome's native toolbar, activeTab permission grants, screenshot rate limits or native save/print dialogs. A passing smoke run would not complete those remaining checks. Live platform markup is a separate question too; controlled fixtures do not establish current live success.

Evidence: [fresh results](evidence/browser-blocker-2026-10-08/README.md). Fetch the development branch for the repaired runner; the previously released development ZIP retains its original test snapshot.

## The smallest check on an installed copy

Use a disposable fictional page/case, not a real investigation:

1. On the browser Extensions page confirm Gather **1.8.7**. If updating, replace all files in the same installed folder and Reload; keep stored data/profile intact. [Verified download and update instructions](../../releases/1.8.7/Gather-1.8.7-DELIVERY.md).
2. Open Gather on that page, choose the displayed scan and **Select area & copy**, drag a rectangle, and paste into a local image-capable app. The image should have the selected bounds, no selector overlay, and appear in that scan's Capture history.
3. Choose **Save image**, then try Full page and Cancel. Verify the local image survives any denied save, Retry works, and the source scroll position is restored after Cancel.

This is the short practical check; [the full checklist](LOCAL-ACCEPTANCE.md) adds other-tab/navigation guards, OS dialogs, browser zoom, supported profiles and privacy isolation. Record version and exact visible failure if a step fails. Do not include private case data in diagnostics. There is no claim that these user-computer steps were performed from the cloud.
