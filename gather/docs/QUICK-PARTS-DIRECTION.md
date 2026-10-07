# Quick Parts / Reference Library — proposed first implementation

Status: design/backlog after the 1.8.4 direct-capture stabilization release. The supplied Optimized Design Engineering Steer R3 was read as product guidance; it does not turn every phase into this release's scope. The first implementation remains generic and local, with fictional language. Real reference exports are not present; their availability does not block engine/interaction work. Verify source labels and conversion fidelity before calling imported material approved.

## Outcome and scope

Finish findings → **Client Communication** → type two or three words → preview useful language → add blocks → fill fields → review → copy. The same engine serves **Document Language**, including glossary definitions, report wording and technical explanations. A case is optional for searching either collection.

Build deterministic retrieval and temporary composition, without AI, email sending, OneNote runtime access, remote indexing or case uploads. Suggested means **“These may be useful.”** It never recommends a decision, certifies a conclusion or implies language was sent. No threat/risk interpretation drives ranking.

## Fit with the current product

| Existing component | Proposed integration |
| --- | --- |
| `workspace.html`, `case-ui.js` | Compact Client Communication action in the full workspace; shared library view can switch to Document Language. No new management controls in the lookup popup. A panel launcher can follow after the workspace slice works. |
| `workspace-client.js`, `workspace-store.js` | Read selected scope and current state through existing trusted messages. Add no reference content to the 4 MiB workspace JSON. |
| `case-model.js`, `account-state.js` | Consume recorded coverage and normalized account states for a small fixed set of ranking signals. No new identity or outcome inference. |
| `case-ui.js` clipboard preview | Reuse the deliberate preview/copy pattern and visual language, with a dedicated accessible reference dialog or workspace view. |
| `capture-store.js` | Reuse transaction/error-handling patterns, but create a separate reference database; do not put text packs in image storage. |
| `workspace-store.backup()` / `capture-backup.js` | Current backup collects all non-null `gather.*` local-storage keys and capture assets. Keep pack contents, reference preferences and temporary drafts outside these stores. Case backup/restore must not include or replace organization packs. |
| `scripts/package.py` | Development packaging currently includes nearly every source-tree file; Git ignore alone is insufficient to protect proprietary content. Keep source exports outside the checkout and add package-exclusion checks before implementing imports/conversion. Public builds contain only the generic engine and unmistakably fictional fixtures. |

Proposed modules: `reference-model.js` (validation/normalization), `reference-search.js` (pure ranking), `reference-store.js` (local import/update), `reference-ui.js` (shared search/preview/composition). Native ES modules, no backend or new permissions. Avoid adding these modules to the worker graph unless required; all worker dependencies must retain static imports.

## Interaction quality bar

Keep one primary task per view: search, preview, assemble, review. Open directly into focused search; retain the query and result position when returning from preview. Show a restrained empty state with import guidance when no pack exists, helpful query suggestions when no results match, and actionable errors without losing input. Never show fake suggestions to fill space.

Use progressive disclosure for source/version details and pack management while keeping approval/example badges and usage warnings visible. Share the existing typography, spacing, focus styles and button language. Keep results readable at narrow widths and long titles intact. Prefer familiar text controls over icon-only commands; no deep folder navigation, animated clutter or duplicated controls. A small complete workflow matters more than a dense feature panel.

## Local pack format and lifecycle

Begin with one UTF-8 JSON document, e.g. `.gatherpack.json`, with plain-text bodies. Transparent content makes inspection/version control possible without supporting executable templates, arbitrary HTML or remote assets. Markdown/source conversion is an authoring step, not a runtime dependency. Preserve list order, paragraph breaks and warnings; require human comparison with the source before distribution. Do not label an automatic conversion approved.

Provisional envelope:

```text
format: gather-reference-pack
schemaVersion: 1
packId, name, publisher, version, updatedAt
collections[]: { id, title }
entries[]:
  id, collectionId, title, aliases[]
  category, tags[], platforms[], workflowStages[], outcomes[]
  type: template | example | guidance
  approvalStatus: approved | proposed | unverified
  sourceLabel, body, placeholders[], usageNotes
  sourceReference: { document, section, revision, optionalUrl }
  version
```

IDs are stable within a namespaced pack and survive renames. Pack version and schema version are separate. `publisher`/`approvalStatus` are declarations from the imported pack, not authentication or approval by Gather. Preserve the exact original labels alongside normalized fields: **TEMPLATE** does not automatically mean approved; **POSS TEMPLATE** stays proposed; **EXAMPLE NOT TEMPLATE** stays example. Unknown labels default unverified. Usage warnings stay visible in preview and when a block is added.

Placeholder definitions include token, label, required flag and optional offer source. Use exact bracket tokens such as `[DATE]`, `[FREQUENCY]`, `[ROLE]`, `[CLIENT NAME]`, `[MISSING INFORMATION]`; no scripts or expressions. Preserve unfamiliar fields as unresolved instead of deleting them.

Use a separate `gather-reference-v1` IndexedDB database for installed packs, entries and non-case library preferences. Initial proposed bounds: 10 MiB per pack, 5,000 entries per pack, 64 KiB per body, 25 MiB total installed content. Measure against the real corpus before freezing limits. Reject oversized, duplicate-ID, invalid-reference and unsupported-schema packs before mutation.

Import shows publisher/version, collections/counts, declared approval classes and validation warnings. For the same pack ID, preview additions/changes/removals and explicitly replace the installed version in one transaction. Failed validation, quota failure or interruption retains the prior version. Never silently merge edited approved wording. Stable favorites survive updates; removed IDs are pruned. Active drafts retain their selected text/version snapshot and show an update notice without changing the draft. Explicit re-import of a prior local pack supports rollback; no online update checks.

Provide separate **Export organization pack**, **Remove pack…** and **Clear library recents** actions. Pack export includes pack text only, never case context, placeholder values, drafts or recents. Case deletion does not delete a reusable library. Pack removal releases its index/recents/favorites and offers to discard its blocks from any open draft. Removal is logical browser deletion, not forensic erasure. Sharing an organization pack is an explicit local-file action; it must never be included in a public source/development ZIP or ordinary case backup.

## Search and deterministic suggestions

Focus search immediately on opening. Offer shallow collection/category/platform filters and searchable tags; avoid nested folders. Category/tag examples from the request are a starting vocabulary only. Inspect real materials to derive a small taxonomy and alias list, preserving original source paths as references rather than folders. Snapchat and Discord can be library tags without adding account extractors.

Build an in-memory index once per installed version. Normalize case, whitespace and punctuation; tokenize and rank exact/prefix title and alias matches first, then tags/platform/category/stage/outcome, then body matches. Use explicit aliases for abbreviations and synonyms, e.g. `snap` → `Snapchat`; no embedding service. Deterministic ties use stable title/ID order. Match all query tokens across fields when possible; expose partial matches honestly. Examples/guidance remain searchable with prominent badges, not disguised as templates. Consider typo tolerance only if real corpus testing demonstrates a need.

A small Suggested section (up to three approved templates with supported mappings) uses only the displayed current scan and, where selected, explicitly associated subject context. Show a reason and scope next to each suggestion. Suggestions may boost relevant results but cannot hide exact search matches. With no recorded signal, show no case-based suggestion. Library search must still work without a case.

| Recorded state | Permitted signal | Boundary |
| --- | --- | --- |
| Coverage `Searched — no reliable match` | Boost mapped no-match/request-information parts; show the coverage family/scope. | One negative search is not proof of no accounts anywhere; never prefill “no accounts found.” |
| Saved account `PRIVATE_INACCESSIBLE`, or explicit matching coverage | Boost applicable private/inaccessible language. | Unknown/login/network failures are not inferred private states. |
| Saved account `GONE`, or explicit matching coverage | Boost unavailable-account language. | Preserve the specific observation/scope; do not infer every account is gone or the owner deleted it. |
| Explicit ongoing-scan configuration | Later: boost matching ongoing-scan blocks. | No schedule/frequency model currently exists. Do not infer one from a task, repeated searches or a queued scan. |

Pack data can declare mappings to an allowlisted set of signals; it cannot execute rules or inspect arbitrary case text. No suggestions inferred from age, alleged threat/weapons, student passing, names or identity guesses. Such material can remain manually searchable if present in the authorized library. “Young SOC” may be retrieved by curated aliases/tags; it is not an age-based automatic recommendation. Any optional QC/rules pack is a later design, not executable code accepted by this importer.

## Temporary composer and keyboard behavior

Preview first: title, approval/type badge, source/version, complete body and usage notes. Enter on a selected result opens preview; Add is an explicit action in that preview. Proposed/unverified templates require an acknowledgement before reuse. Examples default to reference viewing and have no ordinary Add-template action; a separate deliberate “Use example text” action keeps an example warning in the draft. Guidance is viewable/copyable explicitly, never silently combined with approved language.

Add blocks, remove or move them with keyboard-accessible Up/Down controls, and edit each block's text. Fill shared placeholders with explicit confirmation of which occurrences change. Then **Review draft** assembles an editable final text preview. Returning to blocks after editing the final text must warn before regenerating/discarding final edits; never silently overwrite them. Preserve original pack text and version metadata separately from user edits.

Offer known values with provenance, never silently insert them. Date must distinguish today's date from a capture/incident date. Role label may be offered from the selected role; client name/frequency/missing information require entry unless an exact confirmed field exists. Do not substitute a project name for a client name. Highlight unresolved tokens and block **Copy final draft** until required fields are filled or their text deliberately removed. Copy requires explicit review after any text change. No auto-copy on selecting a part and no “sent” status.

Draft text and filled values live only in the extension document's memory, not browser local/session storage, case backups, usage logs or the public repository. Show a clear discard-on-close message and confirm closing an edited draft. No crash recovery in this first slice. Freeze displayed case/scan context when composition begins; changing the workspace selection does not retarget it or refill values. Deleting that case clears its open drafts and rejects any late pending fill operation. Starting without a case remains supported.

Arrow keys navigate the result list while the search field remains usable; Enter previews, Escape closes the topmost preview/dialog and restores launcher focus. Handle Escape on edited drafts with the discard confirmation. Ctrl/Cmd+K focuses search only inside this library view, without overriding the browser shortcut elsewhere. Ctrl/Cmd+C retains standard selection-copy behavior; provide clear Copy controls for a selected part and the reviewed draft. Use labelled list/preview regions and announced result counts; test screen reader focus order, narrow layouts and keyboard-only composition.

Favorites may ship first as stable pack/entry IDs. Recents are optional after retrieval proves useful; if included, retain only bounded part IDs, never search terms, draft text, case IDs or filled values, and provide a clear action. Neither is necessary to ship the first working slice.

## Smallest implementation path

1. **Fictional contract, source audit in parallel:** establish the generic schema and retrieval examples with entirely invented wording. Availability of SST exports does not block engine/UX development. When local exports become available, identify headings/aliases/usage labels and verify reuse/approval distinctions before producing the real private pack. No SST text enters fixtures, screenshots, commits or source ZIPs.
2. **One usable vertical slice:** generic schema/validator + atomic local import/replace/remove + both collection views + focused weighted search + labelled preview + explicit part copy. No case required. Include pack isolation and backup/package exclusion tests from the beginning.
3. **Complete the proposed minimum workflow:** block assembly/reorder/edit, explicit placeholder offers, final review/copy and case-deletion draft clearing; add the three supported coverage/account suggestion signals and visible reasons. Ship only when the combined journey is reliable. Ongoing-scan suggestions, recents, typo tolerance and richer authoring can follow.

This is the next bounded product feature after the current release checkpoint and any discovered regressions, not a reason to delay the privacy release or launch a broad organization-pack framework. Use a future feature version (tentatively 1.9.0 after scope validation); do not rebuild or relabel the released ZIPs for this design-only change.

## Acceptance before shipping

Use invented language/data for all public automated tests. Private corpus testing remains local with separate evidence that does not expose content.

- `no accounts` and `snap username` retrieve the curated relevant entries without requiring exact page titles. Title/alias/body/platform/stage/outcome matches, filters and deterministic ties are tested.
- With 5,000 fictional entries, warm query-to-render p95 target is under 100 ms on a documented reference machine; first searchable open target under 500 ms after loading local content. These are targets, not measured claims. Search continues offline after import.
- Coverage/account fixtures yield scoped “may be useful” reasons; unknown states, no case, another scan's state and threat-related text do not invent suggestions or populate a conclusion. Ongoing work has no trigger until recorded explicitly.
- Templates/proposals/examples/guidance remain visibly distinct through preview and composition. Keyboard-only add/reorder/edit/fill/review/copy works. Unresolved required tokens block final copy; source text is unchanged.
- Switching to Southridge during a Northbridge draft never changes its scope or values. Delete Northbridge clears the relevant open draft; delayed fill/copy preparation cannot resurrect it. Closing discards draft memory; restoring a case backup does not import it.
- Invalid/update-interrupted/quota-failed packs leave the installed version intact. Renames keep IDs/favorites; removed entries don't leave stale results. Mid-draft updates don't replace selected text.
- Case backups contain zero library bodies/preferences/drafts; pack exports contain zero case data; public development ZIPs contain no proprietary source content. No network request occurs during import/search/ranking/composition. Explicit source-link opening remains user initiated.


## R3 engineering and release gate (2026-10-07)

Finish and checkpoint the current capture release first. Before adding Reference Library, verify the toolbar popup, Run on this page, five adapters using controlled fixtures, exact-string copy, search-origin filing, capture cancellation/export retry, deletion/history races and binary backup/restore. Native and live-profile checks remain separate evidence; a blocked native runner must not be reported as a pass. The 1.8.4 current-page fixes address false blanket sign-in advice, substituted reads and input clearing on technical failures.

Treat imported packs as untrusted plain-text data. Reject prototype-related keys, duplicate IDs across relevant namespaces, invalid collection references, unsupported signal mappings and pathological sizes before any write. Count UTF-8 bytes, validate bounded arrays/string lengths and normalize a complete immutable candidate. Render with textContent, never template HTML or evaluated expressions. Source links allow explicitly activated HTTP(S) only, with their actual host visible. Unknown metadata cannot acquire code/rule behavior. All import/update/remove operations use atomic IndexedDB transactions and a stable installation generation so overlapping pages cannot restore an obsolete index. Interrupted updates retain the last valid pack.

A saved pack's names/publisher/approval labels are declarations, not verified authority. Preserve original wording, original labels, source reference and version. Stable pack/entry IDs distinguish renames from replacement. Proposals, examples and guidance remain unmistakable in results, preview and any deliberate reuse; unknown labels default to unverified. Organization pack data stays outside workspace JSON, capture assets, case backups and lookup archives. Test backup isolation and packaging exclusion from the first slice; Git ignore alone cannot protect development ZIPs.

Keep the first view calm: one focused search box, two collection choices, a flat list and readable preview; lightweight filters are secondary. Suggested appears only when deterministic recorded signals have a meaningful scoped explanation. All query tokens may match across title/alias/tags/body rather than requiring one exact OneNote heading. Exact matches must not disappear below suggestion boosts. Support stable keyboard selection, Escape/focus restoration, announced counts, narrow widths, long bodies and offline use. Use measured warm/open latency against a named fixture and machine, not a claim of instant performance without evidence.

The first feature checkpoint is import → search → preview → deliberate part copy in both collections, with replacement/removal, provenance and empty/error states complete. Do not ship a broad framework of placeholders that do not work. Then finish add/reorder/edit → explicit fills → review → final copy, including unresolved-field guards, original block snapshots and no regeneration over user edits. Drafts live in document memory. Freeze their context, invalidate pending operations when a case is deleted, keep pack updates from silently rewriting draft text and require deliberate discard. Favorites/recents and suggestion expansion follow demonstrated retrieval quality. No AI, sending, remote index or OneNote runtime dependency is required.
