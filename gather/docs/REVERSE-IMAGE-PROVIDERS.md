# Reverse-image provider capabilities — 1.8.16 RC

Gather selects an image locally first: choose/drop a file in Research → Reverse image, or open Reverse image search from a screenshot/source-image inspector. Preview, Change and Remove affect memory only. Local files are not automatically filed. Stored assets are rechecked before copy; deleted/stale derivatives cannot fall back to originals.

**Copy & open search** copies the selected image (PNG clipboard format) and opens the provider's public landing page. The analyst then pastes/uploads on that site. **Upload options** provides Save selected image and Open provider without copying. No submission is claimed until the analyst performs it; Gather neither scrapes results nor decides relevance. No private upload APIs, hidden multipart requests or background source-URL submission.

| Provider | Public landing check on Oct 9, 2026 | Supported automatic URL/byte handoff implemented | Analyst's next step / limitation |
|---|---|---|---|
| Google Lens | HTTP 200 | None | Open the image-search control, then paste where offered or upload. Official Google help documents its upload/paste/search flow. |
| Lenso.ai | HTTP 200 | None | Use its own upload control. Prior environment check returned 403; access varies. |
| Bing Visual Search | HTTP 403 | None | Open Visual Search and paste/upload if accessible. Prior run redirected to Microsoft Explore. This environment cannot verify submission. |
| Yandex Images | HTTP 200 | None | Open image search and paste/upload using its available controls. Regional/account restrictions can apply. |
| Baidu Images | HTTP 200 | None | Use image-search upload controls; availability and language vary. |
| Sogou Images | HTTP 200 | None | Use its image-search upload control where available. |
| TinEye | HTTP 200, JS application | None | Paste/upload through its page. A public URL API was not established, so Gather does not invent one. |
| Shutterstock | HTTP 403 | None | Stock-image landing page; image-search availability/sign-in/subscription varies. Not verified as a completed reverse-search workflow here. |

HTTP success verifies a reachable landing page, **not** a working image submission, search result, entitlement or provider accuracy. Provider changes and regional blocks are external limitations. These checks sent no images or case data. Native Edge controlled tests verify local image selection, exact selected-asset copying, provider selection and explicit navigation; provider responses there are fictional fixtures, separately labeled.

No provider receives Case/SOC, Reference, notes, local filenames or saved image metadata from Gather. A deliberate paste/upload on an external website discloses that image to the provider; the OS clipboard is outside Gather's local-store boundary. Animated images remain original in storage; clipboard conversion is a decoded still frame.
