## ADDED Requirements
### Requirement: Talent onboarding completion
The system SHALL mark talent onboarding as complete when required fields are submitted and set status to SUBMITTED.

#### Scenario: Submit onboarding
- **WHEN** a talent submits onboarding data
- **THEN** the system saves all fields and sets status to SUBMITTED

### Requirement: Talent dashboard access after submission
The system SHALL allow talents with SUBMITTED status to access /talent and show "on review" status.

#### Scenario: Access dashboard after submission
- **WHEN** a talent with SUBMITTED status visits /talent
- **THEN** the dashboard loads and shows an on-review status

### Requirement: Profile data visibility
The system SHALL display all submitted onboarding fields on the talent profile page.

#### Scenario: View profile after onboarding
- **WHEN** a talent opens the profile page
- **THEN** all submitted fields are visible with their saved values
