# Change: Update talent portal UX flows and add saved jobs

## Why
Talent users are seeing jarring scroll positions, missing data bindings, and incomplete actions across jobs, profile, and settings. The experience needs consistent routing, layout spacing, and a way to save jobs.

## What Changes
- Align talent pages to scroll to top on navigation.
- Improve talent job list spacing, pagination, and dashboard recommendation click behavior.
- Fix talent profile header layout and bind overview fields to database data.
- Ensure profile action buttons (save/add) persist data reliably.
- Add saved jobs support and expose it in job details and dashboard.
- Ensure settings page actions persist and sync with database.
- Restore full footer on non-talent pages while keeping talent pages footer-free.

## Impact
- Affected specs: talent-portal, saved-jobs
- Affected code: talent dashboard, talent jobs list/details, talent profile, settings, shared layout/footer
- Data: new saved-jobs storage
