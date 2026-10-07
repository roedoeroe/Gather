# Cloud environment setup — Gather 1.8.3

Use the existing checkout at `/workspace/Gather`. Each task is already isolated; do not create a new worktree unless explicitly requested. Inspect Git status, instructions, manifest/package versions and the current handoff before changing files. Preserve newer work and all completed release ZIPs.

Runtime source is `gather/account-id-tool`. There are no runtime dependencies, install step, bundler, server or case-storage credentials. Node 24 and Python 3 run the existing tests and packaging. From `/workspace/Gather/gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

The prepared environment supplies Playwright 1.62.1 and Chromium 151 at `/usr/lib/chromium/chromium`. Browser scripts start/close their own fixture server and temporary profile. No process needs to survive between tasks. `GATHER_BROWSER_ARTIFACTS` chooses output and `GATHER_CHROMIUM_PATH` selects another available browser. Follow TESTING.md if these tools are absent after restoration; do not add extension runtime dependencies or weaken `chromiumSandbox:true`.

1.8.3 validation: 118 Node tests; 21 rendered capture/UX groups; 18 rendered case/privacy groups; 9 actual ServiceWorkerGlobalScope groups. Evidence is `docs/evidence/1.8.3`. Chrome APIs are doubles; native extension and live-platform acceptance are distinct. Native unpacked loading is blocked by “Loading of unpacked extensions is disabled by the administrator.” Do not repeatedly retry the same command or disable browser security. Use LOCAL-ACCEPTANCE.md on an allowed installation.

The redesign has four views, optional-intake New case, capture inspection and Settings privacy controls. Preserve frozen filing, exact string IDs, project-free lookup, original images and binary backups. Preserve static worker imports, privacy generations/locks/queues, tombstones, archive scrubbing and late-write guards. Case data stays local; source remains public by the user's choice. Searches/lookups contact chosen sites, exports create separate files. No cloud sync, analytics, passive collection or name-based identity inference.

The maintained branch is `develop/1.8.0-r3` (historical name). Main remains the original README-only branch. If restoration checks out main without `gather`, check local changes and fetch/switch to the existing development branch; do not reset user edits. Use the supplied Git proxy authentication. Development-branch publication is authorized; merging main or changing visibility is not requested. Versioned delivery assets are tracked in `releases/1.8.3/`; `/dist` also contains local copies. Earlier releases remain immutable. GitHub Release upload endpoints previously returned HTTP 400 Bad Content-Length; Git ZIP mirrors are the working delivery path.

Update at the same installed directory and Reload, without uninstalling or clearing storage. Reload releases ephemeral session values. Keep the old package and matching backup; validate rollback in a separate clean profile.

The `start_skill` configuration draft captures these steps. Saving a draft does not execute startup, publish a cloud snapshot or verify restoration in a fresh task. Environment publication remains a separate user action. No network, repository-selection, credential or install-script changes are needed for this release.
