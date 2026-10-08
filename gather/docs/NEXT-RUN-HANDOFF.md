# Gather 1.8.11 handoff

Continue from the existing checkout `/workspace/Gather`, branch `develop/1.8.0-r3`. Main remains unchanged. User authorization to publish this development branch persists; source is public, real case/reference data stays local. No delegation unless explicitly requested by the user or applicable instructions. Preserve all release packages and newer edits; never reset the working tree to an older remote.

## Current implementation

Runtime: `gather/account-id-tool`; manifest/package/adapter 1.8.11. No runtime dependency, bundler or server. Same seven permissions and six supported-platform host patterns; Chrome116+ / Chromium Edge.

1.8.11 implements the latest direct user corrections:

- Search the web is launch-only: no query, draft or new search record in local/session storage. Successful submission clears input; failed launch leaves it for Retry. Session tab assignments retain only filing IDs, survive worker restart and use browser opener relationships. Global destination switches cannot silently refile related tabs.
- Existing automatic query text, search URL/activity and draft keys are scrubbed, including archived drafts and old-backup imports. Query-free reference IDs/timestamps preserve old capture/finding relationships. Deliberately saved case fields/plans, account observations, findings, tasks and captures remain. External browser/provider history and prior exported files are separate.
- Reverse image uses fixed provider pages: Google Images/Lens, Lenso, Bing, Yandex, Baidu, Sogou, TinEye and Shutterstock. No image/clipboard read or automatic upload. Bing/Shutterstock UI was not verified because ordinary HTTP checks returned403. Other provider pages returned200; no image was submitted.
- Current-profile lookup first reads rendered data. If the account ID is missing, one bounded source fetch runs in the same authorized document with same-origin credentials, timeout12sec and limit15million characters. IDs remain account-bound/exact strings. Login/challenge, mismatch and ambiguity do not trigger repeated source reads. Added assigned Instagram JSON and Facebook userVanity/userID/initial-route handling. Source remains memory-only. This is not a guarantee for all site markup.
- Empty fields use fictional gray placeholder examples plus persistent labels. Saved findings / Tasks / Changes clarifies deliberate local records. Capture history builds a complete replacement before publishing it, preserving selection/focus without transient missing groups.

All prior capture/clipboard/manual redaction/privacy protections remain. Five extractors; X search only. Preserve originals/tiles, manual red arrows/circles/black redactions, selected derivatives, frozen destinations, logical case/history deletion, guarded late writes and private binary backup/restore. No automatic identity/threat inference or automatic redaction. Full-page bounds and nested-scroller/custom-root limitations remain.

## Verification

178 Node tests, 105 unique rendered groups (capture21, toolbar24, case18, stabilization10, case clipboard7, shared workspace9, image tools16) and 10 real Chromium service-worker groups passed. Image-tool16 also passed at2× device scale. Fixtures use real DOM/canvas/PNG/clipboard/IndexedDB and controlled Chrome API doubles. Source reading in the toolbar uses separate hydrated/source doubles; no native scripting permission claim.

One authorized anonymous Instagram source read returned HTTP200 and an exact string ID via matched route parsing. Raw HTML was removed; no real account ID/source enters public fixtures. No multi-platform reliability rate or signed-in Edge success is claimed. Visually inspected desktop/narrow workspace and current-profile popup.

Native installed-extension acceptance: BLOCKED BY MANAGED POLICY. `/etc/chromium/policies/managed/extensions.json` blocks unpacked extensions. Preflight exits2 with zero native groups. Keep policy/sandbox/TLS intact; no repeated bypass attempts. Native Edge invocation, signed-in page access, OS paste/save/print, browser zoom and screen readers remain unverified. The local checklist is in LOCAL-ACCEPTANCE.md.

Fresh evidence: `docs/evidence/1.8.11`; full ignored artifacts: `/workspace/Gather/artifacts/validation-1.8.11`. See TESTING.md, SEARCH-AND-LOOKUP-1.8.11.md and the versioned delivery/package receipts for exact package gates and immutable download commits. Earlier release evidence remains dated.

## Release preservation and update

Interrupted working-tree checkpoint: `/workspace/Gather/checkpoints/gather-1.8.11-interrupted` (patch, changed/untracked source ZIP, base commit). Runnable/development ZIPs and SHA256 are in `releases/1.8.11/`; preserve1.8.10. Install/update by replacing all files in the same installed directory then Reload, without uninstalling or clearing storage. Reload releases ephemeral session values. Private backups include original/unredacted images and are unencrypted.

Query-free legacy records use the existing schema number but older validators may reject them. Roll back only in a separate clean browser profile using1.8.10 and its matching pre-update backup, not by downgrading the current profile in place.

## Next work: separate hardening stage

The latest attached completion note requests publishing/checkpointing1.8.11 before any hardening release. Finish and verify that gate first; do not silently mutate its package. Then inventory data flows, threats, legal-review questions, credentials/source minimization, storage access, message validation, import/XSS/export/clipboard/deletion, package/repository privacy and permissions. Prioritize concrete defects. No legal-compliance/security certification, no invented retention period, no custom weak crypto, no new cloud case storage, no automatic upload. Use the next patch version if shipping further code. Severe findings require explicit documentation and any destructive external remediation needs separate authorization.

Retained product backlog: selected-result save, generic local Quick Parts/reference packs, confirmed-identifier scan carry-forward and field provenance. They are not shipped here. Query recipes must preserve launch-only privacy. Actual organization content stays separate/private. No AI dependency, direct email sending, passive browsing collection or identity inference.

## Commands

From `/workspace/Gather/gather`: `node --test tests/*.test.mjs`, browser suites listed in TESTING.md, and `python3 scripts/package.py --out ../releases/<version>`. Supplied Playwright requires `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`; Chromium `/usr/lib/chromium/chromium`, sandbox on. No install script needed. Cloud setup is a separately saved draft; publishing it is a user action, not evidence of a restored environment.
