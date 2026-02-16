## MODIFIED Requirements
### Requirement: Post-verification redirect
The system SHALL redirect verified users directly to their role destination without intermediate pages.

#### Scenario: Talent verification redirect
- **WHEN** a talent verifies their email successfully
- **THEN** the user is sent directly to the talent destination page

#### Scenario: Client verification redirect
- **WHEN** a client verifies their email successfully
- **THEN** the user is sent directly to the client destination page

### Requirement: Onboarding redirect
The system SHALL redirect users who still require onboarding directly to the onboarding page.

#### Scenario: Onboarding required after verification
- **WHEN** a verified user is marked as requiring onboarding
- **THEN** the user is sent directly to onboarding without visiting another page