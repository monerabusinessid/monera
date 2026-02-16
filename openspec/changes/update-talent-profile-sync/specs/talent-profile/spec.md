## ADDED Requirements
### Requirement: Talent profile field synchronization
The system SHALL keep onboarding and profile fields synchronized with the database for full name, country, timezone, phone, and location.

#### Scenario: Onboarding submit persists synced fields
- **WHEN** a talent submits onboarding with first name, last name, country, timezone, phone, or location
- **THEN** the profile data is stored and later shown in the profile overview fields

### Requirement: Single rate field
The system SHALL collect and display only an hourly rate for talent profiles.

#### Scenario: Profile overview shows hourly rate only
- **WHEN** the profile overview is displayed
- **THEN** only the hourly rate field is available and hours-per-week is not shown

### Requirement: Intro video upload without URL exposure
The system SHALL allow uploading an intro video without displaying the raw storage URL.

#### Scenario: Intro video upload UI
- **WHEN** a talent uploads an intro video
- **THEN** the UI confirms the upload without showing the storage URL