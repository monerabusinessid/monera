# Setup Google OAuth untuk Monera

## 🚀 Langkah-langkah Setup Google OAuth

### 1. Buat Google Cloud Project

1. Kunjungi: https://console.cloud.google.com/
2. Login dengan akun Google (gunakan `monerabusiness.id@gmail.com` atau akun Google lainnya)
3. Klik **"Select a project"** di bagian atas
4. Klik **"New Project"**
5. Isi:
   - **Project name:** Monera (atau nama lain)
   - **Organization:** (biarkan default atau pilih jika ada)
6. Klik **"Create"**

### 2. Enable Google+ API

1. Di Google Cloud Console, klik **"APIs & Services"** > **"Library"**
2. Cari **"Google+ API"** atau **"Google Identity Services"**
3. Klik dan pilih **"Enable"**

### 3. Create OAuth 2.0 Credentials

1. Di Google Cloud Console, klik **"APIs & Services"** > **"Credentials"**
2. Klik **"+ CREATE CREDENTIALS"** di bagian atas
3. Pilih **"OAuth client ID"**
4. Jika diminta, pilih **"Configure consent screen"**:
   - **User Type:** External (untuk testing) atau Internal (jika menggunakan Google Workspace)
   - Klik **"Create"**
   - **App name:** Monera
   - **User support email:** monerabusiness.id@gmail.com
   - **Developer contact information:** monerabusiness.id@gmail.com
   - Klik **"Save and Continue"**
   - **Scopes:** Klik **"Save and Continue"** (gunakan default)
   - **Test users:** (opsional untuk testing) Klik **"Save and Continue"**
   - Klik **"Back to Dashboard"**

5. Kembali ke **"Credentials"** > **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
6. Pilih **"Web application"**
7. Isi:
   - **Name:** Monera Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (untuk development)
     - `http://localhost:3001` (jika menggunakan port 3001)
     - `https://yourdomain.com` (untuk production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/google` (untuk development)
     - `http://localhost:3001/api/auth/google` (jika menggunakan port 3001)
     - `https://yourdomain.com/api/auth/google` (untuk production)
8. Klik **"Create"**
9. **PENTING:** Copy **Client ID** dan **Client Secret** yang muncul

### 4. Setup Environment Variables

Tambahkan ke file `.env` di root project:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google"
```

**Catatan:**
- Ganti `your-client-id-here` dengan Client ID yang Anda dapatkan dari Google Cloud Console
- Ganti `your-client-secret-here` dengan Client Secret yang Anda dapatkan
- Ganti `http://localhost:3000` dengan URL aplikasi Anda (sesuaikan port jika berbeda)

### 5. Restart Development Server

Setelah menambahkan environment variables, restart server:

```bash
# Stop server (Ctrl+C)
# Jalankan lagi
npm run dev
```

### 6. Test Google Sign Up/Login

1. Buka: http://localhost:3000/register
2. Klik tombol **"Sign up with Google"**
3. Pilih akun Google
4. Berikan izin jika diminta
5. Seharusnya redirect kembali ke aplikasi dan berhasil login

## ⚠️ Troubleshooting

### Error: "invalid_client"
- Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah benar di `.env`
- Pastikan redirect URI di Google Cloud Console sama dengan `GOOGLE_REDIRECT_URI` di `.env`
- Restart server setelah mengubah `.env`

### Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Cloud Console **sama persis** dengan yang di `.env`
- Pastikan tidak ada trailing slash (`/`) yang tidak perlu
- Pastikan menggunakan `http://` untuk localhost (bukan `https://`)

### Error: "access_denied"
- Pastikan consent screen sudah dikonfigurasi dengan benar
- Jika menggunakan External user type, pastikan email Anda ada di "Test users" (untuk testing)

## 📝 Catatan Penting

1. **Development vs Production:**
   - Untuk development, gunakan `http://localhost:3000`
   - Untuk production, tambahkan domain production Anda di Google Cloud Console
   - Update `GOOGLE_REDIRECT_URI` sesuai environment

2. **Security:**
   - Jangan commit file `.env` ke Git
   - Client Secret harus dirahasiakan
   - Untuk production, gunakan environment variables di hosting platform (Vercel, Railway, dll)

3. **Multiple Environments:**
   - Anda bisa membuat multiple OAuth clients di Google Cloud Console untuk dev/staging/production
   - Atau gunakan satu client dengan multiple redirect URIs
