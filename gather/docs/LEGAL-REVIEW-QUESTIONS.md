# Legal and deployment review questions

Engineering review, 2026-10-08; not legal advice or a compliance certification. Publicly viewable data, fictional labels and local storage do not automatically remove privacy obligations. No jurisdiction, school relationship, contract, student age or lawful authority is assumed.

| Topic for organization/counsel | Questions to resolve | Current product fact |
|---|---|---|
| Authority and educational records | Who authorizes each investigation? Is the organization a school official/contractor under FERPA, under direct control, with legitimate educational interest and permitted redisclosure? What agreements and notices apply? | Explicit analyst workflows; no automated risk/identity decisions. Saved links and screenshots can still be student records. |
| US law | Which federal/state student privacy, minors, consumer privacy, records and breach laws apply? Are consent or emergency exceptions relevant to this particular use? | No software declaration of lawful basis. |
| Canada / BC | Do PIPEDA, BC PIPA, BC FIPPA or other provincial public-sector/education rules apply? Who is controller/custodian/service provider? What safeguards, assessments, contracts and notices are required? | Local-first does not decide applicability. Endpoint backups, clipboard sync and external providers may cross borders. |
| Purpose, proportionality, youth | What fields and screenshots are necessary? Who may view them? How are accuracy, access/correction and sensitive youth-related inferences governed? | No identity merging, threat scoring, facial recognition or behavioral inference. Manual redaction only. |
| Retention, holds and deletion | What schedule/legal holds apply to each case, image and export? Who confirms removal from Downloads, backups and external recipients? | Manual logical deletion; session fields expire on restart, retained findings do not. No forensic-erasure promise. |
| Platforms and images | Do platform terms permit the requested lookup/capture/use? Is signed-in material permitted for this analyst and purpose? What copyright/licensing rules apply to reports/reference packs? | No login/CAPTCHA bypass; normal user session and explicit lookup. Provider terms can change. |
| External searches | Which providers are approved? Are queries/image uploads allowed to identify a student/client? Are cross-border transfers documented? | Gather opens provider tabs; does not upload images or retain query text. Browser/provider history remains. |
| Deployment / store publication | Are privacy disclosures, consent, enterprise controls, at-rest protection and distribution requirements satisfied? Who owns updates/incidents? | Unpacked development delivery; no claim of Chrome Web Store approval or store-policy compliance. Storage/backups are not application-encrypted. |

## Primary material consulted

Retrieved 2026-10-08; relevant text read, not just search snippets:

- [US Department of Education: school official under FERPA](https://studentprivacy.ed.gov/faq/who-school-official-under-ferpa): outsourcing requires institutional function, direct control, permitted purpose/redisclosure and annual-notice criteria. Counsel must apply these facts.
- [OPC: PIPEDA fair information principles](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/): identified purposes, limiting collection/use/retention, accuracy and proportionate safeguards.
- [FTC: Start with Security](https://www.ftc.gov/business-guidance/resources/start-security-guide-business): know what is stored, keep only needed data, limit access, use fictional development data and plan incident response.
- [Chrome user privacy](https://developer.chrome.com/docs/extensions/develop/security-privacy/user-privacy), [security](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure), [messaging](https://developer.chrome.com/docs/extensions/develop/concepts/messaging), [storage](https://developer.chrome.com/docs/extensions/reference/api/storage), [Web Store user-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq). The FAQ's transmission/at-rest requirements need distribution-specific review before store submission; local unencrypted storage is not a compliance claim.

NIST Privacy Framework and OWASP browser-extension guidance returned HTTP 403; BC FOIPPA manual returned HTTP 503 in this environment. They were not reviewed as current evidence. Obtain authoritative current legislation/guidance through an approved channel for the actual deployment. No security or access restrictions were bypassed.
