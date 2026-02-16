# Change: Fix auth redirect flow

## Why
After email verification and login, users briefly land on an intermediate page before being redirected to the intended destination, creating confusion and extra loading.

## What Changes
- Redirect verified users directly to their role landing page (talent/client) without intermediate pages
- When onboarding is required, redirect directly to onboarding instead of landing first

## Impact
- Affected specs: auth
- Affected code: verify email page, auth context, and role redirect helpers
