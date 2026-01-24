# Debug Guide: Client Google Authentication Issues

## Common Issues and Solutions

### Issue 1: Still Redirecting to Login After OAuth

**Symptoms:**
- User completes Google OAuth
- Gets redirected to `/login` instead of `/client` dashboard

**Debug Steps:**
1. Open browser DevTools > Console
2. Look for these logs:
   - `[AuthCallback]` - OAuth callback processing
   - `[Auth]` - Auth context behavior
   - `[Client]` - Client dashboard auth check

3. Check Application > Session Storage:
   - Should see `oauth_user` key temporarily
   - Should be cleared after auth context uses it

4. Check Application > Cookies:
   - Should see `auth-token` cookie
   - Verify cookie attributes (httpOnly, secure, sameSite)

**Common Causes:**
- SessionStorage not being set before redirect
- Auth context not checking sessionStorage
- Cookie not being set correctly
- Client dashboard redirecting too quickly

**Solution:**
- Verify sessionStorage is set in callback page (line ~214)
- Verify auth context checks sessionStorage (line ~41)
- Increase delay in client dashboard if needed

---

### Issue 2: SessionStorage Not Being Set

**Symptoms:**
- No `oauth_user` in sessionStorage
- Console shows error storing to sessionStorage

**Debug Steps:**
1. Check browser console for errors
2. Verify browser supports sessionStorage
3. Check if storage quota exceeded

**Solution:**
```javascript
// In callback page, verify sessionStorage is available
if (typeof Storage !== 'undefined') {
  try {
    sessionStorage.setItem('test', 'test')
    sessionStorage.removeItem('test')
    // sessionStorage is available
  } catch (e) {
    console.error('sessionStorage not available:', e)
  }
}
```

---

### Issue 3: Cookie Not Being Set

**Symptoms:**
- No `auth-token` cookie after OAuth
- API calls return 401 Unauthorized

**Debug Steps:**
1. Check Network tab > `/api/auth/set-cookie` request
2. Verify response includes Set-Cookie header
3. Check cookie attributes in Application > Cookies

**Common Causes:**
- Cookie attributes incorrect (secure, sameSite)
- Browser blocking cookies
- CORS issues

**Solution:**
- Verify cookie settings in `app/api/auth/set-cookie/route.ts`
- Check middleware.ts for cookie handling
- Test in different browser/incognito mode

---

### Issue 4: Auth Context Not Recognizing User

**Symptoms:**
- User data in sessionStorage but auth context doesn't set user
- `loading` stays true indefinitely

**Debug Steps:**
1. Check console for `[Auth]` logs
2. Verify `hasCheckedAuth` state
3. Check if sessionStorage check runs

**Solution:**
- Verify auth context useEffect runs on mount
- Check if sessionStorage check happens before fetchUser
- Verify sessionStorage data format matches expected structure

---

### Issue 5: Client Dashboard Redirecting Too Fast

**Symptoms:**
- Dashboard redirects to login before auth context finishes
- User is authenticated but dashboard doesn't wait

**Debug Steps:**
1. Check client dashboard auth check logic
2. Verify delay before redirect (should be 2 seconds)
3. Check if direct API fetch is working

**Solution:**
- Increase delay in client dashboard (currently 2000ms)
- Verify direct API fetch in auth check
- Check if sessionStorage is checked before redirect

---

## Debug Checklist

When testing fails, check:

- [ ] Browser console shows `[AuthCallback]` logs
- [ ] Browser console shows `[Auth]` logs
- [ ] SessionStorage contains `oauth_user` (temporarily)
- [ ] Cookie `auth-token` is set
- [ ] `/api/auth/me` returns 200 with user data
- [ ] Auth context `loading` becomes false
- [ ] Auth context `user` is set
- [ ] Client dashboard receives user from auth context
- [ ] No redirect to `/login` after successful auth

---

## Debug Commands

### Check SessionStorage
```javascript
// In browser console
console.log('SessionStorage:', sessionStorage.getItem('oauth_user'))
```

### Check Cookies
```javascript
// In browser console
console.log('Cookies:', document.cookie)
// Note: httpOnly cookies won't show in document.cookie
```

### Check Auth State
```javascript
// In browser console (if auth context is exposed)
// Or check React DevTools > Components > AuthProvider
```

### Test API Endpoint
```bash
# In terminal
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Logging Points

Add console.log at these points for debugging:

1. **OAuth Callback** (`app/auth/callback/page.tsx`):
   - Line ~17: Callback processing starts
   - Line ~61: Cookie set successfully
   - Line ~214: SessionStorage set
   - Line ~230: Redirect happening

2. **Auth Context** (`lib/auth-context.tsx`):
   - Line ~35: useEffect triggered
   - Line ~41: SessionStorage check
   - Line ~44: User set from sessionStorage
   - Line ~100: fetchUser called

3. **Client Dashboard** (`app/client/page.tsx`):
   - Line ~125: Auth check starts
   - Line ~131: Direct API fetch
   - Line ~135: User authenticated check

---

## Quick Fixes

### Fix 1: Increase Delays
If redirects happen too fast, increase delays:
- Callback page: Increase from 2000ms to 3000ms
- Client dashboard: Increase from 2000ms to 3000ms

### Fix 2: Add More Logging
Add detailed logging to track flow:
```javascript
console.log('[Debug] Current state:', {
  hasUser: !!user,
  loading,
  hasCheckedAuth,
  sessionStorage: sessionStorage.getItem('oauth_user')
})
```

### Fix 3: Verify SessionStorage Format
Ensure sessionStorage data matches expected format:
```javascript
{
  id: string,
  email: string,
  role: 'CLIENT',
  name: string | null,
  status: string
}
```

---

## Still Not Working?

If issues persist:

1. **Clear everything:**
   - Clear browser cache
   - Clear cookies
   - Clear sessionStorage
   - Restart dev server

2. **Check environment:**
   - Verify all env variables are set
   - Check Supabase connection
   - Verify Google OAuth credentials

3. **Test in isolation:**
   - Test OAuth callback separately
   - Test auth context separately
   - Test client dashboard separately

4. **Compare with working flow:**
   - Check TALENT flow (which works)
   - Compare implementations
   - Identify differences

---

## Report Issues

When reporting issues, include:
- Browser and version
- Console logs (all `[AuthCallback]`, `[Auth]`, `[Client]` logs)
- Network tab screenshots
- Application > Storage screenshots
- Steps to reproduce
- Expected vs actual behavior
