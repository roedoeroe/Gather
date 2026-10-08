# 1.8.12 privacy/security hardening review

Working review started from published 1.8.11 (bd02c15), before code edits. 1.8.11 ZIPs remain unchanged. This is a focused engineering review, not a penetration test, compliance certification or guarantee.

| Priority / finding | Evidence at baseline | Planned correction and regression evidence | Residual / decision |
|---|---|---|---|
| P1: unnecessary credentialed public fetch | resolver fetchSource credentials: include | Omit credentials for extension-origin public GET; test request options | Explicit same-page source and optional browser fallback use normal session; disclose, no auth bypass. |
| P1: excessive injected result | resolver transfers up to 15M chars of whole DOM/source | Run identical parser in isolated page world using packaged static code; return bounded structured result; test all adapters/negative guards and actual rendered reader | Parsing still reads bounded source in page memory. Display name only returned when requested. |
| P1: storage boundary applied only at install | background onInstalled local.setAccessLevel | Apply local + session TRUSTED_CONTEXTS each worker startup and fail worker actions if unavailable; test failures | Installed-browser enforcement remains unverified here; no at-rest encryption. |
| P1: case destination in page helper args | capture-selection passes friendly destination | Remove friendly labels from injected arguments; destination remains visible in extension capture UI | Overlay generic Gather label; frozen record IDs untouched. |
| P2: message envelope/preference shape | Exact sender allowlist exists; no global bounded shape, arbitrary preference keys | Bound JSON-like messages before dispatch, reject dangerous keys; allowlist preferences | Existing operation/model/import validators remain authoritative. |
| P2: backup warning incomplete | UI says originals but not unencrypted | Explicit unencrypted/any-file-reader and clipboard boundary wording | No encryption invented; organizational device/file controls required. |
| P2: identifying lookup export filename | Batch title used as filename | Timestamp + opaque batch ID filename | Export body is deliberately selected data, not anonymized. |
| P1: packaging lacks privacy gate | package.py recursively includes source files | Guard private paths/secret patterns/archive members; fail before packaging; seed negative tests | Cannot recognize arbitrary real names or classify pixels; human review required. |
| P2: public/history review | Prior packages/docs and fictional evidence in Git | Scan reachable history paths/text/release archives, review evidence provenance; record scope/counts | No automatic history rewrite; any real exposure needs separate incident handling. |

Preserve screenshot auto-copy preference (user explicitly requested it); add clear OS clipboard wording. Do not automatically redact, mask names in original pixels, disable working capture, broaden permissions or add new product features. Local encryption, organization retention policy, custom folder permissions, independent security assessment and native Edge checks remain separate work.

Implementation outcomes, test counts, artifact scan and residual risk summary will be completed before release.

## Implemented outcomes

- Public extension fetch now uses credentials: omit. Same-origin automatic source read remains explicit, bounded and documented; browser fallback still follows the analyst's existing option.
- The shared core/account-state/profile-status parser is statically generated into profile-reader.js. The page's isolated world parses DOM/source; a schema-checked result under 8 KiB crosses back. Exact IDs, conservative matching, login/challenge and ambiguity behavior are preserved. Name return follows includeName. No case context, HTML, cookies or arbitrary script returns. The 15M source bound still exists within page memory; this is minimization across the boundary, not avoidance of reading the requested page.
- Storage restrictions now run for both local and session at every worker start; failure blocks routed actions. Messages require an authorized extension page and bounded JSON-like structure, safe keys and valid operation data. Preferences accept only known fields/types. No permissions added.
- Selection overlay receives no destination label; the extension's capture UI still shows the frozen case/scan/subject. Saved-list filenames use timestamps, not friendly batch titles. Images retain their readable host/time/mode plus opaque IDs.
- Copy/backup disclosures explain external clipboard history, manual edits, originals and unencrypted backups. Existing user-requested auto-copy defaults/preferences remain. Missing selected derivatives still fail instead of sharing originals.
- Packaging verifies the generated reader and checks candidate paths/content and nested archive members for private files/credential patterns before writing ZIPs. Fictional fixtures are scanned too. Negative tests seed synthetic tokens/private packs/path traversal. No actual secret is used.

No P0 exposure or demonstrated unauthorized upload was found in this focused review. No source/history rewrite or platform-control bypass was performed. Public-history scan: 953 reachable named objects, 742 unique blobs, 20 release ZIPs, 129,015,939 bytes; no path/credential-pattern findings. This cannot detect all personal/proprietary prose or classify images. Historical public image paths belong to icons and fictional rendered-test evidence; their provenance was reviewed, not every historical pixel. Three current release screenshots were visually inspected.

Production network review found only anonymous profile GET, same-origin requested source GET and local data-URL pixel decoding; provider tabs are explicit navigation. No analytics, sync storage, automatic image upload or new endpoint. No runtime third-party dependencies, lockfile or remote-code loader; Python generator is repository-owned, deterministic and checked against source. Test tooling is Node 24 / supplied Playwright 1.62.1 / sandboxed Chromium 151. An SBOM/vulnerability-service audit of the operating system was not performed.

## Evidence and remaining limits

191 Node tests passed. Existing 105 rendered workflow groups and 10 actual service-worker groups passed. Five additional real Chromium isolated-world reader groups passed with all network responses intercepted fictional data. The first updated worker fixture used an unsupported dynamic import inside ServiceWorkerGlobalScope; changed to a static test import and reran all ten groups successfully. Production worker imports remained static throughout. Native extension loading is blocked by machine policy; zero native groups passed. No new live-platform observation was made in 1.8.12; the limited authorized anonymous Instagram observation is archived with 1.8.11, not generalized to Edge or other platforms.

Residuals: Gather does not encrypt local storage or backups; operating-system/profile access and external clipboard/download copies remain outside deletion. Full source is still parsed transiently in page memory; public response parsing remains extension memory. A site can spoof profile data. No legal compliance, authenticity or complete-security claim follows from these tests. An independently permitted installed Edge run and organization/counsel deployment decisions remain outstanding. Do not ship sensitive data to a public issue to diagnose them.

Priority after this release: (1) permitted installed Edge checks for native invocation, source injection and clipboard/download dialogs; (2) organization retention/access/distribution requirements, including encryption needs and Web Store disclosures; (3) only then resume the retained product backlog. New Quick Parts/AI/custom-root/nested-scroll features were not added during hardening.

All 16 image-tool groups also passed at 2× device scale; repeat evidence, not additional unique scenarios.
