# Change: Improve Signup Authentication for Client and Talent

## Why
Currently, the signup flow supports both email/password registration and Google OAuth, but the implementation could be more unified and user-friendly. Users should be able to seamlessly sign up as either CLIENT or TALENT using either Google account or email/password, with clear role selection and proper profile initialization.

## What Changes
- **Unified signup flow** supporting both Google OAuth and email/password for CLIENT and TALENT roles
- **Improved role selection** during signup with clear UI indicators
- **Enhanced profile initialization** for both signup methods
- **Better error handling** and user feedback during signup process
- **Consistent user experience** across all signup methods

## Impact
- **Affected specs**: `auth` capability (new)
- **Affected code**: 
  - `app/api/auth/register/route.ts` - Email/password registration
  - `app/api/auth/google/route.ts` - Google OAuth registration
  - `app/register/page.tsx` - Signup UI
  - `lib/validations.ts` - Registration validation schemas
  - Database schema for `profiles` and `talent_profiles` tables
