# Cloud environment setup — Gather 1.8.2

Use the existing `/workspace/Gather` checkout; runtime source is `gather/account-id-tool`. No runtime install, bundler, service, credential or application environment variable is needed. Node 24 and Python 3 run automated tests and packaging. Playwright 1.62.1 and sandboxed Chromium 151 run the browser journeys.

From `/workspace/Gather/gather`:

```sh
node --test tests/*.test.mjs
node tests/browser-capture.mjs
node tests/browser-case.mjs
node tests/browser-worker.mjs
python3 scripts/package.py
```

Read `TESTING.md` for exact evidence and the distinction between real ServiceWorkerGlobalScope, mocked Chrome APIs and native installed-extension acceptance. Version 1.8.2 adds guarded local privacy controls while preserving the 1.8.1 worker import and popup sizing fixes. Do not select the older 1.8.0 just because its historical tests were green.

Reusable startup instructions are maintained in the cloud-environment-onboarding configuration draft, ID `f48a87a3-f937-4677-9d9e-d9c40b45e675~cecfgdraft_6ac55bcaa29481909166e1267d756bd6`. Only startup instructions are updated; repository membership, network policy, secrets and unrelated settings remain unchanged. Review and save in environment settings, then **Publish**. A saved draft does not publish the environment or prove fresh-task restoration; neither action has been performed here.

The user-authorized source branch is `roedoeroe/Gather:develop/1.8.0-r3`; its manifest now advances to 1.8.2. The final delivery receipt records the verified correction commit. Main is unchanged. If a new checkout begins on the README-only main branch, fetch the development branch after checking for local changes; do not reset user work or restart from an older upload. Downloadable development ZIPs provide another independent source/evidence copy. No Drive upload occurred.

Native unpacked-extension loading remains blocked by administrator policy. Use a permitted runner or local Chrome/Edge. Do not repeatedly retry the blocked path or weaken browser sandbox, TLS or administrator policy. Current browser runs use the unrestricted execution environment with `chromiumSandbox:true`; follow current tool permissions and never add unsupported escalation flags.
