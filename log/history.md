# History

## [2026-07-15 09:55] -- iMetriK v1 full rebuild

**Type:** feature
**Files Changed:** `index.html`, `config.js`, `src/**`, `assets/logo-imetrik.svg`, `vendor/gridstack/**`, `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `.gitignore`, `tests/smoke-check.js`, `handoff/**`, `log/**`, `memory/**`
**Summary:** Rebuilt the old monolith into a split offline iMetriK dashboard app that runs from `file://` with plain script tags. Added multi-file import, fuzzy merge, data quality warnings, dataset/page/tile/report state, Gridstack layout, visual tiles, i18n/theme/present/export flows, and repo documentation.
**Decision:** Vendored `gridstack@12.6.0` locally so drag/resize works offline and recorded the MIT license in third-party notices.

---
