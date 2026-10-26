# History

## [2026-07-20 10:43] -- [AUTO] Clarify per-visual editing

**Type:** feature
**Files Changed:** `src/i18n/strings.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`
**Summary:** Made every graph expose a persistent labeled Edit action and rebuilt the visual Inspector as an easy-to-scan two-step flow. Basic settings now show only the type-specific essentials, while series, limits, currency, and palette live in one collapsed Advanced section with immediate updates and clear VI/EN guidance.
**Decision:** Use the label itself to make Edit discoverable while keeping its idle state neutral; teal-gray is reserved for hover and keyboard focus, and orange remains exclusive to Import and Add visual.

---

## [2026-07-15 13:23] -- Presentation-grade open-source handoff

**Type:** feature
**Files Changed:** `.gitignore`, `README.md`, `config.js`, `index.html`, `src/data/folder-scanner.js`, `src/i18n/format.js`, `src/i18n/strings.js`, `src/main.js`, `src/model/dataset-store.js`, `src/view/slicers.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `sample-data/demo-sales-north.xlsx`, `sample-data/demo-sales-south.xlsx`
**Summary:** Upgraded iMetriK into a friendlier open-source dashboard starter with smoother surfaces, real Fields interactions, persistent slicers, nine chart palettes, synthetic demo workbooks, and a README that explains use and branding customization to non-technical users. Removed the project-local AI journal memory and kept Codex workflow journals out of public Git tracking.
**Decision:** Kept the existing offline vanilla JavaScript stack, Quicksand/Montserrat typography, Lucide icons, and Charcoal/Orange/Teal identity. Added palette variety as configurable theme-aware arrays instead of introducing a charting dependency or a build step.

---

## [2026-07-20 10:27] -- [AUTO] Redesign product UX and guided visual workflow

**Type:** feature
**Files Changed:** `README.md`, `index.html`, `src/data/parser.js`, `src/i18n/strings.js`, `src/main.js`, `src/model/dataset-store.js`, `src/report/report-io.js`, `src/view/pages.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`
**Summary:** Reworked iMetriK into a calmer operational BI workspace with transparent normal actions, teal-gray hover/selection, orange reserved for Import and Add visual, responsive overflow menus and data drawers, contextual visual creation/inspection, guided multi-sheet/header import, safer refresh behavior, filter-aware report templates, localized dialogs, and undo for visual deletion. Updated the user guide and added regression checks for refresh preservation, saved filters, contextual controls, header-row index safety, and toolbar styling.
**Decision:** Keep the existing offline vanilla-JavaScript stack and use progressive disclosure: data configuration comes before palette/style, normal actions remain neutral until interaction, and automatic dashboard generation creates a sample page instead of overwriting customized work. Workbook previews preserve blank rows so displayed row numbers map exactly to XLSX range offsets.

---

## [2026-07-15 09:55] -- iMetriK v1 full rebuild

**Type:** feature
**Files Changed:** `index.html`, `config.js`, `src/**`, `assets/logo-imetrik.svg`, `vendor/gridstack/**`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `.gitignore`, `tests/smoke-check.js`, `handoff/**`, `log/**`, `memory/**`
**Summary:** Rebuilt the old monolith into a split offline iMetriK dashboard app that runs from `file://` with plain script tags. Added multi-file import, fuzzy merge, data quality warnings, dataset/page/tile/report state, Gridstack layout, visual tiles, i18n/theme/present/export flows, and repo documentation.
**Decision:** Vendored `gridstack@12.6.0` locally so drag/resize works offline and recorded the MIT license in third-party notices.

---

## [2026-07-15 10:15] -- Polish dashboard UI and PDF export

**Type:** bugfix
**Files Changed:** `.gitignore`, `THIRD_PARTY_LICENSES.md`, `assets/logo-iMetriK.png`, `config.js`, `index.html`, `src/model/dataset-store.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/icons.js`, `src/view/layout.js`, `src/view/pages.js`, `src/view/styles.css`, `src/view/tile.js`, `vendor/lucide/**`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`
**Summary:** Reworked the dashboard surface after visual review: corrected font coverage and branding, replaced rough glyph controls with Lucide icons, exposed page management, separated Add visual from the tile grid, fixed stale Gridstack layout state, and made the editor responsive. Rebuilt export so the dashboard renders as a branded, readable A4 report instead of a shrunken editor screenshot.
**Decision:** Keep responsive and export-only layout transformations temporary and never persist them to report state. Vendor Lucide locally to preserve the offline `file://` contract.

---

## [2026-07-15 10:55] -- Apply Quicksand, Montserrat, and revised brand palette

**Type:** config
**Files Changed:** `config.js`, `index.html`, `src/view/charts.js`, `src/view/export.js`, `src/view/styles.css`, `fonts/quicksand-*.woff2`, `fonts/montserrat-*.woff2`, `fonts/LICENSE-quicksand.txt`, `fonts/LICENSE-montserrat.txt`, `THIRD_PARTY_LICENSES.md`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`
**Summary:** Replaced the active typography with locally vendored Quicksand and Montserrat, applied the supplied four-color palette to the editor, charts, and PDF export, and promoted orange on primary actions. Corrected the visible page control misalignment by giving the tab and all page actions the same measured dimensions and center line.
**Decision:** Use Quicksand for display hierarchy and Montserrat for operational text/data. Keep orange selective to preserve action hierarchy, with teal for data and selection and charcoal for structure.

---

## [2026-07-15 11:48] -- Fix presentation, visual creation, and adaptive themes

**Type:** bugfix
**Files Changed:** `assets/logo-iMetriK-data.js`, `config.js`, `index.html`, `src/data/folder-scanner.js`, `src/i18n/strings.js`, `src/main.js`, `src/report/report-io.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/present.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`
**Summary:** Corrected Present mode exit and scrolling, localized cancelled folder operations, and made PDF download reliable under both HTTP and direct `file://` use. Replaced immediate visual insertion with a responsive visual-and-palette gallery, added persistent per-visual palettes, rebuilt chart colors for legible day/night switching, and aligned page controls with flat hover states.
**Decision:** Use charcoal and orange as the primary day palette, white and orange as the primary night palette, and reserve teal for supporting data states. Embed the PNG logo as a data URI and use Blob downloads so export does not depend on local-file canvas permissions.

---

## [2026-07-15 12:05] -- Prepare review handoff and clean repository

**Type:** refactor
**Files Changed:** `docs/CODEX_REVIEW_HANDOFF_2026-07-15.md`, `README.md`, `src/view/styles.css`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`, retired files under `fonts/`, `sample-data/`, `assets/`, and ignored local artifact folders
**Summary:** Prepared a concrete handoff for the remaining slicer-collapse and non-interactive Fields issues, including root-cause evidence, acceptance criteria, and pending browser scenarios. Removed local caches, generated QA output, legacy archives, sample workbooks, empty agent folders, and superseded font assets while preserving the active offline runtime and project journals.
**Decision:** Keep the current UX defects pending for the next Claude/Codex review instead of making an unreviewed Fields interaction decision. Preserve a temporary external rollback zip for the destructive cleanup batch.

---

## [2026-07-15 13:36] -- Allow switching scanned folders

**Type:** bugfix
**Files Changed:** `src/data/folder-scanner.js`, `tests/smoke-check.js`
**Summary:** The Folder action could reconnect the previous saved folder instead of opening the picker, making it unclear how to scan another location. It now always lets the user choose a new folder and resets scan state so same-named files are imported correctly.
**Decision:** Keep saved-folder restore for app startup, but make an explicit Folder click an intentional folder switch.

---

## [2026-07-15 13:42] -- Update README for user trial

**Type:** config
**Files Changed:** `README.md`
**Summary:** Documented the exact steps for switching scanned folders and added a concise status note inviting real user feedback before further product work.
**Decision:** Pause feature expansion after this documentation pass so feedback can guide the next iteration.

---

## [2026-07-15 13:50] -- Explain dashboard functions in README

**Type:** config
**Files Changed:** `README.md`
**Summary:** Added a user-friendly reference for the visible dashboard controls and panels shown in the current Vietnamese UI, including when to use each action.
**Decision:** Keep the guide workflow-first so non-technical users can understand the screen without reading source code.

---
