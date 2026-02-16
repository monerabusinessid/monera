## Context
This change spans talent-facing UX flows and introduces a saved jobs feature. It requires new storage and API wiring, plus UI adjustments in multiple talent pages.

## Goals / Non-Goals
- Goals:
  - Consistent scroll-to-top behavior on talent page navigation.
  - Job lists with clear spacing and pagination.
  - Clickable dashboard recommendation cards.
  - Profile header layout aligned to design with correct data binding.
  - Working save/add actions for profile sections.
  - Saved jobs backed by DB and visible in UI.
  - Settings page actions wired to DB fields.
- Non-Goals:
  - Redesigning talent layouts beyond requested fixes.
  - Changing existing job or profile data models (except saved jobs table).

## Decisions
- Decision: Add a dedicated saved-jobs table keyed by user/job IDs.
- Decision: Centralize saved job read/write in dedicated API routes to keep UI thin.
- Decision: Use client-side scroll restoration on talent routes to force top on navigation.

## Risks / Trade-offs
- Adding a new table requires coordination with DB migrations or Supabase SQL.
- Multiple page changes increase regression risk; will test navigation flows manually.

## Migration Plan
1) Create saved-jobs table.
2) Deploy API routes.
3) Update UI and test save/unsave behavior.
4) Verify dashboard counts.

## Open Questions
- None.
