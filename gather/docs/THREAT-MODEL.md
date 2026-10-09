# Gather threat model

Scope: installed MV3 extension, local profile, worker/pages/injected helpers, explicit platform queries, image processing, import/export and public release pipeline. Baseline inspected before 1.8.12 edits. Assets include intake, identities, account links/IDs, findings, original/redacted pixels, drafts, organizational language and credentials belonging to the browser (which Gather must not collect).

| Actor / boundary | Scenario | Controls to preserve or improve | Residual |
|---|---|---|---|
| Hostile visited page → injected helper → extension | Crafted JSON/HTML, fake IDs, extreme data or navigation during read | Conservative matching; no page-code evaluation; size/time/depth bounds; minimal result; current-document targeting; validate results | A site can lie about its own data; ID/hash is not authenticity or identity proof. |
| Website/other extension → worker | Forged privileged message | Exact extension ID + page URL allowlist, no external listener, operation validation; add bounded message envelope | Compromised trusted extension code has extension privileges. |
| Injected helper → storage | Reading workspace/session | TRUSTED_CONTEXTS at startup; no whole-case data in page arguments | Assumed renderer compromise still requires minimizing returned/sent data. |
| Accidental sharing | Original copied instead of redacted derivative; backup mistaken for safe report | Selected-asset checks, missing-asset failure; clear originals/clipboard/unencrypted backup wording | User may deliberately copy original; external app/clipboard may retain it. No automatic redaction. |
| Stale tab / async writer | Deleted data resurrects, capture switches destination | Frozen destination, locks, epochs/tombstones, revision checks, atomic IndexedDB transactions, recovery journal | OS/download/browser copies unaffected. |
| Malicious imported file | Oversized image/container, unsafe text or forged relationships | Structured validators, bounded assets, hash/size/reference checks; textContent, protocol allowlist, strict CSP | No independent adversarial penetration test; parser complexity must remain bounded. |
| Developer mistake / supply chain | Credentials, real case dump or private pack enters source/ZIP; changed parser bundle diverges | Fictional fixtures; reviewed public artifacts; package guard; reproducible generated local parser; pinned runtime package hashes | Pattern scanner cannot detect arbitrary names or sensitive screenshots. Public history needs separate review. |
| Lost/shared/compromised computer | Profile, clipboard or backups copied | Organization-controlled disk encryption, accounts, endpoint policy; clearly describe local storage | Gather does not provide a vault, user authentication or forensic erasure. |
| Search/platform provider | Queries or image manually uploaded to external service retained | User-invoked tabs only; no query retention or automatic uploads; disclose provider boundary | Provider terms/logs/history and browser account sync are outside Gather. |

Non-goals: evading login, CAPTCHA, access controls or platform restrictions; automated identity/relationship/threat conclusions; cloud case storage; absolute security/legal guarantees. No attack or actual data exposure was established by this review. Record reproducible evidence before escalating a suspected vulnerability.
