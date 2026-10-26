# Session: [AUTO] Offline map and chart motion

**Date:** 2026-08-10
**Mode:** dev
**Type:** feature
**Area:** dashboard visuals
**Result:** pass
**Files changed:** `src/view/map.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/layout.js`, `src/view/tile.js`, `src/view/styles.css`, `src/i18n/strings.js`, `index.html`, `assets/maps/`, `vendor/chartjs-chart-geo/`, `tests/`, `tools/build-world-atlas.js`

## What happened

iMetriK gained a fully offline country choropleth and retained Chart.js updates with softer motion. Browser QA covered actual CSV import, map creation, filtering without a network, reduced motion, responsive resizing, and PNG export; unit and smoke checks passed.

## Decision

The application keeps its vanilla JavaScript architecture and existing Chart.js engine. MIT `chartjs-chart-geo` and ISC `world-atlas` are pinned locally; compatible charts keep a stable mount through GridStack rebuilds so animation and responsive drawing survive without routine instance recreation. Unknown geography labels fail closed and are shown to the user. The export path explicitly copies live canvas bitmaps into html2canvas clones so specialized visual plugins remain visible in PNG and PDF output.
