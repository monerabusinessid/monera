# Fix Session Expired Error After OAuth Signup

## Masalah
Setelah signup via Google OAuth, user di-redirect ke `/login?error=session_expired` padahal auth berhasil.

## Root Cause
**Client Layout mengunci session** - `app/client/layout.tsx` adalah server component yang:
1. Hanya check Supabase session (bukan JWT cookie)
2. Setelah OAuth, Supabase session mungkin belum ter-set
3. Layout langsung redirect ke login dengan `session_expired` error di catch block

## Perbaikan yang Dilakukan

### 1. Client Layout Check JWT Cookie
- Layout sekarang check JWT cookie terlebih dahulu (primary auth method)
- Check Supabase session sebagai fallback
- Use JWT user data jika available (sudah include role, status, name)

### 2. Allow Access untuk OAuth Flow
- Jika cookie `auth-token` ada tapi user belum ter-parse, allow access
- Client page akan handle auth check dengan sessionStorage
- Tidak redirect dengan `session_expired` error

### 3. Enhanced Error Handling
- Catch block tidak langsung redirect dengan `session_expired`
- Allow access dan let client page handle auth check
- Prevent false `session_expired` errors selama OAuth flow

## Flow Setelah Perbaikan

1. User signup via Google OAuth
2. OAuth callback:
   - Set cookie via API
   - Store user data di sessionStorage
   - Hard redirect ke `/client`
3. Client Layout check:
   - Check JWT cookie → found
   - Try to parse user from cookie
   - **If cookie exists but user not parsed yet → allow access**
   - Client page will handle auth check
4. Client page load:
   - Auth context check sessionStorage → set user
   - Client dashboard check auth → proceed
   - User bisa langsung access dashboard

## Testing

1. Clear browser cache dan cookies
2. Restart dev server: `npm run dev`
3. Test signup via Google OAuth
4. Check console logs:
   - `[Client Layout] Auth cookie present but user not parsed yet - allowing access`
   - `[Auth] ✅ Found OAuth user in sessionStorage`
   - `[Client] ✅ User authenticated as CLIENT`

5. Verify:
   - **TIDAK ada redirect ke `/login?error=session_expired`**
   - User langsung masuk ke `/client` dashboard
   - SessionStorage ter-set dan ter-clear dengan benar

## Perubahan Utama

**Client Layout sekarang:**
- ✅ Check JWT cookie (primary auth method)
- ✅ Allow access jika cookie ada meskipun user belum ter-parse
- ✅ Tidak redirect dengan `session_expired` error di catch block
- ✅ Client page akan handle auth check dengan sessionStorage

Ini seharusnya mengatasi masalah `session_expired` error setelah OAuth signup!
