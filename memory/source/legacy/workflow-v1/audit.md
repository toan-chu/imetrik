# Audit

## [2026-07-20 10:43] -- [AUTO] Graph editing clarity and progressive settings -- REPORT

**Done:** Added a persistent labeled Edit control to every visual; added full-title hover text; rebuilt Inspector context and guidance; split settings into an open type-aware Basic step and a collapsed Advanced step; kept Advanced open after a value or palette change; localized the complete flow in Vietnamese and English; and added regression assertions for the new structure and interaction styling.
**Files changed:** `src/i18n/strings.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`.
**Verification:** `node tests/smoke-check.js`, JavaScript syntax checks, and `git diff --check` passed. Headed Chrome QA covered KPI, line, matrix, and text Basic controls; Advanced grouping and persistence after a currency change; VI/EN labels; Enter-key activation; desktop 1440x900 and mobile 390x844/360x740 layouts; and zero console errors. Mobile document width stayed within the viewport (`375 < 390`, `345 < 360`). The Edit button computed as neutral at rest (`rgb(255,255,255)` background, muted text, gray border) and teal-gray on hover (`rgb(229,238,238)` background, `rgb(54,95,98)` text, teal border).
**Open questions for Cowork:** None.
**Risks/known gaps:** Very long graph titles still truncate inside compact tile headers by design, but the full title is available through the input title tooltip and the Inspector's Editing context.

---

## [2026-07-15 13:10] -- Presentation-grade open-source handoff -- PRE-ACTION NOTE

**What:** Remove the project-local `memory/` journal as requested, stop tracking `log/` and `handoff/` in the public repository, replace the stale Trustana-era CSS preamble, add synthetic demo workbooks, and commit the complete working tree.
**Why:** iMetriK is an offline BI product, not an AI product. The public checkout should contain the runnable dashboard, vendor assets, tests, sample fixtures, and user-facing documentation rather than agent journals.
**Blast radius:** `memory/` contains only four README files and will be deleted locally. `log/` and `handoff/` will remain available locally for the Codex workflow but be ignored and removed from Git tracking. Active app code, vendor libraries, fonts, tests, sample fixtures, `docs/BUILD_SPEC_v1.md`, and licensing files remain in scope.
**Rollback:** Recover the journal files from the current working tree or Git history before the commit; restore public tracking with `git add -f log handoff` if the owner later wants the workflow files shipped.

---

## [2026-07-20 10:27] -- [AUTO] Product UX and visual-system redesign -- REPORT

**Done:** Rebuilt the toolbar and interaction color hierarchy; added responsive More and data-drawer navigation; redesigned empty, canvas, tile, creator, Inspector, import, and page-dialog surfaces; made field create/apply actions explicit; added type-specific visual parameters and validation; preserved customized reports and applicable filters across data refresh; restored filters, active page, theme, and language from templates; added multi-sheet and header-row review; localized new flows; added visual-delete Undo; and updated README guidance.
**Files changed:** `README.md`, `index.html`, `src/data/parser.js`, `src/i18n/strings.js`, `src/main.js`, `src/model/dataset-store.js`, `src/report/report-io.js`, `src/view/pages.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`.
**Verification:** `node tests/smoke-check.js` passed; syntax checks for the changed JavaScript files passed; `git diff --check` passed. Chrome QA at 1440x900, 1280x800, 390x844, and 360x800 showed no horizontal overflow or console errors. PDF computed style was transparent at rest and `rgb(229, 238, 238)` on hover. Mobile reached the last visual (`scrollY=888`, document height `1688`) and exposed Save/Open/Present/PNG/PDF through More. Re-import kept `Tiêu đề giữ nguyên` and all 6 tiles. A generated two-sheet workbook with a blank row suggested header index 2 and parsed both selected sheets with the expected columns. Present entered fullscreen and Escape restored the editor. PNG and PDF downloads completed at 309795 and 232694 bytes. Delete plus Undo restored the tile count from 5 to 6.
**Open questions for Cowork:** None.
**Risks/known gaps:** Parsing and rendering still happen on the browser main thread, so very large workbooks may pause the UI; the guided preview bounds inspection to 30 rows but does not yet move XLSX parsing to a worker.

---

## [2026-07-15 13:23] -- Presentation-grade open-source handoff -- REPORT

**Done:** Fixed slicers so checkbox and date changes preserve open/closed state; made Fields real keyboard-accessible draggable buttons that create or update visuals; added field-aware visual creation, selected visual state, and drag/drop drop targets; added saved File System Access handle restoration; wired brand config tokens into CSS; replaced stale Trustana-era CSS; expanded visual palettes from four to nine; added two synthetic Excel workbooks; rewrote the README with beginner-friendly run steps, badges, branding customization, privacy notes, and JavaScript stack clarification; and removed local `memory/` while ignoring and untracking `log/` and `handoff/`.
**Files changed:** `.gitignore`, `README.md`, `config.js`, `index.html`, `src/data/folder-scanner.js`, `src/i18n/format.js`, `src/i18n/strings.js`, `src/main.js`, `src/model/dataset-store.js`, `src/view/slicers.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `sample-data/demo-sales-north.xlsx`, `sample-data/demo-sales-south.xlsx`; removed `memory/` and journal files from Git tracking.
**Verification:** `node tests/smoke-check.js` passed; all `src/**/*.js` passed `node --check`; `git diff --check` passed; headed Playwright checked desktop 1440x900 and mobile 390x844 with zero console errors and all static requests local; imported the 6-row synthetic workbook; selected a Region slicer checkbox and confirmed the slicer remained open; opened Fields and created a Revenue visual with the Spectrum palette; confirmed eight draggable Fields; toggled dark mode and English; measured mobile `document.documentElement.scrollWidth` as `390`; downloaded a PDF of `272014` bytes and PNG of `341964` bytes; rendered the PDF to two PNG pages and inspected both for clipping/overlap.
**Open questions for Cowork:** None for the implementation scope.
**Risks/known gaps:** A real OneDrive Files On-Demand folder was not available in this environment, so browser QA verified the local HTTP-hosted app and the saved-handle restoration code path, not a real OneDrive sync event. `pdftoppm` was present but unusable in this Windows runtime, so PDF pages were rendered with the installed PyMuPDF fallback.

---

## [2026-07-15 09:55] -- iMetriK v1 full rebuild -- REPORT

**Done:** Rebuilt iMetriK as a split offline browser app; added config/i18n/data/model/query/view/report layers; added Gridstack layout, multi-file import, fuzzy merge, data quality warnings, dataset switching, slicers, page tabs, tile inspector, KPI/chart/table/matrix/scatter/text visuals, report JSON save/load with fuzzy remap, preset folder listing, light/dark theme, VN/EN toggle, present mode, PNG/PDF export, README/LICENSE/THIRD_PARTY, smoke test, and git init.
**Files changed:** `index.html`, `config.js`, `src/**`, `assets/logo-imetrik.svg`, `vendor/gridstack/**`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `.gitignore`, `tests/smoke-check.js`, `handoff/**`, `log/**`, `memory/**`.
**Archived:** `archives/dashboard.html`, `archives/pptxgen.bundle.js`, `archives/Logo_Trustana_PNGPurpleOrange.png`, `archives/HANDOFF.md`, `archives/README-trustana.md`.
**Verification:** `node tests\smoke-check.js` passed; Playwright opened `file:///.../index.html` at 1440x900 with no failed requests, console errors, or page errors; Playwright mobile 390x844 had no failed requests/errors and no horizontal overflow; Playwright imported `sample-data/mau_du_lieu_HR.xlsx` and rendered 6 Gridstack tiles with no console/page errors.
**Open questions for Cowork:** Confirm whether `archives/` should remain ignored or be tracked before public push.
**Risks/known gaps:** The original pre-rebrand README was overwritten before archive; logged in `log/failure.md` and replaced with an honest archive note. File System Access permission persistence and OneDrive Files On-Demand behavior were not manually tested against a real user-selected folder in headed Chrome/Edge.

---

## [2026-07-15 10:15] -- UI polish, page controls, and PDF export -- REPORT

**Done:** Replaced the temporary branding with the supplied PNG logo and the `#0097b2` / `#ff751f` palette; added complete Latin and Vietnamese Be Vietnam Pro font subsets; vendored Lucide and replaced text glyph controls; added visible create, rename, and delete page actions; moved Add visual outside Gridstack; fixed stale Gridstack node initialization that caused overlap and vertical layout drift; added one-column mobile stacking with non-persistent breakpoint rebuilding; and rebuilt PDF/PNG export around a branded A4 landscape report capture with content-aware pagination.
**Files changed:** `.gitignore`, `THIRD_PARTY_LICENSES.md`, `assets/logo-iMetriK.png`, `config.js`, `index.html`, `src/model/dataset-store.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/icons.js`, `src/view/layout.js`, `src/view/pages.js`, `src/view/styles.css`, `src/view/tile.js`, `vendor/lucide/**`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`.
**Verification:** `node tests\smoke-check.js`, JavaScript syntax checks, and `git diff --check` passed. Playwright imported the 278-row HR workbook, exercised page create/rename/delete, verified zero console errors and no horizontal overflow at 1440x900 and 390x844, and confirmed the exact six-tile desktop layout survived theme changes, PDF export, and mobile-to-desktop resize. The verified PDF is one A4 landscape page, 423,544 bytes, and was rendered with Poppler for visual inspection.
**Open questions for Cowork:** None.
**Risks/known gaps:** The pagination path is implemented for dashboards taller than one A4 page, but the current six-tile HR fixture fits on one page. OneDrive folder permission persistence remains outside this visual polish task.

---

## [2026-07-15 10:55] -- Typography, palette, and header alignment -- REPORT

**Done:** Aligned the active page tab and all page actions to a shared 36px control box and center line; vendored Quicksand and Montserrat Latin/Vietnamese subsets at weights 400-700; assigned Quicksand to headings, page labels, tile titles, and KPI values while Montserrat handles body text, controls, tables, and charts; applied the supplied `#F5F5F5`, `#76ABAE`, `#303841`, and `#FF5722` palette; and added orange emphasis to Import, Add visual, New page, active tab underline, and focus states.
**Files changed:** `config.js`, `index.html`, `src/view/charts.js`, `src/view/export.js`, `src/view/styles.css`, `fonts/quicksand-*.woff2`, `fonts/montserrat-*.woff2`, `fonts/LICENSE-quicksand.txt`, `fonts/LICENSE-montserrat.txt`, `THIRD_PARTY_LICENSES.md`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`.
**Verification:** `node tests\smoke-check.js`, JavaScript syntax checks, and `git diff --check` passed. Playwright imported the 278-row HR fixture and measured the active tab plus all three page actions at exactly 36px with the same vertical center. Browser font checks confirmed loaded Quicksand and Montserrat subsets; desktop 1440x900 and mobile 390x844 had zero console errors and mobile document width equaled its viewport width. PDF export rendered as one A4 landscape page at 402,824 bytes and passed visual inspection after Poppler rendering.
**Open questions for Cowork:** None.
**Risks/known gaps:** Existing Be Vietnam Pro and JetBrains Mono assets remain in `fonts/` but are no longer active; removing or archiving the 16 old font files would cross the bulk-move guard and was intentionally left out of this task.

---

## [2026-07-15 11:48] -- Presentation, visual gallery, PDF, and adaptive themes -- REPORT

**Done:** Fixed Present scrolling and editor restoration on Escape/fullscreen exit; localized folder-picker cancellation and export feedback; made PDF download use a validated Blob and embedded offline logo; added a 12-type visual gallery with four creation palettes plus persistent per-visual palette controls; switched day/night colors to charcoal-orange-white with teal as support; made chart series, axes, grids, and text adapt to theme; and flattened the page action icons with hover-only backgrounds.
**Files changed:** `assets/logo-iMetriK-data.js`, `config.js`, `index.html`, `src/data/folder-scanner.js`, `src/i18n/strings.js`, `src/main.js`, `src/report/report-io.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/present.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/smoke-check.js`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`.
**Verification:** `node tests\smoke-check.js`, JavaScript syntax checks for 19 files, and `git diff --check` passed. Playwright verified Present scrolling from 0 to 108px and complete editor restoration after Escape; localized VN/EN cancellation toasts; gallery creation gating, 12 visual types, four palettes, and persisted inspector palette changes; visible light/dark line and scatter series; zero console errors; and 390px mobile document width. HTTP export produced a visually inspected two-page A4 landscape PDF at 483,644 bytes with intact repeated headers. A separate Chromium run opened `index.html` directly through `file://`, imported six tiles, and downloaded a 397,607-byte PDF with the Vietnamese success toast and zero console/page errors.
**Open questions for Cowork:** None.
**Risks/known gaps:** None known in the exercised flows. Native folder permission persistence and OneDrive Files On-Demand behavior still depend on browser and operating-system policy.

---

## [2026-07-15 12:02] -- Repository cleanup -- PRE-ACTION NOTE

**What:** Remove ignored build/review artifacts (`.local/`, `.playwright-cli/`, `output/`), retired legacy material (`archives/`), empty agent-local folders, deleted sample-data remnants, and the inactive Be Vietnam Pro/JetBrains Mono font files and declarations.
**Why:** The owner requested a clean handoff containing only the active offline app, its vendored runtime dependencies, documentation, tests, and workspace journals.
**Blast radius:** Approximately 40 MB of local caches, screenshots, rendered PDFs, legacy files, sample workbooks, and 16 superseded font assets. Active Quicksand/Montserrat fonts, PNG branding, source, vendor libraries, tests, docs, handoff, logs, and memory remain.
**Rollback:** Create `C:\Users\RYAN TOAN\AppData\Local\Temp\imetrik-cleanup-backup-20260715-1202.zip` before deletion. Tracked removals can also be recovered from Git history.

---

## [2026-07-15 12:05] -- Codex review handoff and repository cleanup -- REPORT

**Done:** Recorded the slicer-collapse root cause and display-only Fields limitation; created a standalone Codex Review handoff with acceptance criteria and pending tests; removed `.local/`, `.playwright-cli/`, `output/`, `archives/`, empty `.agents/` and `.codex/`, sample-data remnants, and all inactive Be Vietnam Pro/JetBrains Mono assets and CSS declarations; and updated README layout documentation.
**Files changed:** `docs/CODEX_REVIEW_HANDOFF_2026-07-15.md`, `README.md`, `src/view/styles.css`, `handoff/todo.md`, `handoff/audit.md`, `log/history.md`; retired tracked assets under `fonts/`, `sample-data/`, and `assets/logo-imetrik.svg` remain intentional deletions in the working tree.
**Verification:** `node tests\smoke-check.js`, 19 JavaScript syntax checks, `git diff --check`, and a retired-reference scan passed. Direct `file://` Chromium smoke confirmed Montserrat and Quicksand loaded, the body used Montserrat, and there were zero console, page, or failed-request errors. The repo root now contains only `.git`, active app/assets/fonts/vendor source, docs, tests, and required workspace journals.
**Open questions for Cowork:** Choose the exact Fields interaction contract: prefilled visual creation, active-visual assignment, or a coherent combination using the existing creator/inspector.
**Risks/known gaps:** The two user-reported UX items are intentionally handed off as pending work and were not fixed in this cleanup turn. The temporary cleanup rollback zip is outside the repo at `C:\Users\RYAN TOAN\AppData\Local\Temp\imetrik-cleanup-backup-20260715-1202.zip`.

---

## [2026-07-15 13:36] -- Switch scanned folder -- REPORT

**Done:** Changed the Folder action to always open the native directory picker, reset the previous folder's last-seen file state, and retain automatic reconnect only for app startup.
**Files changed:** `src/data/folder-scanner.js`, `tests/smoke-check.js`.
**Verification:** `node tests/smoke-check.js`, `node --check src/data/folder-scanner.js`, and `git diff --check` passed.
**Open questions for Cowork:** None.
**Risks/known gaps:** Browser permission behavior still depends on Chrome/Edge and the operating system.

---

## [2026-07-15 13:42] -- README usage handoff -- REPORT

**Done:** Added a non-technical walkthrough for switching from one scanned folder to another and documented the current ready-for-user-feedback status.
**Files changed:** `README.md`.
**Verification:** `node tests/smoke-check.js`, `git diff --check`, and strict UTF-8/NUL-byte validation passed.
**Open questions for Cowork:** None; pause for user feedback before the next product iteration.
**Risks/known gaps:** The README intentionally describes the current trial-ready state; real-world feedback may reveal additional file-format or workflow edge cases.

---

## [2026-07-15 13:50] -- Explain dashboard functions in README -- REPORT

**Done:** Added a plain-language function guide covering the top toolbar, left-side data panels, dashboard canvas, report templates, filters, suggestions, save/load, presentation, PNG, and PDF export.
**Files changed:** `README.md`.
**Verification:** `node tests/smoke-check.js`, `git diff --check`, and strict UTF-8/NUL-byte validation passed.
**Open questions for Cowork:** None.
**Risks/known gaps:** Documentation describes the current UI contract; future label or workflow changes should update this table.

---
