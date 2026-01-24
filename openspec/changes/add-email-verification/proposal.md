# Change: Add Email Verification with OTP Code

## Why
Currently, users can register with any email address without verification. This creates several issues:
- Users may register with invalid or non-existent email addresses
- No way to verify email ownership before account activation
- Potential for spam accounts and fake registrations
- Security risk: users can't recover accounts if email is incorrect

Adding email verification with OTP (One-Time Password) code will:
- Ensure email addresses are valid and owned by the user
- Reduce spam and fake account registrations
- Improve account security and recovery options
- Provide better user experience with clear verification flow

## What Changes
- **OTP Code Generation**: Generate 6-digit verification code when user registers
- **Email Sending**: Send verification code to user's email address
- **Verification Endpoint**: Create API endpoint to verify OTP code
- **Database Schema**: Add `email_verified` and `verification_code` fields to user profiles
- **Registration Flow**: Modify registration to require email verification before account activation
- **Resend Code**: Allow users to request new verification code if expired or not received
- **Code Expiration**: Implement 10-minute expiration for verification codes
- **Rate Limiting**: Add rate limiting for verification code requests (prevent abuse)
- **UI Components**: Add verification code input form and resend functionality
- **Status Tracking**: Track verification status in user profile

## Impact
- **Affected specs**: `auth` capability
- **Affected code**: 
  - `app/api/auth/register/route.ts` - Registration endpoint (modify to send OTP)
  - `app/api/auth/verify-email/route.ts` - New verification endpoint
  - `app/api/auth/resend-code/route.ts` - New resend code endpoint
  - `app/register/page.tsx` - Registration form (add verification step)
  - `app/verify-email/page.tsx` - New verification page
  - `lib/email.ts` - Email service (add verification email template)
  - `lib/validations.ts` - Add verification code schema
  - Database schema - Add `email_verified` and `verification_code` columns
  - `prisma/schema.prisma` - Update User/Profile model
