## Context
Talent onboarding should collect profile data once, persist it, and allow the talent to access the dashboard with "on review" status after submission.

## Goals / Non-Goals
- Goals: onboarding completion persists; dashboard accessible after submission; profile page shows all submitted fields.
- Non-Goals: redesign of onboarding UI; new role/permission changes.

## Decisions
- Decision: use talent_profiles as the source of truth for onboarding status and fields.
- Decision: treat SUBMITTED as "on review" and allow /talent access.

## Risks / Trade-offs
- Risk: mismatched user IDs between auth and talent_profiles -> Mitigation: enforce consistent user_id usage.
- Risk: missing legacy fields -> Mitigation: allow nulls and display fallback values.

## Migration Plan
- Backfill missing talent_profiles records if needed.
- Deploy API changes before redirect logic.

## Open Questions
- Field completion: All onboarding fields are required for completion.
- Access behavior: Incomplete profiles must stay on onboarding; SUBMITTED (not yet approved) can access /talent.
