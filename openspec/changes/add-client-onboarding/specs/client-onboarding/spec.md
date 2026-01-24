## ADDED Requirements
### Requirement: Client onboarding persistence
The system SHALL persist client onboarding data and completion status in a single source of truth.

#### Scenario: Save onboarding data
- **WHEN** a client submits onboarding information
- **THEN** the system stores the data and marks onboarding as complete

### Requirement: Client onboarding redirect
The system SHALL route clients with completed onboarding to /client after login.

#### Scenario: Completed onboarding login
- **WHEN** a client logs in with completed onboarding status
- **THEN** the system redirects the client to /client
