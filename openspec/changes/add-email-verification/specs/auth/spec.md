# Email Verification Specification

## ADDED Requirements

### Requirement: Email Verification with OTP Code
The system SHALL require email verification with a one-time password (OTP) code before activating a new user account.

#### Scenario: User registers with email
- **WHEN** a user submits registration form with valid email and password
- **THEN** the system SHALL generate a 6-digit OTP code
- **AND** the system SHALL send the OTP code to the user's email address
- **AND** the system SHALL store the verification code with expiration time (10 minutes)
- **AND** the system SHALL create user account with `email_verified: false`
- **AND** the system SHALL redirect user to email verification page

#### Scenario: User verifies email with correct code
- **WHEN** a user enters the correct 6-digit OTP code within 10 minutes
- **THEN** the system SHALL verify the code matches the stored code
- **AND** the system SHALL check that the code has not expired
- **AND** the system SHALL update user profile to `email_verified: true`
- **AND** the system SHALL clear the verification code from database
- **AND** the system SHALL log the user in automatically
- **AND** the system SHALL redirect user to their dashboard

#### Scenario: User enters incorrect verification code
- **WHEN** a user enters an incorrect OTP code
- **THEN** the system SHALL display error message "Invalid verification code"
- **AND** the system SHALL allow user to retry (max 3 attempts)
- **AND** the system SHALL track failed attempts
- **AND** after 3 failed attempts, the system SHALL require user to request a new code

#### Scenario: Verification code expires
- **WHEN** a user attempts to verify with a code that is older than 10 minutes
- **THEN** the system SHALL display error message "Verification code has expired"
- **AND** the system SHALL provide option to request a new code
- **AND** the system SHALL clear the expired code from database

#### Scenario: User requests resend verification code
- **WHEN** a user clicks "Resend code" button
- **THEN** the system SHALL check rate limit (max 3 resends per 10 minutes)
- **AND** if within limit, the system SHALL generate a new 6-digit OTP code
- **AND** the system SHALL send the new code to user's email
- **AND** the system SHALL update the stored code and expiration time
- **AND** the system SHALL show countdown timer (60 seconds before next resend allowed)
- **AND** if rate limit exceeded, the system SHALL display "Too many requests. Please try again later"

#### Scenario: User completes verification after registration
- **WHEN** a user successfully verifies their email
- **THEN** the system SHALL activate the user account
- **AND** the system SHALL set `email_verified: true` in user profile
- **AND** the system SHALL automatically log the user in
- **AND** the system SHALL redirect to appropriate dashboard based on role (TALENT → `/talent`, CLIENT → `/client`)

### Requirement: OTP Code Format and Security
The system SHALL generate secure 6-digit numeric OTP codes with proper expiration and rate limiting.

#### Scenario: OTP code generation
- **WHEN** a verification code is generated
- **THEN** the code SHALL be exactly 6 digits (000000-999999)
- **AND** the code SHALL be randomly generated (cryptographically secure)
- **AND** the code SHALL be stored in database with expiration timestamp
- **AND** the code SHALL expire after 10 minutes from generation

#### Scenario: Rate limiting for verification attempts
- **WHEN** a user attempts to verify email
- **THEN** the system SHALL allow maximum 3 verification attempts per code
- **AND** after 3 failed attempts, the system SHALL require a new code
- **AND** the system SHALL track failed attempts per code

#### Scenario: Rate limiting for resend requests
- **WHEN** a user requests to resend verification code
- **THEN** the system SHALL allow maximum 3 resend requests per 10 minutes per email
- **AND** if limit exceeded, the system SHALL return error "Too many requests"
- **AND** the system SHALL show countdown timer indicating when next resend is allowed

### Requirement: Email Verification UI
The system SHALL provide a user-friendly interface for email verification.

#### Scenario: Verification page display
- **WHEN** a user is redirected to verification page after registration
- **THEN** the page SHALL display the user's email address (masked, e.g., "j***@example.com")
- **AND** the page SHALL display input field for 6-digit code
- **AND** the page SHALL display "Resend code" button with countdown timer
- **AND** the page SHALL show instructions to check email inbox

#### Scenario: Code input interaction
- **WHEN** a user types in the verification code input
- **THEN** the input SHALL accept only numeric digits (0-9)
- **AND** the input SHALL limit to 6 characters maximum
- **AND** the input SHALL auto-submit when 6 digits are entered
- **AND** the input SHALL show loading state during verification

#### Scenario: Resend code functionality
- **WHEN** a user clicks "Resend code" button
- **THEN** the button SHALL be disabled during request
- **AND** the button SHALL show countdown timer (60 seconds) after successful resend
- **AND** the system SHALL display success message "New code sent to your email"
- **AND** the system SHALL handle errors if resend fails

### Requirement: Email Template for Verification
The system SHALL send a well-formatted email containing the verification code.

#### Scenario: Verification email sent
- **WHEN** a verification code is generated
- **THEN** the system SHALL send email to user's registered email address
- **AND** the email SHALL contain the 6-digit verification code
- **AND** the email SHALL include Monera branding and styling
- **AND** the email SHALL include instructions on how to use the code
- **AND** the email SHALL mention code expiration time (10 minutes)
- **AND** the email SHALL include link to verification page as alternative

## MODIFIED Requirements

### Requirement: User Registration Flow
The user registration flow SHALL be modified to include email verification step before account activation.

#### Scenario: Registration with email verification
- **WHEN** a user completes registration form
- **THEN** the system SHALL create user account with `email_verified: false`
- **AND** the system SHALL generate and send verification code
- **AND** the system SHALL NOT log the user in immediately
- **AND** the system SHALL redirect to email verification page
- **AND** the user SHALL be required to verify email before accessing dashboard

#### Scenario: Unverified user attempts to login
- **WHEN** a user with unverified email attempts to login
- **THEN** the system SHALL check `email_verified` status
- **AND** if `email_verified: false`, the system SHALL redirect to verification page
- **AND** the system SHALL display message "Please verify your email to continue"
- **AND** the system SHALL allow user to request new verification code
