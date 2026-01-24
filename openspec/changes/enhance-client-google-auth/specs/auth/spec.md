# Authentication Specification

## MODIFIED Requirements

### Requirement: User Signup with Google OAuth
The system SHALL allow users to create accounts using Google OAuth for both CLIENT and TALENT roles, with immediate authentication recognition and seamless redirect to appropriate dashboard.

#### Scenario: CLIENT signup with Google OAuth
- **WHEN** a user clicks "Sign up with Google" and selects CLIENT role
- **THEN** the system redirects to Google OAuth consent screen
- **AND** after Google authentication, creates user account in Supabase Auth
- **AND** creates profile entry in `profiles` table with role='CLIENT'
- **AND** populates full_name from Google profile
- **AND** creates recruiter profile entry in `recruiter_profiles` table if company name provided
- **AND** sets initial status to 'ACTIVE' for client profile
- **AND** generates JWT authentication token
- **AND** sets auth-token cookie in response
- **AND** stores user data in sessionStorage before redirect
- **AND** redirects user directly to client dashboard (/client)
- **AND** auth context recognizes user immediately from sessionStorage
- **AND** user can immediately access dashboard without additional login

#### Scenario: CLIENT login with Google OAuth
- **WHEN** an existing CLIENT user clicks "Login with Google"
- **THEN** the system redirects to Google OAuth consent screen
- **AND** after Google authentication, verifies user exists in Supabase Auth
- **AND** verifies user has CLIENT role in profiles table
- **AND** generates JWT authentication token
- **AND** sets auth-token cookie in response
- **AND** stores user data in sessionStorage before redirect
- **AND** redirects user directly to client dashboard (/client)
- **AND** auth context recognizes user immediately from sessionStorage
- **AND** user can immediately access dashboard

#### Scenario: TALENT signup with Google OAuth
- **WHEN** a user clicks "Sign up with Google" and selects TALENT role
- **THEN** the system redirects to Google OAuth consent screen
- **AND** after Google authentication, creates user account in Supabase Auth
- **AND** creates profile entry in `profiles` table with role='TALENT'
- **AND** populates full_name from Google profile
- **AND** creates talent profile entry in `talent_profiles` table
- **AND** sets initial status to 'DRAFT' for talent profile
- **AND** sets profile_completion to 0
- **AND** generates JWT authentication token
- **AND** sets auth-token cookie in response
- **AND** stores user data in sessionStorage before redirect
- **AND** redirects user to talent onboarding page (/talent/onboarding)
- **AND** auth context recognizes user immediately from sessionStorage

#### Scenario: Google OAuth signup with existing email
- **WHEN** a user attempts Google OAuth signup with an email that already exists in Auth
- **AND** profile exists in `profiles` table
- **THEN** the system logs the user in instead of creating new account
- **AND** generates JWT authentication token
- **AND** sets auth-token cookie in response
- **AND** stores user data in sessionStorage before redirect
- **AND** redirects to appropriate dashboard based on role
- **AND** auth context recognizes user immediately from sessionStorage

#### Scenario: Google OAuth signup with orphaned account
- **WHEN** a user attempts Google OAuth signup with an email that exists in Auth but not in `profiles`
- **THEN** the system creates profile entry in `profiles` table
- **AND** creates appropriate role-specific profile (talent_profiles or recruiter_profiles) based on role from OAuth state
- **AND** generates JWT authentication token
- **AND** sets auth-token cookie in response
- **AND** stores user data in sessionStorage before redirect
- **AND** completes signup process
- **AND** redirects to appropriate dashboard based on role

#### Scenario: Google OAuth error handling
- **WHEN** Google OAuth fails or is cancelled
- **THEN** the system redirects back to signup/login page
- **AND** displays appropriate error message
- **AND** allows user to retry or use email/password signup
- **AND** does not create partial accounts

#### Scenario: OAuth callback with sessionStorage
- **WHEN** OAuth callback receives authentication token
- **THEN** the system sets auth-token cookie via API
- **AND** waits for cookie to be set (2 seconds delay)
- **AND** fetches user data from /api/auth/me with retry logic
- **AND** stores user data in sessionStorage with key 'oauth_user'
- **AND** dispatches storage event to trigger auth context refresh
- **AND** performs hard redirect (window.location.replace) to appropriate dashboard
- **AND** auth context checks sessionStorage on mount and sets user immediately

## ADDED Requirements

### Requirement: SessionStorage for OAuth User Data
The system SHALL use sessionStorage to temporarily store user data during OAuth redirect to ensure immediate authentication recognition.

#### Scenario: SessionStorage storage during OAuth
- **WHEN** OAuth callback successfully authenticates user
- **THEN** the system stores user data (id, email, role, name, status) in sessionStorage with key 'oauth_user'
- **AND** stores data before performing redirect
- **AND** auth context checks sessionStorage on mount
- **AND** if sessionStorage data exists, sets user immediately and sets loading to false
- **AND** clears sessionStorage after using the data
- **AND** still fetches from API for latest data but doesn't block on it

#### Scenario: Auth context sessionStorage check
- **WHEN** auth context initializes
- **AND** hasCheckedAuth is false
- **THEN** the system checks sessionStorage for 'oauth_user' key
- **AND** if found, parses JSON data and sets user state
- **AND** sets hasCheckedAuth to true
- **AND** sets loading to false
- **AND** clears sessionStorage after using
- **AND** fetches from API in background for latest data

### Requirement: Client Dashboard Auth Check
The system SHALL properly handle authentication check in client dashboard to prevent premature redirect to login page.

#### Scenario: Client dashboard auth loading
- **WHEN** client dashboard page loads
- **AND** auth context is still loading
- **THEN** the system waits for loading to complete
- **AND** if loading persists, fetches directly from /api/auth/me with 500ms delay
- **AND** if user is authenticated as CLIENT, proceeds to display dashboard
- **AND** if user is not CLIENT, redirects to appropriate page based on role
- **AND** if no user found after 2 seconds delay, redirects to login
- **AND** shows loading state while auth is being checked

#### Scenario: Client dashboard with sessionStorage user
- **WHEN** client dashboard page loads
- **AND** sessionStorage contains OAuth user data
- **THEN** auth context recognizes user from sessionStorage immediately
- **AND** dashboard displays without redirect to login
- **AND** user can immediately access dashboard features

### Requirement: Email/Password Signup with SessionStorage
The system SHALL use sessionStorage for email/password signup to ensure consistent authentication experience.

#### Scenario: CLIENT signup with email/password and sessionStorage
- **WHEN** a CLIENT user signs up with email/password
- **AND** registration is successful
- **THEN** the system stores user data in sessionStorage immediately after receiving response
- **AND** waits for cookie to be set (1 second delay)
- **AND** verifies cookie with optional retry
- **AND** performs hard redirect to client dashboard
- **AND** auth context recognizes user from sessionStorage immediately
- **AND** user can immediately access dashboard without additional login
