# Cloud environment setup — Gather 1.8.14

Use the existing `/workspace/Gather` checkout. Tasks are already isolated; do not create worktrees or delegate unless explicitly requested. Inspect Git status/newer edits before changing anything. Read `gather/docs/NEXT-RUN-HANDOFF.md`, `R4-WORKFLOW-RECONCILIATION.md` and `TESTING.md`. Preserve source edits and completed release ZIPs. User authorizes development-branch publication, not a main merge or visibility change.

Runtime is `gather/account-id-tool`, with no dependencies, install script, bundler, server or case-storage credential. Node 24 and Python 3 run tests/package generation. Browser tests use the supplied Playwright 1.62.1 and `/usr/lib/chromium/chromium`, with `chromiumSandbox:true`. In this machine, set `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules` before browser commands. Test scripts own/close their own servers/profiles. Nothing needs to run between tasks. Full commands/counts are in TESTING.

Run `python3 scripts/build-profile-reader.py --check` and `node --test tests/*.test.mjs` from `/workspace/Gather/gather`. The reader is generated from local tested adapters, not runtime web scripts. Preserve static worker imports, trusted storage/messages, exact IDs, local case data, no automatic query history, frozen filing, original pixels, derivative guards and binary restore journal.

Managed Chromium blocks unpacked extensions (`/etc/chromium/policies/managed/extensions.json`, `ExtensionInstallBlocklist:["*"]`). `node tests/browser-acceptance.mjs` reports blocked and exits 2 with zero native groups. Do not change policy, sandbox or TLS or install an alternative to evade restrictions. Real rendered/worker/isolated tests remain useful; never label API doubles or simulated DPR as installed Edge/native zoom. Source-image and Reference remain behind the R4 native P0 gate. The 1.8.14 live signed-out profile read and controlled missing-markup/live-public-response test do not replace signed-in Edge acceptance.

The development branch is `develop/1.8.0-r3` (historical branch name). Main retains the user's independent 1.8.11 merge. Use the existing HTTPS Git proxy; do not request a token merely because GH_TOKEN is absent. Preserve local-only work. Versioned ZIPs/receipts are in `releases/1.8.14`; older releases remain immutable. ZIP raw downloads are the verified delivery route; GitHub Release upload was previously unavailable. No case/reference content goes into public source or fixtures.

## The setup dialog

Choose **Done** in “Configure setup instructions.” **Install script — Not set** is expected: Gather has no runtime installation step. **Start skill** is the saved guide for future cloud work, not another extension to install. Review and save updated environment settings, then use **Publish environment** if offered to preserve the prepared cloud snapshot. The saved draft does not execute scripts or publish itself. Cloud publication and installing Gather's extension ZIP on your computer are separate operations.

The workspace restoration observed in this run preserved edits and tools. Temporary processes/logs were restarted/rerun. This does not establish restoration of any later unpublished config draft. Network, secret requirements and the absent install script are preserved.
