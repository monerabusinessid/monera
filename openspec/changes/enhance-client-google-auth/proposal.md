# Change: Enhance Client Google Authentication Flow

## Why
Currently, CLIENT users can sign up and login via Google OAuth, but the flow has some issues:
- Users are sometimes redirected to login page after successful Google signup, requiring them to login again
- The authentication state is not immediately recognized after OAuth callback
- Session management could be more robust for CLIENT users
- Error handling for CLIENT-specific OAuth scenarios needs improvement

This change aims to ensure a seamless Google authentication experience for CLIENT users, matching the successful flow already implemented for TALENT users.

## What Changes
- **Improved OAuth callback handling** for CLIENT users to ensure immediate authentication recognition
- **SessionStorage integration** to store temporary user data during OAuth redirect, ensuring auth context recognizes user immediately
- **Enhanced auth context** to check sessionStorage and fetch directly from API when loading
- **Consistent redirect flow** for CLIENT users after Google signup/login, directly to client dashboard without intermediate login page
- **Better error handling** for CLIENT-specific OAuth errors and edge cases
- **Unified authentication flow** between email/password and Google OAuth for CLIENT users

## Impact
- **Affected specs**: `auth` capability
- **Affected code**: 
  - `app/api/auth/google/route.ts` - Google OAuth registration/login
  - `app/auth/callback/page.tsx` - OAuth callback handling
  - `app/client/page.tsx` - Client dashboard auth check
  - `app/register/page.tsx` - Signup page with Google OAuth
  - `app/login/page.tsx` - Login page with Google OAuth
  - `lib/auth-context.tsx` - Auth context with sessionStorage support
  - `app/api/auth/set-cookie/route.ts` - Cookie setting for OAuth
