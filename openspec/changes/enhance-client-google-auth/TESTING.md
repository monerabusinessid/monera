# Testing Guide: Enhance Client Google Authentication Flow

## Prerequisites

1. Development server running: `npm run dev`
2. Browser DevTools open (Console and Application tabs)
3. Clear browser cache and cookies before testing
4. Test with fresh browser session or incognito mode

## Test Scenarios

### Test 1: CLIENT Signup via Google OAuth ✅

**Steps:**
1. Navigate to `/register`
2. Select "CLIENT" role
3. Click "Sign up with Google"
4. Complete Google OAuth flow
5. Observe redirect behavior

**Expected Results:**
- ✅ User is redirected directly to `/client` dashboard
- ✅ No redirect to `/login` page
- ✅ User is immediately authenticated
- ✅ Dashboard displays without requiring additional login
- ✅ Console shows: `[Auth] Found OAuth user in sessionStorage`
- ✅ SessionStorage contains `oauth_user` key (temporarily)
- ✅ Cookie `auth-token` is set in Application > Cookies

**Check in DevTools:**
- Console: Look for `[AuthCallback]` and `[Auth]` logs
- Application > Session Storage: Check for `oauth_user` (should be cleared after use)
- Application > Cookies: Verify `auth-token` cookie exists
- Network: Verify `/api/auth/me` returns 200 with user data

---

### Test 2: CLIENT Login via Google OAuth ✅

**Steps:**
1. Navigate to `/login`
2. Click "Login with Google"
3. Complete Google OAuth flow (use existing CLIENT account)
4. Observe redirect behavior

**Expected Results:**
- ✅ User is redirected directly to `/client` dashboard
- ✅ No redirect to `/login` page
- ✅ User is immediately authenticated
- ✅ Dashboard displays user's jobs and applications
- ✅ Console shows successful authentication logs
- ✅ SessionStorage is used for immediate recognition

**Check in DevTools:**
- Console: Look for authentication success logs
- Application > Cookies: Verify `auth-token` cookie exists
- Network: Verify `/api/auth/me` returns 200

---

### Test 3: CLIENT Signup via Email/Password ✅

**Steps:**
1. Navigate to `/register`
2. Select "CLIENT" role
3. Enter email and password
4. Enter company name (optional)
5. Click "Sign up"
6. Observe redirect behavior

**Expected Results:**
- ✅ Registration successful message
- ✅ User is redirected directly to `/client` dashboard
- ✅ No redirect to `/login` page
- ✅ User is immediately authenticated
- ✅ Dashboard displays without requiring additional login
- ✅ Console shows: `[Register] Stored user data in sessionStorage`
- ✅ SessionStorage contains `oauth_user` key (temporarily)

**Check in DevTools:**
- Console: Look for `[Register]` logs
- Application > Session Storage: Check for `oauth_user` (should be cleared after use)
- Application > Cookies: Verify `auth-token` cookie exists
- Network: Verify `/api/auth/register` returns 201

---

### Test 4: No Redirect to Login After Authentication ✅

**Steps:**
1. Complete any signup/login method (Google OAuth or email/password)
2. Observe redirect flow
3. Check if login page appears

**Expected Results:**
- ✅ User never sees `/login` page after successful authentication
- ✅ Direct redirect to appropriate dashboard (`/client` for CLIENT users)
- ✅ No intermediate redirects
- ✅ Smooth user experience

**Check in DevTools:**
- Network: Verify no requests to `/login` after authentication
- Console: No redirect logs to `/login` after successful auth

---

### Test 5: Error Scenarios

#### 5.1 OAuth Cancellation

**Steps:**
1. Navigate to `/register` or `/login`
2. Click "Sign up/Login with Google"
3. Cancel Google OAuth consent screen
4. Observe behavior

**Expected Results:**
- ✅ User is redirected back to signup/login page
- ✅ Error message displayed: "Google authentication cancelled"
- ✅ User can retry or use email/password signup
- ✅ No partial accounts created

#### 5.2 Network Error During OAuth

**Steps:**
1. Navigate to `/register`
2. Click "Sign up with Google"
3. Simulate network error (disable network after OAuth redirect)
4. Observe behavior

**Expected Results:**
- ✅ Error message displayed
- ✅ User can retry authentication
- ✅ No partial accounts created

#### 5.3 Invalid OAuth Response

**Steps:**
1. Manually navigate to `/auth/callback?error=oauth_error&details=test`
2. Observe behavior

**Expected Results:**
- ✅ Error message displayed
- ✅ User redirected to appropriate page (signup/login)
- ✅ Clear error message shown

---

### Test 6: SessionStorage Cleanup ✅

**Steps:**
1. Complete signup/login via Google OAuth
2. After redirect to dashboard, check sessionStorage
3. Refresh page
4. Check sessionStorage again

**Expected Results:**
- ✅ SessionStorage `oauth_user` is cleared after auth context uses it
- ✅ After refresh, sessionStorage is empty (no stale data)
- ✅ User still authenticated via cookie
- ✅ No memory leaks

**Check in DevTools:**
- Application > Session Storage: Should be empty after auth context processes it
- Console: Look for `[Auth]` logs showing sessionStorage cleanup

---

### Test 7: Cookie and SessionStorage Behavior ✅

**Steps:**
1. Open DevTools > Application tab
2. Complete signup/login
3. Monitor Cookies and Session Storage tabs
4. Observe behavior during redirect

**Expected Results:**
- ✅ `auth-token` cookie is set with correct attributes:
  - `httpOnly: true`
  - `secure: false` (development) or `true` (production)
  - `sameSite: 'lax'`
  - `path: '/'`
  - `maxAge: 7 days`
- ✅ SessionStorage `oauth_user` is set before redirect
- ✅ SessionStorage is cleared after auth context uses it
- ✅ Cookie persists across page refreshes

**Check in DevTools:**
- Application > Cookies: Verify cookie attributes
- Application > Session Storage: Monitor `oauth_user` lifecycle
- Console: Check for cookie setting logs

---

## Regression Tests

### Test 8: TALENT Flow Still Works ✅

**Steps:**
1. Test TALENT signup via Google OAuth
2. Verify redirect to `/talent/onboarding`

**Expected Results:**
- ✅ TALENT flow unchanged and working
- ✅ Redirects to `/talent/onboarding` for new TALENT users
- ✅ Redirects to `/talent` for existing TALENT users with completed profiles

---

### Test 9: Other Roles Still Work ✅

**Steps:**
1. Test ADMIN login
2. Test other role authentications

**Expected Results:**
- ✅ Other roles unaffected
- ✅ Admin dashboard accessible
- ✅ All authentication flows working

---

## Performance Checks

### Test 10: Loading States ✅

**Steps:**
1. Complete signup/login
2. Observe loading states during redirect

**Expected Results:**
- ✅ Loading spinner shown during authentication
- ✅ Smooth transition to dashboard
- ✅ No flickering or multiple redirects
- ✅ Fast authentication recognition (< 2 seconds)

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

**Expected Results:**
- ✅ All browsers support sessionStorage
- ✅ Cookie handling works correctly
- ✅ OAuth flow works in all browsers

---

## Checklist

Use this checklist when testing:

- [ ] Test 1: CLIENT Signup via Google OAuth
- [ ] Test 2: CLIENT Login via Google OAuth
- [ ] Test 3: CLIENT Signup via Email/Password
- [ ] Test 4: No Redirect to Login After Authentication
- [ ] Test 5.1: OAuth Cancellation
- [ ] Test 5.2: Network Error During OAuth
- [ ] Test 5.3: Invalid OAuth Response
- [ ] Test 6: SessionStorage Cleanup
- [ ] Test 7: Cookie and SessionStorage Behavior
- [ ] Test 8: TALENT Flow Still Works
- [ ] Test 9: Other Roles Still Work
- [ ] Test 10: Loading States
- [ ] Browser Compatibility (Chrome, Firefox, Safari)

---

## Common Issues and Solutions

### Issue: Still redirecting to login
**Solution:** 
- Check sessionStorage is being set before redirect
- Verify auth context is checking sessionStorage
- Check cookie is being set correctly
- Increase delay if needed

### Issue: SessionStorage not cleared
**Solution:**
- Verify auth context clears sessionStorage after use
- Check for errors in auth context

### Issue: Cookie not persisting
**Solution:**
- Check cookie attributes (httpOnly, secure, sameSite)
- Verify cookie path is '/'
- Check browser settings (third-party cookies, etc.)

---

## Test Results Template

```
Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

Test Results:
- Test 1: [PASS/FAIL] - Notes: [Any issues]
- Test 2: [PASS/FAIL] - Notes: [Any issues]
- Test 3: [PASS/FAIL] - Notes: [Any issues]
...
```

---

## Next Steps After Testing

1. Update `tasks.md` with test results
2. Mark completed tests as `[x]`
3. Document any issues found
4. Archive proposal after all tests pass:
   ```bash
   openspec archive enhance-client-google-auth --yes
   ```
