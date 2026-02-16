# Change: Update talent profile and onboarding field sync

## Why
Talent profile fields are inconsistent between onboarding, profile UI, and database, causing missing data and confusing inputs.

## What Changes
- Align onboarding to first name and last name fields (store as full name and sync to profile tables)
- Align profile UI fields with onboarding and database mappings
- Use a single hourly rate field (remove hours-per-week UI usage)
- Ensure country, timezone, phone, and location map correctly to the database
- Replace intro video URL display with local upload-only UI (no raw URL shown)

## Impact
- Affected specs: talent-profile
- Affected code: onboarding, profile pages, profile submit API
