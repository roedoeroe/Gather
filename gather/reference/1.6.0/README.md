# Gather 1.6 — development build

Gather now combines quick account lookup with a persistent research workspace. This is a local development package, not a store release. The automated logic, persistence and structural checks pass; real-browser UI testing remains outstanding in this build environment.

## Open the build

1. Extract this ZIP into a permanent folder.
2. In Chrome, open `chrome://extensions` (Edge: `edge://extensions`). Enable **Developer mode**.
3. Select **Load unpacked** and choose the **account-id-tool** folder inside this package. It contains `manifest.json`.
4. Pin Gather. Click its toolbar icon for quick lookup; choose **Workspace** or **Side panel** for ongoing research.

Chrome 116 or newer is required. Edge compatibility is expected from its Chromium APIs but has not been tested here. Safari, Firefox and mobile are not part of this build.

For an existing **unpacked** Gather installation: first preserve a copy of its source folder, finish any running lookup, and close its open tool pages. Copy the contents of this package’s `account-id-tool` into the existing extension folder at the **same path**, then use **Reload** on the Extensions page. Do not remove the extension. Keeping the original extension identity retains its local data. Loading the new folder separately creates a separate installation and does not automatically bring over old browser storage.

After updating, open **Workspace → Back up all work**. Legacy batches remain under **Account tools → Recent batches**. Saving an account from an old batch preserves its recorded check date; it does not count as a new lookup.

## One workflow

- **Get an ID quickly:** use the toolbar popup exactly as before. No project is required. Copy results immediately.
- **Start research:** create a project and its first scan in Workspace. The active destination is shared across Gather windows and is always displayed. Select Inbox whenever you do not want a project.
- **Include a result:** click **Save to [destination]** beside an account. Merely looking up an account does not add it to a scan. Each explicit save snapshots the destination; later switches do not move that pending save.
- **Save web material:** use **Save this page** in the toolbar, right-click a page/link/selection and choose **Save to Gather**, or add a URL and excerpt in Workspace. Saving captures a link, title and optional selected text, not a full archived page.
- **Search:** enter a query in Workspace. Gather opens the selected service in a real tab and records the query, provider and action state. Mark the search reviewed after you inspect it. Site-scoped Google searches are explicitly labeled.
- **Continue:** review saved items, keep next actions, add analyst notes and switch back to earlier scans. Account observations sharing an exact platform ID are grouped only within a project.
- **Export:** choose a readable Markdown report or structured JSON. Reports include this scan’s selected items except those marked Excluded. Unreviewed items remain labeled. **Back up all work** is separate and includes all workspace data, drafts, preferences and legacy batches.

For pages that the side panel cannot access, invoke the toolbar button on that page or use its right-click menu. Gather does not request permanent access to every website.

## What is in the package

- `account-id-tool/` — loadable 1.6 extension.
- `reference/1.5.1/` — untouched supplied implementation for comparison and rollback of code.
- `docs/PRODUCT-DIRECTION.md` — product decisions and bounded next work.
- `docs/BUILD-NOTES.md` — implemented behavior, audit findings and tradeoffs.
- `docs/TESTING.md` — verification results and remaining browser checks.
- `tests/` — reproducible synthetic tests plus a Chromium journey script.

The reference source folder does not contain a backup of your browser’s research data. Never uninstall the existing extension to perform an update.
