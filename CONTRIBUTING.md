# Contributing to Gather

Gather is a local browser extension for account lookup, screenshots and deliberate research. Keep changes focused on making that workflow faster, clearer and reliable. A case remains optional; exact account IDs and original image bytes must be preserved.

## Choose the right source

The default `main` branch contains the 1.8.16 release-candidate source. Continue development on `develop/1.8.0-r3`, or use the relevant immutable release tag to reproduce a published package. Inspect existing changes before editing and keep published versioned ZIPs immutable. Merging source into `main` does not promote a prerelease to stable or update installed extensions.

| Location | Purpose |
| --- | --- |
| `gather/account-id-tool/` | Unpacked extension runtime |
| `gather/tests/` | Unit, rendered and native-browser tests |
| `gather/scripts/` | Reader generation, privacy checks and packaging |
| `gather/docs/` | Product notes, test evidence and handoff |
| `releases/` | Versioned packages and integrity receipts |

## Validate a change

With Node and Python available, from the repository root:

```sh
cd gather
python3 scripts/build-profile-reader.py --check
node --test tests/*.test.mjs
```

Run browser checks relevant to the changed workflow. [TESTING](https://github.com/roedoeroe/Gather/blob/1.8.16-rc.1/gather/docs/TESTING.md) describes the dependencies and distinguishes rendered API doubles from actual installed Edge tests. State what ran, what passed and what remains untested. Do not label simulated display scaling as native zoom.

Before publication, from the repository root:

```sh
python3 gather/scripts/check-public.py
```

This scanner checks paths and common credential patterns. Review text and images as well; it cannot recognize all sensitive information.

## Reports and pull requests

Use the [bug form](https://github.com/roedoeroe/Gather/issues/new?template=bug-report.yml) with Gather/browser versions, the action taken and a small fictional reproduction. For a proposed workflow change, explain the user's task and the repeated work it would remove.

PRs should explain the concrete problem, resulting behavior and relevant validation. Avoid unrelated redesigns in a stabilization fix. Keep generated `profile-reader.js` consistent with its local adapter sources.

Public examples must use fictional names, URLs and images. Do not commit real cases, profile identifiers, page source, cookies, credentials, case backups or private organization reference packs. See [Security](SECURITY.md).

## Attach a prepared release package

The manual **Attach verified extension** GitHub Actions workflow accepts an existing version tag. It verifies the release target, package receipt, SHA-256, ZIP integrity and manifest version, then attaches only the extension ZIP. It does not rebuild packages, execute their contents or overwrite an existing asset. Publication of a new release still requires maintainer authorization.
