# Testing Guide: Signup Authentication Implementation

This document outlines test cases and validation steps for the improved signup authentication flow.

## Test Environment Setup

1. Ensure Supabase is configured with:
   - Google OAuth provider enabled
   - Email verification settings configured (auto-confirm in development)
   - Storage buckets created (`avatars` bucket)

2. Database tables should exist:
   - `profiles`
   - `talent_profiles`
   - `recruiter_profiles`
   - `companies`

## Test Cases

### 1. Email/Password Signup - TALENT Role

**Test Steps:**
1. Navigate to `/register`
2. Select "Talent" role
3. Enter valid email and password (min 8 characters)
4. Click "Sign Up"

**Expected Results:**
- ✅ User account created in Supabase Auth
- ✅ Profile created in `profiles` table with `role='TALENT'`
- ✅ Talent profile created in `talent_profiles` table
- ✅ Talent profile has `status='DRAFT'` and `profile_completion=0`
- ✅ User redirected to `/talent/onboarding`
- ✅ Auth token set in cookie

**Validation Queries:**
```sql
-- Check profile
SELECT id, role, status FROM profiles WHERE email = 'test-talent@example.com';

-- Check talent profile
SELECT user_id, status, profile_completion FROM talent_profiles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-talent@example.com');
```

### 2. Email/Password Signup - CLIENT Role

**Test Steps:**
1. Navigate to `/register`
2. Select "Client / Company" role
3. Enter valid email, password, and company name
4. Click "Sign Up"

**Expected Results:**
- ✅ User account created in Supabase Auth
- ✅ Profile created in `profiles` table with `role='CLIENT'`
- ✅ Recruiter profile created in `recruiter_profiles` table
- ✅ Company created or linked in `companies` table
- ✅ User redirected to `/client` dashboard
- ✅ Auth token set in cookie

**Validation Queries:**
```sql
-- Check profile
SELECT id, role, status FROM profiles WHERE email = 'test-client@example.com';

-- Check recruiter profile
SELECT user_id, company_id FROM recruiter_profiles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test-client@example.com');

-- Check company
SELECT id, name FROM companies WHERE name = 'Test Company';
```

### 3. Google OAuth Signup - TALENT Role

**Test Steps:**
1. Navigate to `/register`
2. Select "Talent" role
3. Click "Sign up with Google"
4. Complete Google OAuth flow

**Expected Results:**
- ✅ User account created in Supabase Auth
- ✅ Profile created with `full_name` from Google
- ✅ Profile has `avatar_url` from Google picture
- ✅ Profile has `role='TALENT'`
- ✅ Talent profile created with `status='DRAFT'` and `profile_completion=0`
- ✅ User redirected to `/talent/onboarding`

**Validation Queries:**
```sql
-- Check profile with Google data
SELECT id, role, full_name, avatar_url FROM profiles 
WHERE email = 'google-talent@example.com';
```

### 4. Google OAuth Signup - CLIENT Role

**Test Steps:**
1. Navigate to `/register`
2. Select "Client / Company" role
3. Click "Sign up with Google"
4. Complete Google OAuth flow

**Expected Results:**
- ✅ User account created in Supabase Auth
- ✅ Profile created with `full_name` and `avatar_url` from Google
- ✅ Profile has `role='CLIENT'`
- ✅ Recruiter profile created
- ✅ User redirected to `/client` dashboard

### 5. Duplicate Email Handling

**Test Steps:**
1. Sign up with email `test@example.com` as TALENT
2. Try to sign up again with same email as CLIENT

**Expected Results:**
- ✅ Error message: "An account with this email already exists. Please sign in instead or use a different email address."
- ✅ No duplicate accounts created
- ✅ Original account remains unchanged

### 6. Invalid Role Handling

**Test Steps:**
1. Navigate to `/register`
2. Try to submit form without selecting role
3. Try to submit with invalid role via API directly

**Expected Results:**
- ✅ Frontend validation prevents submission without role
- ✅ API validates role and defaults to TALENT if invalid
- ✅ Error message shown if role is missing

### 7. Orphaned Account Recovery

**Test Steps:**
1. Create user in Supabase Auth manually (without profile)
2. Attempt Google OAuth signup with same email

**Expected Results:**
- ✅ Profile created in `profiles` table
- ✅ Role-specific profile created (talent_profiles or recruiter_profiles)
- ✅ Signup completes successfully

### 8. Role Selection via URL Parameter

**Test Steps:**
1. Navigate to `/register?role=TALENT`
2. Navigate to `/register?role=CLIENT`

**Expected Results:**
- ✅ Role pre-selected based on URL parameter
- ✅ User can change selection if needed
- ✅ Form submission uses selected role

### 9. Profile Initialization Validation

**Test Steps:**
1. Sign up as TALENT
2. Check database records

**Expected Results:**
- ✅ `talent_profiles.status = 'DRAFT'`
- ✅ `talent_profiles.profile_completion = 0`
- ✅ All profile fields initialized as null/default
- ✅ No skills associated initially

**Test Steps:**
1. Sign up as CLIENT
2. Check database records

**Expected Results:**
- ✅ `profiles.status = 'ACTIVE'`
- ✅ `recruiter_profiles` created
- ✅ User can access client dashboard immediately

### 10. Redirect Logic Validation

**Test Steps:**
1. Sign up as TALENT → Should redirect to `/talent/onboarding`
2. Sign up as CLIENT → Should redirect to `/client`
3. Access `/talent` with DRAFT status → Should redirect to `/talent/onboarding`
4. Access `/talent` with SUBMITTED/APPROVED status → Should show dashboard

**Expected Results:**
- ✅ Correct redirects based on role and status
- ✅ No infinite redirect loops
- ✅ Proper handling of missing profiles

## Edge Cases

### 1. Network Error During Signup
- **Test:** Simulate network failure during signup
- **Expected:** User-friendly error message, ability to retry, no partial accounts

### 2. OAuth Cancellation
- **Test:** Cancel Google OAuth flow
- **Expected:** Redirect back to signup page with error message

### 3. Email Verification (Production)
- **Test:** Sign up in production environment
- **Expected:** Email verification required, user redirected to verify-email page

### 4. Weak Password
- **Test:** Submit password less than 8 characters
- **Expected:** Validation error with password requirements

### 5. Invalid Email Format
- **Test:** Submit invalid email format
- **Expected:** Validation error, no account creation

## Performance Testing

1. **Concurrent Signups:** Test multiple users signing up simultaneously
2. **Large Company Names:** Test with very long company names
3. **Special Characters:** Test email/password with special characters

## Security Testing

1. **CSRF Protection:** Verify CSRF tokens in production
2. **Rate Limiting:** Verify rate limiting prevents abuse
3. **SQL Injection:** Test with malicious input
4. **XSS Prevention:** Test with script tags in form fields

## Manual Testing Checklist

- [ ] TALENT email/password signup works
- [ ] CLIENT email/password signup works
- [ ] TALENT Google OAuth signup works
- [ ] CLIENT Google OAuth signup works
- [ ] Duplicate email shows appropriate error
- [ ] Role selection UI is clear and functional
- [ ] Redirects work correctly for both roles
- [ ] Profile initialization is correct
- [ ] Error messages are user-friendly
- [ ] Loading states display properly
- [ ] Form validation works correctly
- [ ] Company name is required for CLIENT
- [ ] Password requirements are enforced
- [ ] Email format validation works

## Automated Testing (Future)

Consider implementing:
- Unit tests for validation schemas
- Integration tests for API routes
- E2E tests for signup flows
- Database transaction tests
