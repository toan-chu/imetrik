# Audit

## [2026-07-15 09:55] -- iMetriK v1 full rebuild -- REPORT

**Done:** Rebuilt iMetriK as a split offline browser app; added config/i18n/data/model/query/view/report layers; added Gridstack layout, multi-file import, fuzzy merge, data quality warnings, dataset switching, slicers, page tabs, tile inspector, KPI/chart/table/matrix/scatter/text visuals, report JSON save/load with fuzzy remap, preset folder listing, light/dark theme, VN/EN toggle, present mode, PNG/PDF export, README/LICENSE/THIRD_PARTY, smoke test, and git init.
**Files changed:** `index.html`, `config.js`, `src/**`, `assets/logo-imetrik.svg`, `vendor/gridstack/**`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `.gitignore`, `tests/smoke-check.js`, `handoff/**`, `log/**`, `memory/**`.
**Archived:** `archives/dashboard.html`, `archives/pptxgen.bundle.js`, `archives/Logo_Trustana_PNGPurpleOrange.png`, `archives/HANDOFF.md`, `archives/README-trustana.md`.
**Verification:** `node tests\smoke-check.js` passed; Playwright opened `file:///.../index.html` at 1440x900 with no failed requests, console errors, or page errors; Playwright mobile 390x844 had no failed requests/errors and no horizontal overflow; Playwright imported `sample-data/mau_du_lieu_HR.xlsx` and rendered 6 Gridstack tiles with no console/page errors.
**Open questions for Cowork:** Confirm whether `archives/` should remain ignored or be tracked before public push.
**Risks/known gaps:** The original pre-rebrand README was overwritten before archive; logged in `log/failure.md` and replaced with an honest archive note. File System Access permission persistence and OneDrive Files On-Demand behavior were not manually tested against a real user-selected folder in headed Chrome/Edge.

---
