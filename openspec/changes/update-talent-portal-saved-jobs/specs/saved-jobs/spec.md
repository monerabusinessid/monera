## ADDED Requirements
### Requirement: Saved Jobs
The system SHALL allow a talent user to save and unsave jobs and persist the saved state.

#### Scenario: Save a job
- **WHEN** a talent user saves a job from the job details page
- **THEN** the system stores a saved job record tied to the user and job

#### Scenario: Unsave a job
- **WHEN** a talent user unsaves a job
- **THEN** the system removes the saved job record

#### Scenario: Saved jobs count
- **WHEN** the talent dashboard loads
- **THEN** the saved jobs count reflects saved records for the user
