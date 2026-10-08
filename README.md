# Gather

A local browser extension for fast account lookup, deliberate research and screenshot capture.

**Open a profile → Gather → inspect or copy.** A project is optional. For longer work, resume a scan, search, save findings deliberately, review and export.

## Get the current build

**[Download Gather 1.8.7](https://raw.githubusercontent.com/roedoeroe/Gather/dbbb6bc329387287377b3020519a5a96e2b8f50f/releases/1.8.7/Gather-1.8.7-extension.zip)** · Development build for Chrome and Edge

[Source/test package](releases/1.8.7/Gather-1.8.7-development.zip) · [SHA-256 checksums](releases/1.8.7/Gather-1.8.7-SHA256SUMS.txt) · [Delivery notes](releases/1.8.7/Gather-1.8.7-DELIVERY.md)

Choose `Gather-1.8.7-extension.zip`, extract it to a permanent folder, and load its **account-id-tool** directory from your browser's Extensions page with Developer mode enabled. For an update, replace all files at the same installed path and Reload; do not uninstall or clear storage. See the [installation and rollback guide](gather/README.md#install-or-update).

The development source is maintained on **develop/1.8.0-r3**; the branch name is historical, while the current extension version is **1.8.7**. Delivery notes pin release ZIPs to their source/package commit. Main is unchanged.

1.8.7 fixes case clipboard previews: Candidate/Confirmed decisions and observation dates remain visible, relevant changes/deletion clear stale text, global destination switches preserve the original scope, and Copy errors appear in the dialog with manual recovery. It retains the capture/export/privacy fixes; no new features or permissions.

## Capture directly from the toolbar

Choose **Select area & copy** to drag directly on the page, save locally and copy the image. **Full page**, **Visible area**, and **Select area** remain direct actions with a visible destination. Saved images offer PNG/JPEG save, Print / Save PDF, editing and history grouped by case/scan. The side panel is optional.

**Research · Captures · Case · Settings** separates daily work from management. New cases can start without intake. The side panel is optional.

## Local by design

Cases, findings, captures and lookup history stay in the browser on your computer. Gather has no case server, cloud sync or analytics. Searches and profile lookups contact the services you choose. Exports create separate files.

Workspace → **Settings → Data & Privacy** offers red **Delete case…** and **Clear recent lookup history…** controls. Case deletion requires its name and offers an optional backup. Clearing recent lookups preserves saved cases and images. Capture history also offers red individual/selected-capture deletion with confirmation. Browser history, clipboard and downloaded files are outside those controls.

## Verification

The 1.8.7 release passed **132 automated tests**, **85 rendered-browser scenario groups** and **10 real service-worker groups**. Browser journeys use controlled Chrome API doubles. Native installed-extension testing is blocked by this runner's administrator policy; live-platform reliability remains unverified. Use the [local Chrome/Edge checklist](gather/docs/LOCAL-ACCEPTANCE.md) before relying on native behavior.

## Continue development

- [Product guide and limitations](gather/README.md)
- [Cloud setup dialog: what to click](gather/docs/ENVIRONMENT-SETUP.md#the-setup-dialog)
- [Test evidence and commands](gather/docs/TESTING.md)
- [Next-run handoff](gather/docs/NEXT-RUN-HANDOFF.md)
- [Goals audit: original workflow, later requests and remaining work](gather/docs/GOALS-AUDIT.md)
- [Product direction](gather/docs/PRODUCT-DIRECTION.md)
- [Proposed Quick Parts / Reference Library](gather/docs/QUICK-PARTS-DIRECTION.md) — local search and reviewed composition; **not included in 1.8.7**

The extension has no runtime dependencies, bundler or server. From `gather`, run `node --test tests/*.test.mjs` and `python3 scripts/package.py`. Browser validation setup is documented in the testing guide. Public fixtures contain invented data only.
