# Session: [AUTO] Legacy governance migration

**Date:** 2026-08-10
**Mode:** dev
**Type:** refactor
**Area:** repository governance
**Result:** pass
**Files changed:** `.gitignore`, `docs/REPO_SNAPSHOT.md`, `handoff/tasks/`, `log/`, `memory/`

## What happened

The user authorized replacing the legacy coordination layout with the approved one-task/one-file model. Four superseded documents were moved unchanged into `memory/source/legacy/`, canonical governance folders were created, and their old ignore rules were removed.

## Decision

Historical prompts and the closed v1 blueprint remain available as immutable human-curated source material. Application source was not archived or duplicated; Git remains the rollback mechanism for retired code.

