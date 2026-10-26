# Full-function test workbook and README guide

> **Repo map:** read `docs/REPO_SNAPSHOT.md` before starting.
> **Standing rules:** read `log/rules.md`.

**Status:** done
**Assigned:** 2026-08-10

## 1. DIRECTIVE

1. **Goal and business context:** Give the project owner one realistic workbook under `docs/` that can exercise iMetriK's data-driven functions, plus a README walkthrough for later manual testing.
2. **Rough technical direction:** Build a polished multi-sheet XLSX containing representative dimensions, measures, dates, booleans, geographies, multiple series, calculated fields, and intentional quality edge cases. Document a deterministic manual test sequence.
3. **Out of scope:** Running the owner's future acceptance test, changing application behavior, or claiming that one XLSX can reproduce the browser's folder-picker/multi-file permission flow.
4. **Acceptance criteria:** The workbook opens and imports; every sheet is visually inspected; formulas contain no errors; README documents import, all visual types, filters, map, pages, theme/language, present, save/load, PNG/PDF, data-quality, and the explicit folder-scan boundary; existing project checks remain green.

## 2. TODO

- [x] Audit the actual application contracts and supported visual roster.
- [x] Create the multi-sheet XLSX with a clear Instructions sheet and test data.
- [x] Inspect values/formulas, scan errors, and render every sheet for visual QA.
- [x] Update README with a complete manual test walkthrough and expected results.
- [x] Run project checks and record verification evidence.
- [x] Append the completion report and session journal.

### Test Plan -- Full-function workbook

| # | Scenario | Expected | Status |
|---|----------|----------|--------|
| 1 | Open workbook in Excel-compatible viewer | All sheets are legible, formatted, and unclipped | pass |
| 2 | Import selected sheets into iMetriK | Header rows and typed fields are detected correctly | pass |
| 3 | Build every supported data-driven visual | Workbook provides valid dimensions/measures for each visual | pass |
| 4 | Exercise map and data-quality edges | Known countries render; explicit unknown/blank edge cases remain visible | pass |
| 5 | Inspect formulas and workbook schema | No formula errors; required totals reconcile | pass |
| 6 | Follow README manual test guide | Every current UI function has a step and expected result or an explicit boundary | pass |

## 3. AUDIT

### [2026-08-10] [AUTO] START

Direct user request treated as the Directive. The workbook will be created with the bundled spreadsheet runtime and verified before handoff. Existing application files will only be changed where required for README documentation.

### [2026-08-10] PRE-ACTION NOTE

**What:** Delete the generated `docs/imetrik-full-function-test.xlsx.inspect.ndjson` verification sidecar and the temporary workbook build directory after verification.
**Why:** These are reproducible local QA artifacts, not project deliverables; keeping the 10 MB inspection dump would add noise to the cleaned repository.
**Blast radius:** The exact generated sidecar under `docs/` and the exact task-specific directory under the Windows temp folder only. The final XLSX, source code, and user files are unaffected.
**Rollback:** Regenerate the sidecar by running the spreadsheet inspection step again; regenerate the temp directory by rerunning the workbook builder.

### [2026-08-10 12:39] [AUTO] REPORT

**Done:** Created `docs/imetrik-full-function-test.xlsx`; added a deterministic full-function walkthrough to README; added a regression check that loads the workbook through iMetriK's real parser and merge engine; visually rendered and inspected all five sheets; removed local QA artifacts after verification.

**Workbook coverage:**

- `00_READ_ME` - scope, sheet roster, import order, expected results, and intentional edge cases.
- `Sales_Main` - 72 rows, title rows above the real header, dates, text, numbers, booleans, country geography, cached formulas, blanks, and data-quality cases.
- `Sales_Extra` - 16 merge-compatible rows plus an extra `Campaign` column to trigger a missing-column warning.
- `Large_2601` - 2,601 rows for large-data import and scatter sampling coverage.
- `Expected_Results` - 20 deterministic checkpoints, including combined revenue `9,138,000`, margin `3,123,770`, on-time rate `79.1667%`, and two unmatched geography labels.

**Files changed:** `README.md`, `docs/imetrik-full-function-test.xlsx`, `tests/full-test-workbook-check.js`, `docs/REPO_SNAPSHOT.md`, `handoff/tasks/20260810_full-function-test-workbook.md`, `log/sessions/20260810_dev_docs_full-function-workbook.md`

**Verification:**

```text
> node tests/full-test-workbook-check.js
full-test-workbook-check passed

> node tests/map-check.js
map-check passed

> node tests/chart-lifecycle-check.js
chart-lifecycle-check passed

> node tests/smoke-check.js
smoke-check passed

> node --check <all non-archive JavaScript files>
syntax-check passed (34 files)

> git diff --check
exit code 0

Workbook parser/merge assertions:
- sheets: 00_READ_ME, Sales_Main, Sales_Extra, Large_2601, Expected_Results
- suggested Sales_Main header row: 4
- data rows: 72 + 16 = 88; large dataset = 2,601
- inferred types: date, text, number, boolean, numeric flag
- Sales_Main formula N5: L5-M5; cached result: 22,880
- merged datasets: 88 rows / 2 sources and 2,601 rows / 1 source
- warnings exercised: missing-column and blank
- formula error scan: 0
- workbook SHA-256: 379C751214CB1D3886D8CD9C0294989FBC0649966A95C8A0FB088C7DE5F4A829
```

**Deviations from Directive:** None.

**Open questions for Cowork:** None. The project owner will perform the later manual browser acceptance run.

**Risks/known gaps:** A single XLSX cannot emulate the browser folder picker's permission and multi-file selection flow. README therefore uses the existing two-file `sample-data/` pair for that isolated check and labels the boundary explicitly.
