# Codex Review Handoff - 2026-07-15

## Goal

Review the current offline iMetriK implementation and resolve two remaining UX defects without re-architecting unrelated features.

## User-Reported Defects

### 1. Slicers close after every selection

Reproduction:

1. Import a workbook with a text, boolean, or date column.
2. Expand a slicer.
3. Select a checkbox or change a date.
4. The slicer collapses immediately.

Concrete cause: `src/view/slicers.js` calls `IMK.renderAll()` from each input `onchange`. `IMK.renderAll()` then calls `IMK.Slicers.render()`, which clears `#slicerList` with `box.innerHTML = ""` and recreates every `<details>` element without preserving its `open` state.

Acceptance criteria:

- The interacted slicer remains open after each selection.
- Open/closed state for other slicers survives filtered rerenders.
- Set and date slicers both behave correctly.
- Filtering and chart updates remain immediate.

Also review the set-slicer label markup: a `for` value is assigned to the label, but the nested checkbox never receives the matching `id`.

### 2. Fields panel is display-only

`src/main.js` renders each field as a non-focusable `.field-item` div containing only a type badge and name. There is no click, keyboard, drag, or visual-builder interaction, so the panel currently communicates affordance without providing one.

The next implementation should define and ship one coherent interaction, preferably using the existing visual creator/inspector rather than adding a parallel builder. At minimum, interacting with a field must begin a visual creation or editing workflow with that field already applied. Include keyboard support and a visible hover/focus state.

## Current Product State

- Offline plain-script app; no build step or ES modules.
- Runs under both HTTP and direct `file://`.
- Gridstack, Chart.js, SheetJS, html2canvas, jsPDF, and Lucide are vendored under `vendor/`.
- Active fonts are Quicksand and Montserrat; active logo is `assets/logo-iMetriK.png` plus its export data URI.
- Add visual opens a 12-type gallery with four palettes.
- Visual palettes persist per tile and adapt to light/dark themes.
- Present mode scrolls and exits cleanly on Escape/fullscreen exit.
- PDF Blob download was verified under HTTP and direct `file://`.
- No commit has been created for the current working tree.

## Verification Baseline

Before this handoff:

- `node tests\smoke-check.js` passed.
- JavaScript syntax checks passed for 19 files.
- `git diff --check` passed.
- Mobile width 390px had no document overflow.
- Browser console had zero errors in the exercised dashboard flows.
- Direct `file://` PDF export downloaded a 397,607-byte PDF.
- HTTP export produced a visually inspected two-page A4 PDF with intact repeated headers.

Run after the two UX fixes:

```powershell
node tests\smoke-check.js
git diff --check
```

Then run headed browser checks for the five pending scenarios in `handoff/todo.md`.

## Relevant Files

- `src/view/slicers.js`
- `src/main.js`
- `src/view/tile.js`
- `src/view/styles.css`
- `src/model/dataset-store.js`
- `tests/smoke-check.js`
- `handoff/todo.md`
- `handoff/audit.md`

## Cleanup Note

Legacy archives, sample workbooks, package-download caches, Playwright session files, rendered QA output, empty agent-local folders, and superseded Be Vietnam Pro/JetBrains Mono font assets were removed from the repo. A temporary rollback archive is recorded in the repository cleanup pre-action note in `handoff/audit.md`.
