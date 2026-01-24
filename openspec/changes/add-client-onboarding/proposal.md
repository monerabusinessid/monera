# Change: Add client onboarding flow

## Why
Client onboarding data is not persisting reliably, leading to repeat onboarding and inconsistent client readiness.

## What Changes
- Define a dedicated client onboarding flow and completion criteria.
- Persist client onboarding data and status in a single source of truth.
- Ensure login redirects honor completed onboarding and go to /client.

## Impact
- Affected specs: client-onboarding
- Affected code: client onboarding UI, profile APIs, auth redirect logic
