## ADDED Requirements

### Requirement: Store first and last name on profiles
The system SHALL store `first_name` and `last_name` in the `profiles` table alongside `full_name`.

#### Scenario: Saving profile names
- **WHEN** a user saves profile data with first and last name
- **THEN** the system stores `first_name` and `last_name` and preserves `full_name`

### Requirement: Return first and last name in profile API
The system SHALL return `first_name` and `last_name` in the profile API response.

#### Scenario: Fetching profile data
- **WHEN** the client requests `/api/user/profile`
- **THEN** the response includes `first_name` and `last_name`

## MODIFIED Requirements

### Requirement: Name mapping in profile UI
The system SHALL prefer `first_name` and `last_name` for display and editing, and fall back to `full_name` when missing.

#### Scenario: Rendering profile form
- **WHEN** the profile UI loads
- **THEN** it populates first/last name from `first_name`/`last_name` if available, otherwise splits `full_name`
