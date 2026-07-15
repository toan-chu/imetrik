# iMetriK

iMetriK is an offline BI dashboard that runs directly from `index.html`. It imports Excel or CSV files in Chrome/Edge, builds presentation-ready pages, and keeps all data inside the browser on the local machine.

## Run

Open `index.html` in Chrome or Edge. No server, install, or build step is required.

## What It Does

- Import one or more `.xlsx`, `.xls`, or `.csv` files with SheetJS.
- Scan a folder with the File System Access API and poll for changed files.
- Merge similar files with fuzzy column matching, union compatible files, and surface data quality warnings.
- Build dashboard pages with draggable/resizable tiles using Gridstack.
- Render KPI, column, bar, stacked column, line, area, donut, scatter, table, matrix, combo-style, and text tiles.
- Save/load report definitions as `.json` templates without embedding source data.
- Switch Vietnamese/English locale, light/dark theme, presentation mode, PNG export, and PDF export.

## Browser Notes

Folder scan and silent report save use the File System Access API, which is currently a Chrome/Edge feature. If permission is not granted, report save falls back to downloading a `.json` file.

For OneDrive folders, mark source data as "Always keep on this device" so the browser can read files without waiting for cloud hydration.

## Data Privacy

Data is parsed and aggregated in the browser. iMetriK does not upload data to any server.

## Project Layout

- `index.html` loads vendor libraries and plain script files in order.
- `config.js` contains brand, palette, merge, polling, and runtime knobs.
- `src/data/` parses files, scans folders, and merges datasets.
- `src/model/` owns report state and measures.
- `src/query/` aggregates data before rendering.
- `src/view/` renders pages, slicers, tiles, charts, export, and present mode.
- `src/report/` saves and loads report definitions.
- `archives/` contains old pre-rebrand material kept only for reference.
