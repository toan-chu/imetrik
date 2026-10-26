# Offline map and chart motion

> **Repo map:** read `docs/REPO_SNAPSHOT.md` before starting.
> **Standing rules:** read `log/rules.md`.

**Status:** done
**Assigned:** 2026-08-10

## 1. DIRECTIVE

1. **Goal and business context:** Bring the visual impact of the referenced Metabase dashboard into iMetriK, prioritizing a useful map visual and smoother, softer chart transitions.
2. **Rough technical direction:** Preserve iMetriK's offline vanilla-JavaScript architecture and existing Chart.js engine. Add locally bundled geography support and improve the existing chart render lifecycle.
3. **Out of scope:** Copying Metabase source code, adding online map tiles or CDN dependencies, migrating frameworks, or replacing the entire application shell.
4. **Acceptance criteria:** A choropleth map can be created and configured from imported data; supported charts update without routine destroy/recreate; reduced-motion and large-data safeguards remain; existing smoke checks and new happy/edge checks pass; desktop, laptop, and mobile browser QA show no blocking visual regressions.

## 2. TODO

- [x] Migrate legacy coordination artifacts into the approved repository governance model without changing application source.
- [x] Audit current chart, tile, query, persistence, and export contracts; preserve existing user changes.
- [x] Vendor a license-compatible offline geo renderer and compact geography asset with attribution.
- [x] Implement map configuration, matching, rendering, legend, tooltip, no-data, and unmatched-value states.
- [x] Refactor chart lifecycle to update compatible instances in place with softer motion and reduced-motion/large-data safeguards.
- [x] Add focused smoke tests for map happy path, unmatched geography edge case, and chart instance reuse contract.
- [x] Run existing tests and browser QA; fix discovered regressions.
- [x] Record verification evidence and session journal.

### Test Plan -- Map and chart motion

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Create a map from recognized country labels and numeric values | Regions render with a legend and meaningful tooltips | pass |
| 2 | Dataset contains an unknown or blank geography label | Map renders known regions and exposes unmatched values instead of silently dropping them | pass |
| 3 | Filter or configuration changes a compatible chart | Existing Chart instance updates in place with motion enabled below the point threshold | pass |
| 4 | Reduced motion is requested or dataset exceeds the animation threshold | Animation is disabled without changing the result | pass |
| 5 | Existing chart, table, KPI, import, save/load, and export smoke contracts | Existing smoke suite remains green | pass |
| 6 | Desktop 1440x900, laptop 1280x800, mobile 390x844 | Dashboard and dialogs remain usable without blocking overflow or blank canvases | pass |

## 3. AUDIT

### [2026-08-10] [AUTO] START

Direct user request treated as the Directive. Existing modified worktree files are user-owned and will be preserved. No framework migration or online dependency is authorized.

### [2026-08-10] REPOSITORY MIGRATION

**Done:** Created the canonical `docs`, `handoff/tasks`, `log`, and three-tier project memory layout; removed the obsolete ignore rules for governance files; moved four legacy documents unchanged from `docs/` to read-only `memory/source/legacy/`.
**Files changed:** `.gitignore`, `docs/REPO_SNAPSHOT.md`, `handoff/tasks/`, `log/`, `memory/`; four historical documents moved without content edits.
**Verification:** `git check-ignore` returned no match for `handoff/tasks/20260810_map-chart-motion.md`, `log/rules.md`, or `memory/source/README.md`; repository search found no runtime, test, or CI references to the moved paths.
**Deviations from Directive:** User-authorized repository governance migration was added before feature implementation.
**Open questions for Cowork:** none.
**Risks/known gaps:** Historical documents contain stale paths internally by design; `memory/source/legacy/README.md` marks them non-active and immutable.

### [2026-08-10 12:14] [AUTO] REPORT

**Done:** Added a locally bundled world choropleth visual; accent-insensitive and alias-aware country matching; visible unmatched-value reporting; map legend, tooltip, click filtering, dark/light palettes, and empty state. Reworked Chart.js rendering around retained instances and stable mounts, added softer bar/line/area styling and motion, and honored reduced motion, export mode, and `ANIM_MAX_POINTS`. Fixed two QA-discovered lifecycle defects: blank canvases after responsive remounts and blank choropleths in PNG/PDF snapshots.

**Architecture decision:** Kept the existing vanilla JavaScript, GridStack, and Chart.js stack. Chose the MIT `chartjs-chart-geo` plugin plus the ISC `world-atlas` 110m topology, both vendored locally. Metabase source and network map tiles were not copied. Compatible charts retain their Chart object, canvas, and a stable mount through GridStack rebuilds; changing Chart.js type still destroys and recreates the instance.

**Files changed:** `.gitignore`, `THIRD_PARTY_LICENSES.md`, `index.html`, `assets/maps/`, `vendor/chartjs-chart-geo/`, `src/i18n/strings.js`, `src/view/map.js`, `src/view/charts.js`, `src/view/export.js`, `src/view/layout.js`, `src/view/styles.css`, `src/view/tile.js`, `tests/map-check.js`, `tests/chart-lifecycle-check.js`, `tests/smoke-check.js`, `sample-data/demo-country-sales.csv`, `tools/build-world-atlas.js`, and canonical governance files.

**Verification:**

```text
> node tests\map-check.js
map-check passed
> node tests\chart-lifecycle-check.js
chart-lifecycle-check passed
> node tests\smoke-check.js
smoke-check passed
> node --check (all JavaScript under src, tests, tools)
all JavaScript syntax checks passed
```

```text
Browser, demo-country-sales.csv:
- map: 11 matched regions; 1 unmatched value: Atlantis
- filter to Vietnam while network offline: map updates to 1 matched region
- retained instance tokens survive filter and 1280 -> 390 -> 1280 resize
- reduced-motion emulation: animation=false for bar, scatter, choropleth
- 390x844 and 1280x800: horizontal overflow=0; canvas backing sizes match frames
- 1440x900, 1280x800, 390x844 screenshots visually reviewed
- console: 0 errors
- PNG export: 431375 bytes; choropleth, bar, scatter, KPI, and matrix visible
- file:// Chrome launch: application shell and local assets render
- runtime request hosts: http://127.0.0.1:8765 only
```

```text
chartjs-chart-geo SHA256 F03F8CF9CD8F7F6CEEC4D2F86A33A279B9CA307EB16564FC104825FD89B048FA
world-atlas-110m SHA256 65AB9CF821A9D554AD7942292D09D03535892BACC24907FC67440F10253A8068
```

**Deviations from Directive:** none. The export canvas fix was discovered scope required to keep the existing export acceptance criterion green.
**Open questions for Cowork:** none.
**Risks/known gaps:** Country matching is intentionally fail-closed. Unrecognized labels remain visible for user correction instead of fuzzy-matching to a potentially wrong country. The vendored world-atlas repository is archived upstream; the exact asset is pinned and rebuildable with `tools/build-world-atlas.js`.
