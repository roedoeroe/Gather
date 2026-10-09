# Security and private diagnostics

Gather has no telemetry, hosted case storage, support upload or automatic crash report. Public GitHub is for source and fictional reproductions. Never attach real intake, school/student/contact names, profile URLs/IDs, screenshots, page source, cookies, tokens, clipboard contents, organization packs or .gather backups to a public issue.

For a bug, record Gather/browser version, operation, a generic error category, whether it followed reload/cancel/delete, and steps using Alex Example/example.test. Sanitize filenames and screenshots manually. A hash identifies bytes; it does not establish authenticity, identity or safe content.

For suspected exposure: stop the affected export/publication, preserve a minimal private timeline, notify the organization's designated security/privacy contact through its approved channel, and have them determine containment, recipient notification and legal reporting. There is no automatic reporting channel in Gather. Do not paste secrets into this repository, rotate credentials blindly or rewrite public history as a substitute for incident response. Do not distribute sensitive details before a private reporting channel has been established with the maintainer.

See [data flows](PRIVACY-DATA-FLOW.md), [threat model](THREAT-MODEL.md), [hardening review](HARDENING-REVIEW-1.8.12.md) and [legal questions](LEGAL-REVIEW-QUESTIONS.md). Local browser storage and backups are unencrypted by Gather. Use an organization-managed device/profile with appropriate disk encryption, access and backup controls. Logical deletion cannot remove external downloads, browser/provider history, OS clipboard/history, screenshots already shared or storage remnants.

## Release checks

From a Git checkout, run `python3 gather/scripts/check-public.py` before staging/publication and `python3 gather/scripts/check-public.py --history` to inspect reachable historical blobs and release archives. `python3 gather/scripts/package.py` applies the same path/credential gate to both ZIPs and rejects a stale generated page reader. These are local checks, with no scanning-service upload. Private organization-pack/dump paths are also ignored by Git. Ignored does not mean safe to include in a package: packaging still rejects them. Pattern checks cannot recognize arbitrary personal names, screenshots or proprietary wording; review proposed public changes and evidence.

Before any Web Store distribution, review privacy disclosure/consent, Limited Use and current user-data handling requirements with the organization. This development release is not a store approval; local storage and backups are unencrypted by Gather.
