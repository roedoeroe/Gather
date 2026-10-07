# Cloud environment setup

Setup and validation completed in the existing `/workspace/Gather` checkout. The extension lives in `gather/account-id-tool`; no runtime install, bundler, service, credential or application environment variable is needed. Node 24 and Python 3 run automated tests and packaging. Playwright 1.62.1 and sandboxed Chromium 151 run the rendered fixture journeys; see `TESTING.md` for commands and limitations.

Reusable startup instructions were saved successfully through the cloud-environment-onboarding configuration tool. The save returned `status: saved`, `requires_publish: true`, draft ID `f48a87a3-f937-4677-9d9e-d9c40b45e675~cecfgdraft_6ac55bcaa29481909166e1267d756bd6`. Only `start_skill` was updated; repository membership, network policy, secret requirements and existing runtime settings were preserved. No install script is necessary.

Review and save the changes in environment settings, then **Publish** the environment. Saving a draft does not apply/publish it or prove that a fresh task can restore this source. No fresh-task restoration was performed. Do not rely on a local checkout/commit alone as proof of remote synchronization; retain the development ZIP independently.

Native unpacked extension acceptance remains blocked by administrator policy. A permitted native runner or local Chrome/Edge is the supported diagnostic path. Browser security sandbox, TLS and administrator policy were not weakened.
