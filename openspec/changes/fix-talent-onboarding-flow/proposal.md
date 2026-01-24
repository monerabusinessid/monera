# Change: Fix talent onboarding flow and profile persistence

## Why
Talent onboarding data is not persisting reliably and completed onboarding still redirects users back to onboarding instead of the talent dashboard.

## What Changes
- Define the talent onboarding completion criteria and persistence rules.
- Ensure onboarding completion routes talents to /talent with status "on review".
- Persist and surface all profile fields in the talent profile page after onboarding.

## Impact
- Affected specs: talent-onboarding
- Affected code: onboarding UI, profile APIs, auth redirect logic, talent profile page
