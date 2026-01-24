# Authentication Specification

## ADDED Requirements

### Requirement: User Signup with Email and Password
The system SHALL allow users to create accounts using email and password for both CLIENT and TALENT roles.

#### Scenario: TALENT signup with email/password
- **WHEN** a user submits valid email, password, and selects TALENT role
- **THEN** the system creates a user account in Supabase Auth
- **AND** creates a profile entry in `profiles` table with role='TALENT'
- **AND** creates a talent profile entry in `talent_profiles` table
- **AND** sets initial status to 'DRAFT' for talent profile
- **AND** sets profile_completion to 0
- **AND** returns authentication token
- **AND** redirects user to talent onboarding page

#### Scenario: CLIENT signup with email/password
- **WHEN** a user submits valid email, password, and selects CLIENT role
- **THEN** the system creates a user account in Supabase Auth
- **AND** creates a profile entry in `profiles` table with role='CLIENT'
- **AND** sets initial status to 'ACTIVE' for client profile
- **AND** returns authentication token
- **AND** redirects user to client dashboard

#### Scenario: Signup with duplicate email
- **WHEN** a user attempts to signup with an email that already exists
- **THEN** the system returns an error message indicating email already exists
- **AND** suggests user to login instead
- **AND** does not create duplicate accounts

#### Scenario: Signup with invalid email format
- **WHEN** a user submits an invalid email format
- **THEN** the system returns validation error
- **AND** does not proceed with account creation

#### Scenario: Signup with weak password
- **WHEN** a user submits a password that doesn't meet security requirements
- **THEN** the system returns validation error with password requirements
- **AND** does not proceed with account creation

### Requirement: User Signup with Google OAuth
The system SHALL allow users to create accounts using Google OAuth for both CLIENT and TALENT roles.

#### Scenario: TALENT signup with Google OAuth
- **WHEN** a user clicks "Sign up with Google" and selects TALENT role
- **THEN** the system redirects to Google OAuth consent screen
- **AND** after Google authentication, creates user account in Supabase Auth
- **AND** creates profile entry in `profiles` table with role='TALENT'
- **AND** populates full_name from Google profile
- **AND** populates avatar_url from Google profile picture
- **AND** creates talent profile entry in `talent_profiles` table
- **AND** sets initial status to 'DRAFT' for talent profile
- **AND** sets profile_completion to 0
- **AND** returns authentication token
- **AND** redirects user to talent onboarding page

#### Scenario: CLIENT signup with Google OAuth
- **WHEN** a user clicks "Sign up with Google" and selects CLIENT role
- **THEN** the system redirects to Google OAuth consent screen
- **AND** after Google authentication, creates user account in Supabase Auth
- **AND** creates profile entry in `profiles` table with role='CLIENT'
- **AND** populates full_name from Google profile
- **AND** populates avatar_url from Google profile picture
- **AND** sets initial status to 'ACTIVE' for client profile
- **AND** returns authentication token
- **AND** redirects user to client dashboard

#### Scenario: Google OAuth signup with existing email
- **WHEN** a user attempts Google OAuth signup with an email that already exists in Auth
- **AND** profile exists in `profiles` table
- **THEN** the system logs the user in instead of creating new account
- **AND** redirects to appropriate dashboard based on role

#### Scenario: Google OAuth signup with orphaned account
- **WHEN** a user attempts Google OAuth signup with an email that exists in Auth but not in `profiles`
- **THEN** the system creates profile entry in `profiles` table
- **AND** creates appropriate role-specific profile (talent_profiles or recruiter_profiles)
- **AND** completes signup process

### Requirement: Role Selection During Signup
The system SHALL require users to select their role (CLIENT or TALENT) during signup.

#### Scenario: Role selection in email/password signup
- **WHEN** a user accesses signup page
- **THEN** the system displays clear role selection options (CLIENT/TALENT)
- **AND** validates that a role is selected before submission
- **AND** passes role information to registration API

#### Scenario: Role selection in Google OAuth signup
- **WHEN** a user clicks "Sign up with Google"
- **THEN** the system captures role selection before OAuth redirect
- **AND** includes role in OAuth state parameter
- **AND** uses role information when creating account after OAuth callback

#### Scenario: Role selection via URL parameter
- **WHEN** a user accesses signup page with `?role=CLIENT` or `?role=TALENT` parameter
- **THEN** the system pre-selects the specified role
- **AND** allows user to change selection if needed

### Requirement: Profile Initialization
The system SHALL properly initialize user profiles based on selected role during signup.

#### Scenario: TALENT profile initialization
- **WHEN** a TALENT user completes signup
- **THEN** the system creates entry in `talent_profiles` table
- **AND** sets status to 'DRAFT'
- **AND** sets profile_completion to 0
- **AND** initializes all profile fields as null or default values
- **AND** creates empty skill associations

#### Scenario: CLIENT profile initialization
- **WHEN** a CLIENT user completes signup
- **THEN** the system creates entry in `profiles` table with role='CLIENT'
- **AND** sets status to 'ACTIVE'
- **AND** user can immediately access client dashboard
- **AND** can post jobs without additional onboarding

### Requirement: Email Verification
The system SHALL handle email verification appropriately for different signup methods.

#### Scenario: Email verification for email/password signup
- **WHEN** a user signs up with email/password in production
- **THEN** the system sends email verification link
- **AND** requires email verification before full account activation
- **AND** in development, auto-confirms email for testing

#### Scenario: Email verification for Google OAuth signup
- **WHEN** a user signs up with Google OAuth
- **THEN** the system auto-confirms email (Google already verified)
- **AND** user can immediately access their dashboard

### Requirement: Error Handling and User Feedback
The system SHALL provide clear error messages and feedback during signup process.

#### Scenario: Network error during signup
- **WHEN** network error occurs during signup
- **THEN** the system displays user-friendly error message
- **AND** allows user to retry signup
- **AND** does not create partial accounts

#### Scenario: Validation error display
- **WHEN** user submits invalid signup data
- **THEN** the system displays specific validation errors
- **AND** highlights fields with errors
- **AND** provides guidance on how to fix errors

#### Scenario: OAuth error handling
- **WHEN** Google OAuth fails or is cancelled
- **THEN** the system redirects back to signup page
- **AND** displays appropriate error message
- **AND** allows user to retry or use email/password signup
