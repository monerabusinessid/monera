# Troubleshooting: Header Image Tidak Tampil

## 🔍 Masalah
Gambar header yang sudah di-upload tidak tampil di landing page.

---

## ✅ Perbaikan yang Sudah Dilakukan

1. **Logging** - Menambahkan console.log untuk debugging
2. **Validasi URL** - Cek apakah URL tidak kosong
3. **Error Handling** - Fallback yang lebih baik jika gambar error
4. **Mobile Support** - Gambar sekarang juga tampil di mobile (sebelumnya hanya desktop)

---

## 🔧 Langkah Troubleshooting

### 1. Cek Browser Console

1. **Buka landing page** di browser
2. **Buka Developer Tools** (F12)
3. **Cek tab Console** untuk melihat log:
   - `Header settings fetched:` - Data yang di-fetch dari API
   - `Header image URL updated:` - URL gambar yang digunakan
   - `Hero image loaded successfully:` - Gambar berhasil di-load
   - `Error loading hero image:` - Error saat load gambar

### 2. Cek URL Gambar di Database

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Cek Data di Table Editor**
   - Buka **Table Editor** → `landing_page_settings`
   - Cari row dengan `key = 'hero_image_url'`
   - Cek value untuk `hero_image_url`

3. **Verifikasi URL Format**
   - URL harus lengkap, contoh:
     ```
     https://[PROJECT-ID].supabase.co/storage/v1/object/public/landing-images/landing-page/1234567890-abc123.jpg
     ```
   - Pastikan URL dimulai dengan `https://`
   - Pastikan URL mengarah ke bucket `landing-images`

### 3. Test URL Gambar Langsung

1. **Copy URL dari database** (dari step 2)
2. **Buka URL di browser baru** (tab baru)
3. **Cek apakah gambar bisa diakses:**
   - ✅ Jika gambar muncul → URL benar, masalah di rendering
   - ❌ Jika error 404 → File tidak ada di storage
   - ❌ Jika error 403 → RLS policy tidak benar atau bucket tidak public
   - ❌ Jika error CORS → Perlu setup CORS di Supabase

### 4. Cek Supabase Storage Bucket

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

### 5. Cek di Admin Panel

1. **Buka Admin Panel** → Landing Page → Header
2. **Cek field "Hero Image"**
   - Apakah URL sudah terisi?
   - Apakah preview gambar muncul?
3. **Jika preview tidak muncul:**
   - Cek apakah URL valid
   - Cek apakah gambar bisa diakses

### 6. Hard Refresh Browser

1. **Clear cache browser:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - Atau buka DevTools (F12) → klik kanan tombol refresh → pilih "Empty Cache and Hard Reload"

### 7. Cek Network Tab

1. **Buka Developer Tools** (F12)
2. **Buka tab Network**
3. **Filter by "Img"**
4. **Refresh halaman**
5. **Cek request untuk gambar header:**
   - Status code: `200` = berhasil, `404` = tidak ditemukan, `403` = tidak punya akses
   - Cek URL yang di-request

---

## 🛠️ Solusi untuk Masalah Umum

### Masalah 1: Gambar Tidak Tampil (Tidak Ada Error)

**Penyebab:** Gambar hanya tampil di desktop, atau URL kosong

**Solusi:**
- Pastikan Anda melihat di desktop (gambar sekarang juga tampil di mobile)
- Cek apakah `hero_image_url` tidak kosong di database
- Hard refresh browser

### Masalah 2: Error 404 (File Not Found)

**Penyebab:** File tidak ada di storage atau URL salah

**Solusi:**
1. Upload ulang gambar di admin panel
2. Pastikan bucket `landing-images` sudah dibuat
3. Pastikan file ada di storage

### Masalah 3: Error 403 (Forbidden)

**Penyebab:** Bucket tidak public atau RLS policy tidak benar

**Solusi:**
1. Buka bucket `landing-images` → Settings
2. Pastikan **Public bucket** sudah di-check ✅
3. Jalankan script SQL untuk RLS policy (lihat step 4)

### Masalah 4: Gambar Tampil di Admin Panel Tapi Tidak di Landing Page

**Penyebab:** Cache atau data tidak ter-update

**Solusi:**
1. Hard refresh browser (`Ctrl + Shift + R`)
2. Clear browser cache
3. Cek console untuk melihat URL yang digunakan
4. Pastikan URL di database sama dengan yang di admin panel

### Masalah 5: Gambar Tampil Tapi Broken

**Penyebab:** File corrupt atau format tidak didukung

**Solusi:**
1. Upload ulang dengan format yang didukung (JPEG, PNG, WebP, GIF)
2. Pastikan file size < 5MB
3. Cek apakah file bisa dibuka di komputer lokal

---

## 📋 Checklist Debugging

- [ ] URL gambar sudah benar di database (`landing_page_settings` table)
- [ ] Bucket `landing-images` sudah dibuat
- [ ] Bucket `landing-images` sudah di-set sebagai **Public**
- [ ] RLS policy untuk public view sudah ada
- [ ] File sudah ada di Supabase Storage
- [ ] URL bisa diakses langsung di browser (tab baru)
- [ ] Tidak ada error di browser console
- [ ] Tidak ada CORS error
- [ ] Format file didukung (JPEG, PNG, WebP, GIF)
- [ ] File size < 5MB
- [ ] Sudah hard refresh browser
- [ ] Console log menunjukkan URL yang benar

---

## 🔄 Langkah Perbaikan Cepat

1. **Re-upload gambar:**
   - Buka admin panel → Landing Page → Header
   - Upload ulang hero image
   - Pastikan upload berhasil (lihat preview)
   - Klik "Save Header Settings"
   - Tunggu reload otomatis

2. **Clear cache:**
   ```bash
   # Stop dev server
   # Hapus .next folder
   Remove-Item -Recurse -Force .next
   # Restart dev server
   npm run dev
   ```

3. **Hard refresh browser:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

4. **Cek console:**
   - Buka DevTools (F12)
   - Cek tab Console untuk error atau log
   - Cek tab Network untuk request gambar

---

## 📝 Catatan

- **Desktop Only:** Sebelumnya gambar hanya tampil di desktop (`hidden lg:block`), sekarang juga tampil di mobile
- **URL Format:** Harus lengkap dengan `https://` dan path ke Supabase Storage
- **Cache:** Setelah upload, mungkin perlu hard refresh untuk melihat perubahan

---

## 🆘 Jika Masih Tidak Bisa

1. **Cek log di terminal** saat upload gambar
2. **Cek browser console** untuk error detail
3. **Cek Network tab** untuk melihat request/response
4. **Test URL langsung** di browser baru
5. **Verifikasi bucket dan RLS policies** di Supabase Dashboard
6. **Cek apakah gambar muncul di admin panel preview**
