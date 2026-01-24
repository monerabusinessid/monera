## 1. Database Schema
- [x] 1.1 Add `email_verified` boolean field to `profiles` table (default: false)
- [x] 1.2 Add `verification_code` text field to `profiles` table (nullable)
- [x] 1.3 Add `verification_code_expires_at` timestamp field to `profiles` table (nullable)
- [x] 1.4 Create migration script for new columns
- [ ] 1.5 Update Prisma schema with new fields (optional - using Supabase directly)

## 2. OTP Code Generation
- [x] 2.1 Create utility function to generate 6-digit OTP code
- [x] 2.2 Implement code expiration logic (10 minutes)
- [x] 2.3 Add code hashing/storage logic
- [x] 2.4 Create function to validate code format

## 3. Email Service
- [x] 3.1 Create email verification template in `lib/email.ts`
- [x] 3.2 Add OTP code to email template
- [x] 3.3 Style email template with Monera branding
- [x] 3.4 Add email sending logic for verification codes

## 4. API Endpoints
- [x] 4.1 Modify `/api/auth/register` to generate and send OTP code
- [x] 4.2 Create `/api/auth/verify-email` endpoint to verify OTP code
- [x] 4.3 Create `/api/auth/resend-code` endpoint to resend verification code
- [x] 4.4 Add rate limiting for verification code requests
- [x] 4.5 Add validation for verification code format
- [x] 4.6 Handle expired codes and invalid attempts

## 5. Frontend - Registration Flow
- [x] 5.1 Modify registration form to show verification step after signup
- [x] 5.2 Create verification code input component
- [x] 5.3 Add "Resend code" button with countdown timer
- [x] 5.4 Show success message after verification
- [x] 5.5 Handle verification errors and expired codes
- [x] 5.6 Redirect to appropriate dashboard after verification

## 6. Frontend - Verification Page
- [x] 6.1 Create `/verify-email` page component
- [x] 6.2 Add email display (showing masked email)
- [x] 6.3 Add 6-digit code input with auto-focus
- [x] 6.4 Add "Resend code" functionality
- [x] 6.5 Add countdown timer for resend (60 seconds)
- [x] 6.6 Show verification status and errors

## 7. Validation & Security
- [ ] 7.1 Add verification code validation schema (Zod)
- [ ] 7.2 Implement rate limiting (max 3 attempts per code)
- [ ] 7.3 Add rate limiting for resend requests (max 3 per 10 minutes)
- [ ] 7.4 Add CSRF protection for verification endpoints
- [ ] 7.5 Implement code expiration check (10 minutes)

## 8. User Experience
- [ ] 8.1 Add loading states during verification
- [ ] 8.2 Show clear error messages for invalid/expired codes
- [ ] 8.3 Add success animation after verification
- [ ] 8.4 Handle edge cases (code expired, too many attempts)
- [ ] 8.5 Add email change option if wrong email entered

## 9. Testing
- [ ] 9.1 Test OTP code generation and expiration
- [ ] 9.2 Test email sending with verification code
- [ ] 9.3 Test verification with valid code
- [ ] 9.4 Test verification with invalid/expired code
- [ ] 9.5 Test resend code functionality
- [ ] 9.6 Test rate limiting for verification attempts
- [ ] 9.7 Test complete registration flow end-to-end

## 10. Documentation
- [ ] 10.1 Document email verification flow
- [ ] 10.2 Add API documentation for new endpoints
- [ ] 10.3 Create user guide for email verification
- [ ] 10.4 Document environment variables needed (SMTP config)
