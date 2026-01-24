## Context
This change adds destructive actions in admin panels, introduces a new details view, and targets mobile UX and loading performance.

## Goals / Non-Goals
- Goals: safe delete workflows, details page availability, improved mobile experience, faster perceived and actual load times.
- Non-Goals: broad redesign of unrelated pages; new admin roles or permissions model.

## Decisions
- Decision: Use confirmation dialogs and server-side authorization checks for delete actions.
- Decision: Keep details page routing within the existing talent review menu structure.
- Decision: Prioritize responsive layout adjustments over visual redesign.

## Risks / Trade-offs
- Accidental data loss if delete semantics are unclear -> confirm soft vs hard delete and add confirmation.
- Performance changes could impact unrelated pages -> limit scope to affected endpoints and add regression checks.

## Migration Plan
- Deploy UI changes after backend endpoints are verified.
- Backfill or log deletions as needed depending on delete semantics.

## Open Questions
- Which specific admin panels and entities require delete actions?
- Should delete be soft-delete with restore, or hard-delete?
- Which pages are highest priority for mobile optimization?
- Which endpoints/queries are currently slow or heavy?
