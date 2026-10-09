# Cloud environment setup — Gather 1.8.15 RC

Use the existing `/workspace/Gather` checkout. Cloud tasks are already isolated: do not create a worktree unless the user asks. Inspect Git status and newer edits before changing anything. Read NEXT-RUN-HANDOFF, TESTING, RELEASE-CANDIDATE-1.8.15 and R4-WORKFLOW-RECONCILIATION. Preserve source edits and immutable release ZIPs. Development-branch publication, the 1.8.15 GitHub prerelease and GitHub presentation updates are authorized. Main’s application baseline remains independent; no app merge or visibility change is authorized.

The extension needs no runtime dependencies, install script, bundler, server or case-storage credential. Node 24 and Python 3 run tests/packaging. Supplied Playwright 1.62.1 is at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`; browser tests require that path as NODE_PATH. Run from `/workspace/Gather/gather`:

```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
```

The generated reader uses local adapters, not remote scripts. Preserve static worker imports, exact IDs, local case data, query-free search, frozen filing, original pixels, derivative guards and restore/deletion journals. Do not edit runtime/tests during suites. Test scripts close their temporary profiles/servers. Runtime needs no continuously running service.

## Browser capabilities

Rendered suites use sandboxed `/usr/lib/chromium/chromium`. Its managed `ExtensionInstallBlocklist:["*"]` is unchanged; it still cannot load unpacked extensions. That restriction must not be edited or weakened.

The user authorized installing Microsoft Edge and WebDriver. Official **Edge 155.0.4283.45** is locally extracted at `/workspace/gather-browser-tools/edge-install/runtime/opt/microsoft/msedge/msedge`. Microsoft-signed repository metadata and package hashes were verified. Matching official driver: `/workspace/gather-browser-tools/edge-install/driver/msedgedriver`; version checked, but tests use Playwright rather than WebDriver. Edge normally permits this unpacked extension with sandboxing enabled. No policy change, no no-sandbox, TLS bypass or unsafe extension-debugging flag.

Native headless checks:

```sh
export GATHER_CHROMIUM_PATH=/workspace/gather-browser-tools/edge-install/runtime/opt/microsoft/msedge/msedge
GATHER_BROWSER_ARTIFACTS=/workspace/Gather/artifacts/native-workspace node tests/browser-acceptance.mjs
GATHER_BROWSER_ARTIFACTS=/workspace/Gather/artifacts/native-update node tests/browser-native-update.mjs
```

The update test reads the immutable releases/1.8.14 extension ZIP. `GATHER_EXTENSION_ROOT` and `GATHER_PREVIOUS_PACKAGE` allow exact extracted-package verification without changing source.

## Restart the display for native toolbar/capture checks

Live processes do not survive snapshots. The verified Debian Xvfb/xdotool files are retained under `/workspace/gather-browser-tools/x11/runtime`; package receipts are outside the public repository. The private Xauthority file is `/workspace/gather-browser-tools/x11/session/auth`. Do not print or commit it. If missing, create a mode-600 file and a fresh random MIT-MAGIC-COOKIE-1 entry for `:94` using xauth; pass the cookie on stdin, not in logs. Never use `-ac`.

First check whether the display is already ready using `DISPLAY=:94 XAUTHORITY=/workspace/gather-browser-tools/x11/session/auth xdpyinfo`. If absent, start this in a background terminal task and keep it running while native tests execute:

```sh
/workspace/gather-browser-tools/x11/runtime/usr/bin/Xvfb :94 -screen 0 1440x1000x24 -nolisten tcp -auth /workspace/gather-browser-tools/x11/session/auth
```

Confirm `xdpyinfo` succeeds before starting Edge. The `/tmp/.X11-unix` ownership warning seen in this non-root container did not prevent readiness. Diagnose a failed display instead of retrying the browser repeatedly. Then:

```sh
export DISPLAY=:94
export XAUTHORITY=/workspace/gather-browser-tools/x11/session/auth
export LD_LIBRARY_PATH=/workspace/gather-browser-tools/x11/runtime/usr/lib/x86_64-linux-gnu
export GATHER_XDOTOOL=/workspace/gather-browser-tools/x11/runtime/usr/bin/xdotool
export GATHER_CHROMIUM_PATH=/workspace/gather-browser-tools/edge-install/runtime/opt/microsoft/msedge/msedge
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
GATHER_BROWSER_ARTIFACTS=/workspace/Gather/artifacts/native-workflow node tests/browser-native-workflow.mjs
```

The test assigns a normal extension action shortcut through Edge's settings in its temporary profile, then uses real OS keyboard/mouse input. It does not override activeTab. Only run one headed native interaction suite per display at a time. Stop only display processes you started when finished. The display startup/readiness and all native commands succeeded in this instance; fresh-task restoration of this final snapshot has not been verified.

## Publication and the setup dialog

Branch `develop/1.8.0-r3` is historical naming; main retains the independent 1.8.11 merge. Use existing HTTPS proxy authentication rather than requesting a token because GH_TOKEN is absent. Only sanitized fictional evidence belongs in public packages. Versioned ZIPs and download receipts are in releases/1.8.15; prior releases stay immutable.

Choose **Done** in “Configure setup instructions.” **Install script — Not set** is expected, because no runtime installation step is needed. **Start skill** is the saved cloud startup guide, not another extension to install. Review/save environment settings and use **Publish environment** when offered to snapshot installed tools and activate the final repository ref. A saved configuration draft does not publish itself. This is separate from updating Gather on the user's computer.

Keep network, secrets and the absent install script unchanged. Published Git source/ZIPs are independently reproducible; the locally installed browser tools also require the environment snapshot. Never claim a restored environment was tested merely because this instance passed.
