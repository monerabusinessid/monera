# Troubleshooting: Gambar Header & Logo Companies Tidak Tampil

## 🔍 Masalah
- Gambar header yang di-upload tidak tampil di landing page
- Logo companies yang di-upload hanya menampilkan URL, bukan gambar

---

## ✅ Perbaikan yang Sudah Dilakukan

1. **Company Logos** - Sekarang cek apakah logo adalah URL atau emoji
2. **Hero Image** - Menambahkan error handling yang lebih baik
3. **Next.js Config** - Menambahkan Supabase domain untuk image optimization

---

## 🔧 Langkah Troubleshooting

### 1. Cek URL Gambar di Database

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Cek Data di Table Editor**
   - Buka **Table Editor** → `landing_page_settings`
   - Cek value untuk `hero_image_url`
   - Buka **Table Editor** → `landing_page_companies`
   - Cek value untuk `logo` pada setiap company

3. **Verifikasi URL Format**
   - URL harus lengkap, contoh:
     ```
     https://[PROJECT-ID].supabase.co/storage/v1/object/public/landing-images/landing-page/1234567890-abc123.jpg
     ```
   - Pastikan URL dimulai dengan `https://`
   - Pastikan URL mengarah ke bucket `landing-images`

### 2. Cek Supabase Storage Bucket

1. **Buka Storage di Supabase Dashboard**
   - Klik **Storage** di sidebar
   - Klik bucket `landing-images`

2. **Verifikasi Bucket Settings**
   - Pastikan bucket **Public** (bisa diakses publik)
   - Klik **Settings** pada bucket
   - Pastikan **Public bucket** sudah di-check ✅

3. **Cek RLS Policies**
   - Klik **Policies** pada bucket
   - Pastikan ada policy untuk **Public can view landing images**
   - Jika belum ada, jalankan script SQL:
     ```sql
     CREATE POLICY "Public can view landing images"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'landing-images');
     ```

### 3. Test URL Gambar Langsung

1. **Copy URL dari database**
2. **Buka URL di browser baru** (tab baru)
3. **Cek apakah gambar bisa diakses:**
   - ✅ Jika gambar muncul → URL benar, masalah di rendering
   - ❌ Jika error 404 → File tidak ada di storage
   - ❌ Jika error 403 → RLS policy tidak benar atau bucket tidak public
   - ❌ Jika error CORS → Perlu setup CORS di Supabase

### 4. Cek Browser Console

1. **Buka landing page di browser**
2. **Buka Developer Tools** (F12)
3. **Cek tab Console** untuk error:
   - `Failed to load resource` → URL tidak valid atau tidak bisa diakses
   - `CORS error` → Perlu setup CORS
   - `404 Not Found` → File tidak ada di storage

4. **Cek tab Network:**
   - Filter by `Img`
   - Cek request untuk gambar
   - Lihat status code:
     - `200` → Gambar berhasil di-load
     - `404` → File tidak ditemukan
     - `403` → Tidak punya akses
     - `CORS error` → CORS issue

### 5. Verifikasi Upload Berhasil

1. **Cek di Supabase Storage**
   - Buka **Storage** → `landing-images`
   - Cek apakah file sudah ada di folder `landing-page/`
   - Pastikan file size > 0 (tidak kosong)

2. **Cek URL yang Disimpan**
   - Setelah upload, cek response dari API
   - Pastikan URL yang dikembalikan benar
   - Pastikan URL sudah disimpan di database

---

## 🛠️ Solusi untuk Masalah Umum

### Masalah 1: URL Tampil sebagai Text (Bukan Gambar)

**Penyebab:** Logo disimpan sebagai URL tapi tidak dirender sebagai gambar

**Solusi:** Sudah diperbaiki di code - sekarang cek apakah logo adalah URL dan render sebagai `<img>` tag

### Masalah 2: Gambar Tidak Tampil (Error 404)

**Penyebab:** File tidak ada di storage atau URL salah

**Solusi:**
1. Upload ulang gambar
2. Pastikan bucket `landing-images` sudah dibuat
3. Pastikan file ada di storage

### Masalah 3: Gambar Tidak Tampil (Error 403)

**Penyebab:** Bucket tidak public atau RLS policy tidak benar

**Solusi:**
1. Buka bucket `landing-images` → Settings
2. Pastikan **Public bucket** sudah di-check ✅
3. Jalankan script SQL untuk RLS policy (lihat file `supabase/create-landing-images-bucket.sql`)

### Masalah 4: CORS Error

**Penyebab:** Supabase Storage tidak mengizinkan request dari domain aplikasi

**Solusi:**
1. Buka Supabase Dashboard → Storage → Settings
2. Tambahkan domain aplikasi ke CORS settings
3. Atau gunakan Next.js Image component dengan remotePatterns (sudah ditambahkan di `next.config.js`)

### Masalah 5: Gambar Tampil Tapi Broken

**Penyebab:** File corrupt atau format tidak didukung

**Solusi:**
1. Upload ulang dengan format yang didukung (JPEG, PNG, WebP, GIF, SVG)
2. Pastikan file size < 5MB
3. Cek apakah file bisa dibuka di komputer lokal

---

## 📋 Checklist Debugging

- [ ] URL gambar sudah benar di database
- [ ] Bucket `landing-images` sudah dibuat
- [ ] Bucket `landing-images` sudah di-set sebagai **Public**
- [ ] RLS policy untuk public view sudah ada
- [ ] File sudah ada di Supabase Storage
- [ ] URL bisa diakses langsung di browser (tab baru)
- [ ] Tidak ada error di browser console
- [ ] Tidak ada CORS error
- [ ] Format file didukung (JPEG, PNG, WebP, GIF, SVG)
- [ ] File size < 5MB

---

## 🔄 Langkah Perbaikan Cepat

1. **Re-upload gambar:**
   - Buka admin panel → Landing Page → Header
   - Upload ulang hero image
   - Pastikan upload berhasil (lihat preview)

2. **Re-upload logo companies:**
   - Buka admin panel → Landing Page → Companies
   - Edit company yang logo-nya tidak tampil
   - Upload ulang logo
   - Pastikan upload berhasil

3. **Clear cache:**
   ```bash
   # Stop dev server
   # Hapus .next folder
   Remove-Item -Recurse -Force .next
   # Restart dev server
   npm run dev
   ```

4. **Hard refresh browser:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

---

## 📝 Catatan

- **Hero Image:** Hanya tampil di desktop (hidden di mobile dengan `hidden lg:block`)
- **Company Logos:** Akan menampilkan emoji fallback jika gambar error
- **URL Format:** Harus lengkap dengan `https://` dan path ke Supabase Storage

---

## 🆘 Jika Masih Tidak Bisa

1. **Cek log di terminal** saat upload gambar
2. **Cek browser console** untuk error detail
3. **Cek Network tab** untuk melihat request/response
4. **Test URL langsung** di browser baru
5. **Verifikasi bucket dan RLS policies** di Supabase Dashboard
