# Cloud environment setup — Gather 1.8.9

Use the existing checkout at `/workspace/Gather`. Each task is already isolated; do not create a new worktree unless explicitly requested. Inspect Git status, instructions, manifest/package versions and the current handoff before changing files. Preserve newer work and all completed release ZIPs.

Runtime source is `gather/account-id-tool`. There are no runtime dependencies, install step, bundler, server or case-storage credentials. Node 24 and Python 3 run the existing tests and packaging. From `/workspace/Gather/gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-toolbar.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
node tests/browser-stabilization.mjs
node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs
node tests/browser-case-clipboard.mjs
python3 scripts/package.py
```

The prepared environment supplies Playwright 1.62.1 and Chromium 151 at `/usr/lib/chromium/chromium`. Browser scripts start/close their own fixture server and temporary profile. No process needs to survive between tasks. `GATHER_BROWSER_ARTIFACTS` chooses output and `GATHER_CHROMIUM_PATH` selects another available browser. Follow TESTING.md if these tools are absent after restoration; do not add extension runtime dependencies or weaken `chromiumSandbox:true`.

1.8.9 validation: 165 Node tests; 21 capture/UX + 22 toolbar + 18 case/privacy + 10 stabilization + 7 case clipboard + 7 installed-runner UI + 15 image-tool groups (100 unique rendered total); image tools also pass at 2× device scale; 10 actual ServiceWorkerGlobalScope groups. [Release evidence](evidence/1.8.9/README.md) records their scope; the earlier [restriction diagnosis](evidence/browser-blocker-2026-10-08/README.md) remains historical evidence. Chrome APIs are doubles; actual installed-browser behavior and live-platform reliability remain separate checks.

The current cloud machine has `/etc/chromium/policies/managed/extensions.json` with `ExtensionInstallBlocklist: ["*"]`. Chromium's official policy definition says this blocks **all unpacked extensions**, including allowlisted ones. No Chrome/Edge alternative is installed here. The restriction prevents installing Gather for a native test in this machine; it is not an observed failure of the user's installation. Existing rendered tests use real pages/canvas/IndexedDB/clipboard and controlled extension APIs and remain useful.

`node tests/browser-acceptance.mjs` now checks this policy before launching, records `status: blocked`, zero passed native groups and exits **2**. Failure is exit 1; an actually completed installed-extension smoke journey is exit 0. It uses current controls and a bounded worker wait, not the old + New/Project name UI. The seven shared UI groups passed separately with rendered/API-double fixtures using `node tests/browser-installed-ui.mjs
node tests/browser-image-tools.mjs
GATHER_TEST_DPR=2 node tests/browser-image-tools.mjs`. Native toolbar invocation, activeTab screenshots and OS dialogs remain outside that smoke test. Never count the blocked run as passed or change policy/sandbox/TLS. Use a permitted test environment or [the short installed-browser check](BROWSER-TEST-BLOCKER.md).

The redesign has four views, optional-intake New case, capture inspection and Settings privacy controls. Preserve frozen filing, exact string IDs, project-free lookup, original images and binary backups. Preserve static worker imports, privacy generations/locks/queues, tombstones, archive scrubbing and late-write guards. Case data stays local; source remains public by the user's choice. Searches/lookups contact chosen sites, exports create separate files. No cloud sync, analytics, passive collection or name-based identity inference.

The maintained branch is `develop/1.8.0-r3` (historical name). Main remains the original README-only branch. If restoration checks out main without `gather`, check local changes and fetch/switch to the existing development branch; do not reset user edits. Use the supplied Git proxy authentication. Development-branch publication is authorized; merging main or changing visibility is not requested. Versioned delivery assets are tracked in `releases/1.8.9/`; `/dist` also contains local copies. Earlier releases remain immutable. GitHub Release upload endpoints previously returned HTTP 400 Bad Content-Length; Git ZIP mirrors are the working delivery path. Fetch the development branch for later testing-tool/document changes; the release source ZIP is an immutable snapshot.

Update at the same installed directory and Reload, without uninstalling or clearing storage. Reload releases ephemeral session values. Keep the old package and matching backup; validate rollback in a separate clean profile.

## The setup dialog

Choose **Done** in “Configure setup instructions.” **Install script — Not set** is expected: no runtime dependencies or install script are required. **Start skill** is the saved agent startup guide, not an additional extension to install. If the product then offers **Publish environment**, use it to preserve this prepared cloud workspace for future tasks. These are cloud settings; Gather is separately installed from its extension ZIP on your computer.

The `start_skill` configuration draft captures these steps. Saving a draft does not execute startup, publish a cloud snapshot or verify restoration in a fresh task. Environment publication remains a separate user action. The repository draft is corrected from main to the verified development checkout at mount Gather. Network, credentials and the intentionally absent install script are preserved.
