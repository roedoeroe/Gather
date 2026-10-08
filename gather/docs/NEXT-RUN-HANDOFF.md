# Gather 1.8.12 next-run handoff

Latest steering: read [R4 workflow reconciliation](R4-WORKFLOW-RECONCILIATION.md) first. It narrows the product to Edge utilities and supersedes older coverage/intake/composer priorities. The signed-in Instagram and horizontal-selection defects reported there remain open; 1.8.12 is a tested development checkpoint, not completion of R4.

Use /workspace/Gather, existing develop/1.8.0-r3 branch. Preserve user edits and immutable earlier packages. Main is unchanged. Development-branch publication is already authorized. Source public; case data stays local. No agent delegation unless directly requested. Read README, TESTING, HARDENING-REVIEW-1.8.12, PRIVACY-DATA-FLOW, THREAT-MODEL and LEGAL-REVIEW-QUESTIONS before more work.

## Completed in this continuation

1.8.11 was completed and published first: source/package 29dd714087235820d389996d85b9178fa5ee2f15; verified public-download documentation bd02c1566e0c8d01bf8f3826438829647533467d. Its ZIPs are immutable. Search launches without stored query/draft/log; reverse-image provider chooser sends no image; profile source fallback is automatic; native placeholders use fictional examples; capture lists publish complete replacements without flicker. Legacy query text/drafts scrubbed, stable reference IDs retained; explicitly saved findings/case fields remain.

1.8.12 is a separate narrow hardening release: public fetch omits credentials; shared parser runs in an isolated page world and returns a validated small result, not HTML; local/session TRUSTED_CONTEXTS every worker startup; bounded authorized messages/strict preference keys; generic page selection overlay; opaque list filenames; clipboard/original/unencrypted-backup disclosures; generated-code freshness + package private-file/credential gate. No new permissions or storage schema. No new product features, encryption, automatic redaction, image upload or cloud storage.

## Development invariants

Runtime is gather/account-id-tool (version 1.8.12). profile-reader.js is generated from the same local adapter modules using `python3 scripts/build-profile-reader.py`; --check rejects drift. No third-party bundler/runtime dependency. It is injected as a packaged static file in ISOLATED world, then called in the same document. Do not reintroduce dynamic import into the service worker, large HTML return values or page MAIN-world execution. Preserve exact string IDs, project-free lookup, no guessed relationships, frozen destinations, original pixels, selected-derivative guards, deletion epochs/locks/tombstones and recoverable binary backup/restore.

Source in-page reads still parse up to 15M chars transiently; public anonymous response parsing occurs in extension memory. Same-page source GET / optional browser-tab fallback can use normal browser login for explicitly requested profile. No bypass. Clipboard and downloaded files leave Gather; local storage and .gather backups are not application-encrypted. Logical deletion is not forensic erasure. Auto-copy remains the user's requested remembered option; redaction remains manual.

## Validation and next priorities

TESTING.md and versioned evidence contain final counts. Native extension install is blocked in this machine by /etc/chromium/policies/managed/extensions.json, ExtensionInstallBlocklist ["*"]. Do not remove policy, switch browsers to evade it, disable sandbox/TLS or claim installed Edge tested. The rendered suites and real worker/isolated-world tests are useful independent evidence. No new live-platform tests were made in 1.8.12.

Next: permitted installed Edge checks (PRIVACY-ACCEPTANCE); organizational deployment/retention/encryption/distribution/counsel decisions; then retained product backlog in PRODUCT-DIRECTION/GOALS-AUDIT. Quick Parts remains generic local organization-pack architecture, search/preview/copy before composer, no AI/email dependency. Selected-result save, idempotent retries and deliberate next-scan preparation remain future work. Custom roots and nested-scroller capture are deferred. Ignore withdrawn Rick creative prompt and automatic-masking proposal.

Releases/1.8.12 contains runnable ZIP, development ZIP, hashes, verification receipts and installation/rollback notes. Update same directory + Reload, without uninstall/clear storage. Reload clears ephemeral values. Rollback with previous matching backup in a clean test profile; older validators may reject query-free legacy search references. Cloud start instructions are saved separately; review/save/publish the environment if offered. A saved draft does not prove fresh-task restore.
