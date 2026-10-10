# Network boundaries — Gather 1.8.16 RC

Reviewed October 9, 2026 (America/Los_Angeles). This is an inventory of extension code, not a claim that the browser, OS, selected websites or clipboard managers are offline. Gather has no case server, work-data sync, analytics or remote AI dependency. The public source repository does not receive local work.

| Trigger / path | Destination and data | Credentials | Action and private-data boundary |
|---|---|---|---|
| Open Gather on a supported account/content page; explicit pasted lookup (`resolver.js`) | Normalized supported platform URL. Anonymous HTML GET; ID parsed locally. Redirect response must still match the requested account/content. | `credentials: omit`; no cache. | User-requested lookup, including automatic current-page lookup when the popup opens. No Case/SOC, notes, Reference or images in request. The account URL is intentionally disclosed to its platform. |
| Missing current-page metadata (`profile-read-client.js`, packaged `profile-reader.js`) | Same document/source URL on the current platform. Bounded HTML held only in page memory; only small structured results return. | Normal same-origin browser session. | Explicit lookup; retains the conditional two-second Instagram readiness limit. Does not automate sign-in or bypass challenges. |
| Enabled browser fallback | Opens the exact supported platform URL in a temporary browser tab; normal platform subresources may load. | Browser's normal session. | An explicit lookup with fallback enabled. Closes only its own tab. Websites can log this visit. |
| Search the web (`workspace-store.js`) | Chosen provider URL with the analyst's query. | Normal navigation/session. | Explicit Search only. Query is not retained in Gather. The browser/provider may retain it. Case/SOC context remains local IDs in session storage. |
| Save source image (`source-image.js`) | Exact browser context-menu `srcUrl`, including its original query. No URL guessing or background candidate requests. | `credentials: omit`, `referrerPolicy: no-referrer`, `redirect: error`, `cache: no-store`. | Explicit context-menu action. Image host receives its URL, not case fields. Existing host permission/activeTab or server CORS must permit access; blocked, expired, redirected or unsupported sources fail visibly. No screenshot substitution. |
| Select a reverse-search image (`reverse-image.js`) | **None.** Local File/Blob decode or local verified capture asset. | None. | Memory-only preview, no automatic case save and no query/image-search history. |
| Copy & open search | Provider landing URL only. The chosen image is copied locally as PNG for clipboard compatibility. | Normal provider navigation/session. | Explicit button. No upload request or source URL, case label, image bytes, notes or Reference sent by Gather. Analyst pastes/uploads on the provider's website. The fallback opens the provider without copying. |
| Reference import/search/preview/copy | **None.** Separate extension-origin IndexedDB and in-memory index. | None. | Local folder or inspectable JSON selected by the analyst. Markdown rendered as inert text; remote images/HTML/scripts are not loaded. |
| Screenshot decoding, image viewer/editor | `data:`/`blob:` local URLs, canvas. | None. | No remote destination. Original and selected derivative retained as binary assets. |
| Save image/report/backup/Reference collection | Local Blob passed to browser downloads API. | None. | Explicit download, or deliberately enabled folder export. Creates a separate file outside Gather. No arbitrary absolute-path access. |
| Help and packaged resources | Extension origin only. | None. | Local CSS/JS/help. External help/repository links navigate only when clicked. |

## Permissions and trust boundaries

Manifest permissions are unchanged from 1.8.15: `activeTab`, `scripting`, `storage`, `clipboardWrite`, `sidePanel`, `contextMenus`, `downloads`, and six existing host patterns for the five supported platforms. There is no `tabs`, `history`, `cookies`, `clipboardRead`, `webRequest`, `debugger`, all-URLs permission, external messaging API or remote executable code.

Local/session storage is restricted to trusted extension contexts on each worker start. Message handlers check sender/page allowlists; adding a UI does not grant it unrelated worker actions. Lookup/source scripts receive no case database. IndexedDB is scoped to the extension within a browser profile. CSP remains `script-src 'self'; object-src 'none'; base-uri 'none'`.

Network canary checks use fictional private Case/SOC/note values and inspect intercepted native Edge requests, including headers/body. This is repeatable controlled evidence, not a packet capture of every real platform. Two independent native Edge profiles test work-data isolation. Windows/OS account access, endpoint backups, browser profile sync settings outside Gather, clipboard synchronization and a compromised device remain outside these guarantees.

## Primary documentation consulted

- [Chrome cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests): host permissions apply to extension requests; activeTab is temporary, not global image access.
- [Chrome activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab): invocation, scope and revocation. No permission workaround was added.
- [Google search operators](https://support.google.com/websearch/answer/2466433?hl=en) and [Bing search options](https://support.microsoft.com/en-us/topic/advanced-search-options-b92e25f1-0085-4271-bdf9-14aaea720930): completion is static and provider-aware.
- [Google image search](https://support.google.com/websearch/answer/1325808?hl=en): provider-owned upload/paste flow. No private upload endpoints used.

See [provider capabilities](REVERSE-IMAGE-PROVIDERS.md), [storage and deletion](PRIVACY-DATA-FLOW.md), and [validation](TESTING.md).
