# Email Verification Setup Guide

## ✅ Fitur Email Verification Sudah Ditambahkan

Fitur email verification untuk production sudah ditambahkan ke aplikasi Monera. Berikut adalah penjelasan lengkapnya:

## 🔧 Konfigurasi yang Diperlukan

### 1. Supabase Dashboard Configuration

Untuk mengaktifkan email verification di Supabase:

1. **Login ke Supabase Dashboard**
   - Buka https://supabase.com
   - Pilih project Anda

2. **Aktifkan Email Confirmation**
   - Navigasi ke **Authentication** > **Settings**
   - Di bagian **Email provider**, aktifkan opsi **"Enable email confirmation"**
   - Simpan perubahan

3. **Konfigurasi Redirect URL**
   - Masih di **Authentication** > **Settings**
   - Scroll ke bagian **Site URL** dan **Redirect URLs**
   - Tambahkan URL berikut:
     - Development: `http://localhost:3000/api/auth/verify-email`
     - Production: `https://yourdomain.com/api/auth/verify-email`
   - Juga tambahkan untuk verify-email page:
     - Development: `http://localhost:3000/verify-email`
     - Production: `https://yourdomain.com/verify-email`

4. **Customize Email Template (Optional)**
   - Navigasi ke **Authentication** > **Email Templates**
   - Pilih template **"Confirm signup"**
   - Anda bisa customize template email verification
   - Gunakan placeholder `{{ .ConfirmationURL }}` untuk link verifikasi

### 2. Environment Variables

Pastikan environment variables berikut sudah di-set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App URL (untuk email links)
NEXT_PUBLIC_APP_URL="https://yourdomain.com" # atau http://localhost:3000 untuk development

# Node Environment
NODE_ENV="production" # atau "development"
```

## 📋 Cara Kerja

### Development Mode
- Email **auto-confirmed** (`email_confirm: true`)
- User langsung bisa login setelah register
- Tidak perlu verifikasi email

### Production Mode
- Email **tidak auto-confirmed** (`email_confirm: false`)
- User harus verifikasi email sebelum bisa login
- Supabase otomatis kirim email verification dengan link
- User klik link → redirect ke `/api/auth/verify-email`
- Setelah verifikasi berhasil → redirect ke `/verify-email?success=true`
- User bisa langsung sign in setelah verifikasi

## 🔄 Flow Email Verification

1. **User Register**
   ```
   POST /api/auth/register
   → User dibuat di Supabase Auth (email belum confirmed)
   → Supabase otomatis kirim email verification
   → User di-redirect ke /verify-email?email=user@example.com
   ```

2. **User Klik Link di Email**
   ```
   Email link: https://yourdomain.com/api/auth/verify-email?token_hash=xxx&type=signup
   → GET /api/auth/verify-email
   → Verify OTP token dengan Supabase
   → Set auth cookie (auto-login)
   → Redirect ke /verify-email?success=true
   ```

3. **User Sign In**
   ```
   POST /api/auth/login
   → Check email_confirmed_at
   → Jika belum confirmed → error: "Please verify your email"
   → Jika sudah confirmed → login berhasil
   ```

## 📁 File yang Ditambahkan/Dimodifikasi

### File Baru:
- `app/api/auth/verify-email/route.ts` - Handler untuk email verification callback
- `app/api/auth/resend-verification/route.ts` - API untuk resend verification email
- `app/verify-email/page.tsx` - Halaman untuk menampilkan status verification
- `EMAIL_VERIFICATION_SETUP.md` - Dokumentasi ini

### File yang Dimodifikasi:
- `app/api/auth/register/route.ts` - Update untuk tidak auto-confirm di production
- `app/api/auth/login/route.ts` - Check email confirmation status
- `lib/auth-context.tsx` - Handle redirect ke verify-email page
- `app/register/page.tsx` - Update untuk handle email verification flow

## 🧪 Testing

### Test di Development:
1. Set `NODE_ENV=development` di `.env`
2. Register user baru
3. User langsung bisa login (auto-confirmed)

### Test di Production:
1. Set `NODE_ENV=production` di `.env`
2. Register user baru
3. Check email inbox untuk verification link
4. Klik link verification
5. User di-redirect ke verify-email page dengan success message
6. User bisa sign in

## ⚠️ Catatan Penting

1. **Supabase Email Service**
   - Supabase menggunakan email service default mereka
   - Untuk production, pertimbangkan untuk setup custom SMTP di Supabase
   - Atau gunakan Supabase's built-in email service (ada limit)

2. **Resend Verification**
   - Saat ini menggunakan Supabase admin API
   - Untuk production, pertimbangkan untuk implement custom email sending
   - Atau gunakan Supabase's resend feature

3. **Email Template**
   - Customize email template di Supabase Dashboard
   - Pastikan link verification mengarah ke URL yang benar

4. **Security**
   - Token verification hanya valid untuk waktu tertentu
   - Pastikan user verify email segera setelah register

## 🚀 Next Steps

1. **Setup Supabase Email Configuration**
   - Aktifkan email confirmation di Supabase Dashboard
   - Set redirect URLs
   - Customize email template

2. **Test di Staging**
   - Deploy ke staging environment
   - Test full flow dari register sampai login

3. **Monitor Email Delivery**
   - Check Supabase logs untuk email delivery status
   - Monitor bounce rate dan spam complaints

4. **Production Deployment**
   - Pastikan semua environment variables sudah di-set
   - Test email verification flow
   - Monitor untuk issues

## 📞 Support

Jika ada masalah dengan email verification:
1. Check Supabase Dashboard logs
2. Check application logs
3. Verify environment variables
4. Check email template configuration
