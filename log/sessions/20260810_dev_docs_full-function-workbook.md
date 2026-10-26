# Session: [AUTO] Full-function workbook and test guide

**Date:** 2026-08-10
**Mode:** dev
**Type:** feature
**Area:** docs and test fixtures
**Result:** pass
**Files changed:** `README.md`, `docs/imetrik-full-function-test.xlsx`, `tests/full-test-workbook-check.js`, `docs/REPO_SNAPSHOT.md`, `handoff/tasks/20260810_full-function-test-workbook.md`, `log/sessions/20260810_dev_docs_full-function-workbook.md`

## What happened

Created one polished multi-sheet workbook that covers iMetriK's import, type inference, merge, data-quality, visual, map, formula, filter, aggregation, and large-data paths. README now provides the owner's later manual acceptance sequence and deterministic expected values. A regression test verifies the binary fixture through the application's real parser and merge engine.

## Decision

Used one workbook for data-driven coverage and retained the existing two-file `sample-data/` pair only for the browser folder-selection check, because a single workbook cannot reproduce a multi-file permission flow. Included numeric 0/1 flag fields alongside booleans so `% Yes` can be selected as a measure while boolean dimensions remain available for filtering.

## Rule learned

None.
