# Reverse-image provider capabilities — 1.8.17 RC

Gather selects an image locally first: paste an image with Ctrl+V, or choose/drop a file in Research → Reverse image, or open Reverse image search from a screenshot/source-image inspector. Preview, Change and Remove affect memory only. Local files are not automatically filed. Stored assets are rechecked before copy; deleted/stale derivatives cannot fall back to originals.

**Copy & open search** copies the selected image (PNG clipboard format) and opens the provider's public landing page. The analyst then pastes/uploads on that site. **Upload options** provides Save selected image and Open provider without copying. No submission is claimed until the analyst performs it; Gather neither scrapes results nor decides relevance. No private upload APIs, hidden multipart requests or background source-URL submission.

| Provider | Live check on October 13, 2026 | Analyst handoff verified |
|---|---|---|
| Google Lens | Landing accessible; upload reached unusual-traffic check | Normal file input accepted the fictional image; results blocked. No bypass. |
| Yandex Images | Landing and results accessible | Gather Copy & open → Image search → Ctrl+V returned similar-image results. |
| TinEye | Landing and results accessible | Normal file upload of the same selected fictional image returned results. |
| Lenso.ai | HTTP 403 challenge | Not verified. |
| Bing Visual Search | Redirected to Microsoft Explore visual search | Landing only; submission unverified. |
| Baidu Images | HTTP 200 | Landing only; submission unverified. |
| Sogou Images | HTTP 200 | Landing only; submission unverified. |
| Shutterstock | HTTP 403 | Not verified; access/entitlement may vary. |

Only a generated 240×160 blue-triangle PNG was used. Landing reachability is separate from submission, result accuracy and entitlement. Native fixture tests verify exact selected pixels and navigation; provider responses in those tests are fictional. Live provider checks above were separate and no later changes affected handoff code.

All providers use explicit analyst paste/upload; Gather implements no silent image upload or automatic source-URL submission. Provider guidance appears beside the chosen provider. Local file names, Case/SOC names, Reference and notes are not attached to provider navigation. A deliberate paste/upload discloses that image to the chosen provider. The clipboard is outside Gather storage. Animated originals remain unchanged; the clipboard uses a decoded still frame.

Primary documentation: [Google image search](https://support.google.com/websearch/answer/1325808?hl=en), [Yandex uploaded/clipboard images](https://yandex.com/support/images/en/loaded-image). Access and UI can change by region/session. No anti-abuse checks were bypassed.
