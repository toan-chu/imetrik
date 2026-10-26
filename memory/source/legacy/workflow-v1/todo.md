# Todo

## [2026-07-15 09:55] -- iMetriK v1 full rebuild

- [x] Read docs handoff/spec and bootstrap workspace journal files.
- [x] Rebuild app as offline `index.html` + plain script files, no ES modules.
- [x] Rebrand active app to iMetriK and remove active Trustana/PPT/MODES code paths.
- [x] Add multi-file parser, fuzzy merge, dataset store, query engine, slicers, grid layout, visual tiles, pages, i18n, present/export, report save/load.
- [x] Vendor `gridstack@12.6.0` locally.
- [x] Move old monolith/PPT/logo/handoff artifacts to `archives/`.
- [x] Add README, MIT LICENSE, third-party notices, smoke test, and git init.
- [x] Verify with Node smoke test and Playwright browser checks.

## [2026-07-15 10:15] -- UI polish, page controls, and PDF export

- [x] Use the supplied PNG logo and brand palette (`#0097b2`, `#ff751f`).
- [x] Fix local font loading and replace text glyph actions with consistent icons.
- [x] Make create, rename, and delete page actions explicit and discoverable.
- [x] Move Add visual outside Gridstack so tiles cannot overlap it.
- [x] Rework PDF export into a clean report layout with readable sizing.
- [x] Run automated smoke checks and browser/PDF visual QA.

## Test Plan -- UI polish, page controls, and PDF export

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Dashboard with multiple auto-generated tiles | Tiles begin below the Add visual control and never overlap it | pass |
| 2 | Add, rename, and delete a report page | Each action is available from visible controls and preserves at least one page | pass |
| 3 | Latin and Vietnamese labels | Be Vietnam Pro loads for both character subsets with no fallback mismatch | pass |
| 4 | Export a multi-tile page to PDF | Output is readable, uses report-only chrome, and paginates instead of shrinking the full editor | pass |
| 5 | Desktop, laptop, and mobile browser checks | No console errors, failed assets, incoherent overlap, or horizontal overflow | pass |

## [2026-07-15 10:55] -- Typography, palette, and header alignment

- [x] Align page tabs and page action controls to one consistent height and baseline.
- [x] Replace Be Vietnam Pro with offline Quicksand and Montserrat font assets.
- [x] Apply the supplied `#F5F5F5`, `#76ABAE`, `#303841`, and `#FF5722` palette.
- [x] Use orange selectively for primary actions and important interaction states.
- [x] Verify desktop/mobile rendering and font/color loading in-browser.

## Test Plan -- Typography, palette, and header alignment

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Page tab beside add, rename, and delete controls | All controls share a 36px box and are vertically centered | pass |
| 2 | Latin and Vietnamese interface text | Montserrat renders body/UI text and Quicksand renders headings without fallback | pass |
| 3 | Primary and secondary actions | Orange highlights import/Add visual/active interactions without dominating the UI | pass |
| 4 | Dashboard charts and status states | New palette remains readable and categorical series stay distinguishable | pass |
| 5 | Desktop and mobile browser checks | No overlap, clipping, horizontal page overflow, failed assets, or console errors | pass |

## [2026-07-15 11:16] -- Presentation, visual gallery, PDF, and adaptive themes

- [x] Fix Present scrolling and restore the editor when fullscreen exits or Escape is pressed.
- [x] Localize folder-picker cancellation and operation feedback in Vietnamese and English.
- [x] Make PDF download reliable from both local server and `file://`, with visible progress feedback.
- [x] Replace immediate visual insertion with a type-and-palette creation gallery.
- [x] Add per-visual palette controls to the inspector.
- [x] Rebalance day/night themes around charcoal, orange, white, with teal as support.
- [x] Flatten and align page action icons with hover-only backgrounds.
- [x] Run browser, theme, export, and responsive regression QA.

## Test Plan -- Presentation, visual gallery, PDF, and adaptive themes

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Enter Present on a dashboard taller than the viewport | Mouse wheel and keyboard scrolling reach lower visuals | pass |
| 2 | Press Escape or leave browser fullscreen | Present class clears and the editor toolbar/sidebar return | pass |
| 3 | Cancel folder picker in Vietnamese and English | Localized cancellation toast appears without raw browser error text | pass |
| 4 | Export PDF from HTTP and `file://` | Busy feedback appears and a non-empty A4 PDF downloads | pass |
| 5 | Click Add visual | Gallery opens; no tile is created until type and palette are confirmed | pass |
| 6 | Change an existing visual palette | Inspector selection persists and chart colors update | pass |
| 7 | Toggle day/night with line, bar, scatter, and table visuals | Text, axes, grids, and series remain visible in both themes | pass |
| 8 | Page tab actions on desktop and mobile | Flat icons share the tab center line and show backgrounds only on hover/focus | pass |

## [2026-07-15 12:02] -- Codex review handoff

- [x] Record the two new user-reported UX defects with concrete code evidence.
- [x] Create a self-contained Codex Review handoff document.
- [x] Remove unrelated caches, QA artifacts, legacy archives, sample data, and inactive fonts from the repo root.
- [ ] Preserve open slicers after selecting a checkbox or date value.
- [ ] Give the Fields list a meaningful direct interaction with visual creation or editing.
- [ ] Run focused browser regression checks after both UX changes.

## Test Plan -- Pending slicer and field interactions

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Expand a set slicer and select multiple values | The same slicer stays open and reflects each selection | pass |
| 2 | Expand several slicers and change one value | Relevant open/closed states survive the filtered rerender | pass |
| 3 | Change a date slicer value | Date slicer stays open and the dashboard updates | pass |
| 4 | Interact with a field from the Fields panel | A discoverable visual creation/editing workflow begins with that field applied | pass |
| 5 | Keyboard-operate Fields and slicers | Controls expose focus, labels, and usable Enter/Space behavior | pass |

## [2026-07-15 13:23] -- Presentation-grade open-source handoff

- [x] Fix slicer open-state persistence, checkbox ids, and date filter labels.
- [x] Turn Fields into keyboard-accessible click and drag/drop controls.
- [x] Add persistent field-to-visual assignment and field-aware visual creation.
- [x] Wire config brand tokens into CSS and consolidate stale palette CSS.
- [x] Add nine visual palettes and two synthetic Excel demo workbooks.
- [x] Rewrite README for non-technical users, brand customization, badges, privacy, and sharing.
- [x] Remove project-local memory and ignore journal folders for the public repo.
- [x] Verify smoke, syntax, responsive, theme, import, slicer, fields, export, and console flows.

## [2026-07-20 09:50] -- [AUTO] Product UX and visual-system redesign

- [x] Preserve report layouts when data is re-imported or a watched folder refreshes.
- [x] Make save/load match the documented filter and report-state contract.
- [x] Rebuild the toolbar hierarchy: orange only for Import and Add visual; blue-gray hover/focus for normal actions.
- [x] Keep every toolbar action reachable on desktop, laptop, and mobile.
- [x] Replace ambiguous field clicks with explicit create/apply actions.
- [x] Upgrade visual creation so type, dataset fields, aggregate, title, Top N, currency, and palette are configured before creation.
- [x] Make Inspector controls contextual to the selected visual type and move styling below data configuration.
- [x] Localize page, sheet, Inspector, report, empty, and status messages in Vietnamese and English.
- [x] Add a guided workbook import flow with sheet selection, bounded row preview, and header-row confirmation.
- [x] Refresh the shell, sidebar, canvas, cards, chart chrome, empty state, and mobile layout without changing the offline stack.
- [x] Add focused regression coverage and run browser visual QA in both themes.

## Test Plan -- Product UX and visual-system redesign

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Customize a dashboard, then import or refresh the same data | Existing pages, tiles, titles, and layouts remain unchanged | pass |
| 2 | Save and reopen a report with active filters | Pages, visual settings, theme, language, and filters are restored | pass |
| 3 | Hover/focus normal toolbar and tile actions | Controls use the blue-gray interaction surface; PDF is never filled charcoal | pass |
| 4 | View toolbar at 1440, 1280, 390, and 360 px | Every action is reachable without hidden horizontal overflow | pass |
| 5 | Create KPI, line, matrix, and text visuals | Creator asks only for relevant fields and creates the intended visual immediately | pass |
| 6 | Edit KPI, line, matrix, and text visuals | Inspector shows only controls relevant to that type | pass |
| 7 | Click a field with and without a selected visual | Explicit create/apply affordances prevent accidental visual mutation | pass |
| 8 | Import a workbook with multiple sheets or a header below row 1 | User chooses the sheet and confirms the header from a bounded preview | pass |
| 9 | Use Vietnamese and English flows | Dialogs, generated titles, status, save/load, page actions, and errors are localized | pass |
| 10 | Run light/dark, empty/data, filter, page, present, PNG, and PDF flows | No console errors, clipped content, broken charts, or regressions | pass |

## [2026-07-20 10:31] -- [AUTO] Graph editing clarity and progressive settings

- [x] Make the edit action on every visual persistently discoverable without competing with the orange primary actions.
- [x] Reorganize the Inspector into an open Basic section and a collapsed Advanced section.
- [x] Keep essential fields and calculations in Basic; move secondary series, limits, currency, and palette to Advanced.
- [x] Add concise guidance showing what can be changed and which visual is currently being edited.
- [x] Localize the new labels and guidance in Vietnamese and English.
- [x] Add regression coverage and verify desktop/mobile interaction in Chrome.

## Test Plan -- Graph editing clarity

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Scan a dashboard without hovering | Every graph exposes a labeled Edit action; duplicate/delete remain secondary | pass |
| 2 | Open Edit on KPI, chart, matrix, and text | Basic shows only the essential controls for that visual type | pass |
| 3 | Expand Advanced | Secondary options and palette appear in a single grouped disclosure | pass |
| 4 | Change a Basic or Advanced value | Visual updates and the same settings hierarchy remains understandable | pass |
| 5 | View at 1440, 390, and 360 px | Tile header and Inspector do not clip or overflow | pass |
| 6 | Operate with keyboard and switch VI/EN | Edit, Basic, Advanced, and close controls remain labeled and focusable | pass |
