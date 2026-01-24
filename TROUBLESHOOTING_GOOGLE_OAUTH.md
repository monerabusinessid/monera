# Troubleshooting Google OAuth Errors

## Error: "Google authentication failed. Please try again or use email/password signup."

Error ini muncul ketika Google OAuth gagal. Berikut langkah-langkah untuk mendiagnosis dan memperbaikinya:

### 1. Cek Environment Variables

Pastikan file `.env` Anda memiliki variabel berikut:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google"
```

**Catatan:** 
- Ganti `localhost:3001` dengan port yang Anda gunakan
- Pastikan tidak ada spasi atau tanda kutip tambahan

### 2. Cek Server Logs

Cek console server untuk melihat error detail:

```bash
# Di terminal tempat server berjalan, cari log dengan prefix:
[Google OAuth] ...
```

Error yang mungkin muncul:
- `GOOGLE_CLIENT_ID not configured` → Environment variable tidak ditemukan
- `Token exchange failed` → Masalah dengan credentials atau redirect URI
- `Missing credentials` → GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak ada

### 3. Verifikasi Google Cloud Console Setup

#### A. Cek OAuth Client ID
1. Buka: https://console.cloud.google.com/
2. Pilih project Anda
3. Pergi ke **APIs & Services** > **Credentials**
4. Cek apakah OAuth 2.0 Client ID sudah dibuat

#### B. Cek Authorized Redirect URIs
Pastikan redirect URI di Google Cloud Console **sama persis** dengan yang di `.env`:

**Di Google Cloud Console:**
```
http://localhost:3001/api/auth/google
```

**Di .env:**
```
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google"
```

**PENTING:**
- Harus sama persis (termasuk `http://` vs `https://`)
- Tidak boleh ada trailing slash (`/`)
- Port harus sama

#### C. Cek Authorized JavaScript Origins
Pastikan juga sudah menambahkan:
```
http://localhost:3001
```

### 4. Common Issues & Solutions

#### Issue: "redirect_uri_mismatch"
**Penyebab:** Redirect URI di Google Cloud Console tidak sama dengan yang di `.env`

**Solusi:**
1. Buka Google Cloud Console > Credentials
2. Edit OAuth 2.0 Client ID
3. Pastikan **Authorized redirect URIs** berisi: `http://localhost:3001/api/auth/google`
4. Simpan perubahan
5. Restart server

#### Issue: "invalid_client"
**Penyebab:** Client ID atau Client Secret salah

**Solusi:**
1. Copy ulang Client ID dan Client Secret dari Google Cloud Console
2. Pastikan tidak ada spasi atau karakter tambahan
3. Update `.env` file
4. Restart server

#### Issue: "access_denied"
**Penyebab:** User membatalkan OAuth atau consent screen belum dikonfigurasi

**Solusi:**
1. Pastikan OAuth consent screen sudah dikonfigurasi
2. Jika menggunakan External user type, tambahkan email Anda ke "Test users"
3. Coba lagi dengan akun Google yang berbeda

#### Issue: Environment variable tidak terbaca
**Penyebab:** Server tidak restart setelah mengubah `.env`

**Solusi:**
1. Stop server (Ctrl+C)
2. Pastikan `.env` file ada di root project
3. Restart server: `npm run dev`

### 5. Test Setup

Setelah memperbaiki, test dengan:

1. Buka: http://localhost:3001/register
2. Klik "Sign up with Google"
3. Cek console server untuk log:
   ```
   [Google OAuth] Initiating OAuth flow: { hasClientId: true, ... }
   [Google OAuth] Redirecting to Google OAuth: { ... }
   ```

Jika masih error, cek:
- Browser console untuk error JavaScript
- Server console untuk error backend
- Network tab untuk melihat request/response

### 6. Alternative: Use Email/Password Signup

Jika Google OAuth masih bermasalah, Anda bisa menggunakan email/password signup sebagai alternatif:

1. Isi form email dan password di halaman register
2. Klik "Sign Up"
3. Account akan dibuat tanpa Google OAuth

### 7. Need Help?

Jika masih bermasalah:
1. Cek file `SETUP_GOOGLE_OAUTH.md` untuk panduan setup lengkap
2. Pastikan semua langkah sudah diikuti
3. Cek server logs untuk error detail
4. Verifikasi credentials di Google Cloud Console
