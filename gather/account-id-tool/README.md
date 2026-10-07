# Gather 1.8.0 — development build

Gather is a local browser extension for fast account lookup, deliberate research and screenshot capture. Quick Lookup remains project-free. The R3 update adds reviewed Case Start, role IDs, private session context, search coverage and guarded closure to the preserved 1.7.0 capture build.

## Install or update

1. Extract `Gather-1.8.0-extension.zip` to a permanent folder.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, select **Load unpacked**, and choose the extracted **account-id-tool** directory containing `manifest.json`.
3. Pin Gather. Open a supported profile → Gather → inspect/copy. Chrome 116+ or compatible Edge is required.

Before updating an existing installation, back up all work and preserve its source folder. Finish captures and close Gather pages. Replace files **at the same installed directory path**, then Reload the extension. Do not uninstall or clear browser storage. There are no additional permissions over 1.7.0; updating from 1.6.x adds Downloads for exports. Native browser acceptance remains outstanding; this is a development build.

## Case workflow

Open Workspace → **Case Start…**. Give the project a public-safe title, paste intake, and review the locally extracted fields. Edit values and uncheck unwanted fields. Contacts and unknown lines default to excluded. SOC is a configurable role label; Gather does not expand it or infer identity. Same-named subjects remain separate records.

- **Ephemeral Case** (default): approved friendly names and seed values stay in browser session storage. Raw pasted text is cleared from the dialog after confirmation/cancellation. Browser restart, extension reload/update/disable clears session values. Durable roles, approved seed tokens, findings and images remain. Use **Resume seed values** to supply approved values again.
- **Local Case**: approved names/seed values remain on this device until removal. They are never synchronized. Raw intake still is not retained.
- Existing projects remain local projects. They are not silently converted to ephemeral cases.

Choose a role once in **Active context**; the selection is reused for that scan. Use role chips, **Launch next search**, or expand **Scan queue** to edit/launch/skip/review queries. Coverage records launched work and explicit negative results. “Searched — no reliable match” and “Gone” mean different things. Search queues carry seed and scan references; ephemeral manual searches and drafts also use session values with durable tokens.

Gather binds searches before navigation. Only a browser-provided opener relationship carries context to related tabs; missing relationships are not guessed from URLs or timing. Inspect the destination beside Save/Capture and use Assign/Detach explicitly. Switching the global destination cannot redirect an already started capture. Tab context is research organization, not proof of discovery.

Save accounts/sources deliberately. **Associate / reject finding** records a candidate, confirmed or rejected relationship and your supporting reason. A similar name never associates an account automatically. **Copy role account block** and **Copy coverage summary** show a preview before copying.

Right-click selected text → **Case Start from selected text…** previews only that selection. Whole-page intake reading, broad intake-system connections and passive collection are not implemented.

## Account outcomes

Available/usable accounts appear first; unresolved technical results have their own review group; supported confirmed gone profiles appear last under **Accounts no longer available**, without an empty current-ID field. IDs-only output preserves exact strings and omits gone accounts without placeholders. Historical IDs/aliases remain in saved account observations. **Search former alias…** is editable and launches only on your click.

Gone detection is intentionally narrow: this build supports YouTube's exact structured “This channel does not exist.” error alert on the matching profile. Other missing-ID, authentication, network, changed-markup or ambiguous cases stay unresolved. The five ID extractors remain Instagram, Facebook, Threads, TikTok and YouTube; X launches searches only. No live-platform success claim is made.

## Capture and evidence

Invoke Gather's toolbar on the source page, expand **Capture this page**, and choose visible, selected rectangle or bounded full page. Capture controls load only when expanded. A side panel alone does not grant `activeTab`; use the toolbar if access is unavailable.

Images are saved in IndexedDB with immutable originals/tiles, source URL/title, timestamps/timezone, dimensions/scale/coordinates, frozen project/scan/role, status/limitations and SHA-256. Selected rectangle crops an acquired viewport. Full page scrolls/stitches the top-level document, restores temporary changes and labels bounded/interrupted output partial. Keep the source tab selected.

**Save metadata only** stores URL/title/time and role filing without taking an image. Findings and captures receive stable Evidence IDs. Newly captured images start **unreviewed and not included**; deliberately enable inclusion for reports/review sheets. Legacy captures retain their previous inclusion behavior.

**Crop / redact / caption** creates a derivative; originals remain unchanged. Default exports use the selected derivative. An expected missing crop/redaction never falls back silently to unredacted pixels. **Review evidence sheet** previews included captures, source metadata and an Evidence-ID/numbered-sheet crosswalk, and exports a portable HTML review sheet. Browser Print / Save PDF is available; printer pagination may differ. Sheets are bounded to 40 captures / 64 MiB of selected images.

## Export, backup and Close Case

**Saved in Gather** and **Exported to folder** are separate states. Enable automatic export under Captures → Folder export and storage. Failed export leaves the image saved and offers Retry.

Downloads use subfolders relative to the browser's Downloads directory:

`Gather/Project--<ID>/<Role-ID>--<Subject-ID>/Scan--<ID>/Captures/`

Unassigned/Inbox are available. Filenames contain UTC capture time, source host, mode and a short capture ID. Stable UUID bits are retained in folder paths; Windows reserved names and lengths are bounded. Downloads use `uniquify`, never silent overwrite. Role/ID paths replace friendly-name paths from 1.7.0. This API cannot write arbitrary absolute paths.

**Export report** and **Export this scan’s captures** use the selected scan's inclusion/review choices. **Back up all work** writes a binary `.gather` backup containing original images, derivatives, subjects, relationships and legacy batches. It is **private and unencrypted**, not a shareable redacted export. Restore checks hashes/references before merging; conflicting IDs and relationships are remapped. Old JSON backups remain importable, without invented images.

**Close Case… → Export private backup + Remove** requires the displayed project title. It waits for the private project backup download to complete, then logically removes that project's workspace records, images, roles, session values, search drafts and associated recent batches. If the workspace or binary records changed after the snapshot, removal stops and requires a fresh backup. Failed downloads retain the project. Cross-project references and pending captures/restores can block closure until reviewed. Other projects remain intact.

Downloaded files, browser history, clipboard contents and legacy conflicting-settings archives are not erased. Closure reports remaining archive counts. Gather does not promise forensic secure deletion.

## Privacy boundaries and limitations

- Ephemeral mode protects intake-derived context; it does **not** anonymize deliberately saved URLs, titles, notes, public names or screenshot pixels. Public-safe project titles are your choice. Browser search history is outside Gather.
- **Hide / show friendly labels** masks role labels and resolved queue previews. It is not a complete screen-share privacy filter: source content, images, project titles and URLs can still contain names. Review exports before sharing.
- Private backups include unredacted originals and the whole original viewport behind a crop. Hashes establish byte integrity, not authenticity, identity or authorship. No automatic identity, affiliation or threat decisions are made.
- Metadata: 4 MiB workspace. Images: 512 MiB total, 192 MiB/capture, 64 MiB/asset, 20,000 capture records. Browser quota may be lower. Keep backups; clearing browser data can remove local work.
- Full page: 24 tiles, 48 million output pixels, 24,000 CSS pixels high and 60 seconds acquisition. Nested scrollers, pinch zoom and complete infinite-feed archival are unsupported. Lazy/dynamic pages may produce partial output.
- Native Chrome/Edge extension acceptance is blocked in this runner by administrator policy. Rendered-browser tests use actual DOM/canvas/IndexedDB with extension API doubles. Native Downloads, activeTab grants, worker/browser lifecycle and live adapters remain unverified.
- Custom folders, scrolling-element capture, full Gather Bar, automatic privacy scrubbing, general annotation graphics, organization packs and encrypted resume capsules are deferred.

## Rollback

Preserve a **pre-update backup made by the older version**, its source, and a current 1.8.0 `.gather` backup. To roll back, use a separate clean Chrome/Edge profile, load the preserved older build, and restore the backup made by that version. Keep the current profile until recovery is verified. Do not ask 1.7.0 or earlier to rewrite 1.8.0 case/account-state data; a code rollback is not a data-format downgrade. The 1.7.0 checkpoint and its ZIPs remain available alongside this delivery.

## Development

No bundler, hosted service or runtime package install is required. From this development package directory:

```sh
node --test tests/*.test.mjs
python3 scripts/package.py
```

Node 24 and Python 3 are used here. Browser journeys additionally use Playwright and sandboxed Chromium. See `../docs/TESTING.md`, `../docs/BUILD-NOTES.md` and `../docs/NEXT-RUN-HANDOFF.md` for exact evidence and the narrow next milestone.
