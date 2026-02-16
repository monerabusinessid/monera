# Change: Add first_name and last_name to profiles

## Why
Talent profile UI needs first and last name fields to persist reliably and map directly to the database, instead of inferring from full_name.

## What Changes
- Add `first_name` and `last_name` columns to `profiles`.
- Update profile read/write APIs to include the new columns.
- Update talent profile UI mapping to use the new columns (fallback to `full_name`).
- Keep `full_name` for backward compatibility.

## Impact
- Affected specs: profile (new), auth (no change)
- Affected code: profile API routes, talent profile UI, DB migration
