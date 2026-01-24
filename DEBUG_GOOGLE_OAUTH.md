# Debug Google OAuth Error

## Error: "Google authentication failed" setelah signup berhasil

Jika Anda melihat error ini setelah signup berhasil, ikuti langkah-langkah berikut:

### 1. Cek Server Console Logs

Cari log dengan prefix `[Google OAuth]` di server console. Log akan menunjukkan di mana error terjadi:

```
[Google OAuth] Initiating OAuth flow: { hasClientId: true, ... }
[Google OAuth] Token exchange successful
[Google OAuth] User info retrieved: { email: ..., name: ... }
[Google OAuth] Profile created successfully: { id: ..., role: ... }
[Google OAuth] Profile verified after X attempt(s): { ... }
[Google OAuth] Token generated successfully for user: { ... }
[Google OAuth] OAuth success, redirecting to callback: ...
```

### 2. Common Error Points

#### A. Profile Verification Failed
**Log:** `[Google OAuth] Profile verification failed after all retries`

**Penyebab:** Profile dibuat tapi tidak bisa diverifikasi (database delay atau RLS issue)

**Solusi:**
- Cek apakah profile benar-benar dibuat di database
- Cek RLS policies di Supabase
- Coba login dengan email/password sebagai alternatif

#### B. Token Generation Failed
**Log:** `[Google OAuth] Failed to generate token`

**Penyebab:** JWT_SECRET tidak dikonfigurasi atau invalid

**Solusi:**
- Pastikan `JWT_SECRET` ada di `.env`
- Restart server setelah menambahkan JWT_SECRET

#### C. Missing Required User Data
**Log:** `Missing required values: { userId: ..., email: ..., role: ... }`

**Penyebab:** User data tidak lengkap setelah profile creation

**Solusi:**
- Cek apakah profile benar-benar dibuat
- Cek apakah role sudah di-set dengan benar

### 3. Check Database

Jalankan query berikut di Supabase SQL Editor untuk cek apakah user dan profile sudah dibuat:

```sql
-- Cek user di auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@gmail.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Cek profile
SELECT id, role, status, full_name 
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com' LIMIT 1);

-- Cek talent_profile (jika role TALENT)
SELECT user_id, status, profile_completion 
FROM talent_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com' LIMIT 1);

-- Cek recruiter_profile (jika role CLIENT)
SELECT user_id, company_id 
FROM recruiter_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com' LIMIT 1);
```

### 4. Temporary Workaround

Jika Google OAuth terus error setelah signup berhasil:

1. **Cek apakah account sudah dibuat:**
   - Coba login dengan email/password menggunakan email Google Anda
   - Jika bisa login, berarti account sudah dibuat dan OAuth hanya gagal di redirect

2. **Reset password jika perlu:**
   - Gunakan "Forgot Password" untuk set password
   - Login dengan email/password

3. **Cek apakah profile sudah lengkap:**
   - Login ke dashboard
   - Cek apakah profile sudah terisi

### 5. Enable Detailed Logging

Tambahkan logging tambahan di `.env`:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### 6. Check Environment Variables

Pastikan semua environment variables sudah benar:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 7. Test Flow Step by Step

1. **Test OAuth Initiation:**
   - Klik "Sign up with Google"
   - Cek log: `[Google OAuth] Initiating OAuth flow`
   - Pastikan `hasClientId: true`

2. **Test Token Exchange:**
   - Setelah redirect dari Google
   - Cek log: `[Google OAuth] Token exchange successful`
   - Jika gagal, cek error details

3. **Test Profile Creation:**
   - Cek log: `[Google OAuth] Profile created successfully`
   - Verifikasi di database

4. **Test Token Generation:**
   - Cek log: `[Google OAuth] Token generated successfully`
   - Jika gagal, cek JWT_SECRET

### 8. Contact Support

Jika masih error setelah semua langkah di atas:

1. Copy semua log dari server console (dari `[Google OAuth]` sampai error)
2. Screenshot error message di browser
3. Cek database untuk melihat apakah user/profile sudah dibuat
4. Berikan informasi:
   - Email yang digunakan
   - Role yang dipilih (TALENT/CLIENT)
   - Timestamp error
   - Full error log
