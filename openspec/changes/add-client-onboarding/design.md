## Context
Client onboarding currently reappears after completion, indicating data persistence or status detection issues.

## Goals / Non-Goals
- Goals: single source of truth for onboarding data; correct redirect behavior after completion.
- Non-Goals: redesign of client onboarding UI or changes to unrelated auth flows.

## Decisions
- Decision: store onboarding completion status in a dedicated field within client profile data.
- Decision: always read onboarding status from the server API before redirecting.

## Risks / Trade-offs
- Risk: legacy records missing onboarding fields -> Mitigation: treat missing as incomplete and allow re-save.
- Risk: multiple data sources for onboarding -> Mitigation: deprecate secondary fields and read only from the source-of-truth.

## Migration Plan
- Backfill onboarding status for existing clients if needed.
- Deploy API changes before redirect logic updates.

## Open Questions
- Where should client onboarding data live: recruiter_profiles, profiles, or a new table?
- What exact fields define completion (companyName, website, description, etc.)?
- Should incomplete clients be blocked from /client or shown a banner?
