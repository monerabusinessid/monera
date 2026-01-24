# Setup Supabase Storage Buckets

## 🚀 Cara Membuat Storage Buckets di Supabase

### Opsi 1: Menggunakan SQL Script (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik **SQL Editor** di sidebar kiri
   - Klik **New query**

3. **Jalankan Script**
   - Buka file `supabase/create-storage-buckets.sql`
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik **Run** (atau tekan `Ctrl+Enter`)

4. **Verifikasi**
   - Klik **Storage** di sidebar kiri
   - Anda akan melihat bucket **"avatars"** dan **"landing-images"**

---

### Opsi 2: Manual Setup via Dashboard

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka Storage**
   - Klik **Storage** di sidebar kiri
   - Klik **New bucket**

3. **Buat Bucket "avatars"**
   - **Name:** `avatars`
   - **Public bucket:** ✅ (centang)
   - **File size limit:** `5242880` (5MB)
   - **Allowed MIME types:** `image/jpeg,image/jpg,image/png,image/webp,image/gif`
   - Klik **Create bucket**

4. **Set Up Policies (Optional)**
   - Klik bucket **"avatars"**
   - Klik tab **Policies**
   - Tambahkan policies sesuai kebutuhan (script SQL sudah include policies)

---

## ✅ Verifikasi Setup

Setelah bucket dibuat, coba upload foto profile lagi. Error "Bucket not found" seharusnya sudah hilang.

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
- Pastikan bucket "avatars" sudah dibuat di Supabase Storage
- Pastikan nama bucket tepat: `avatars` (lowercase, tanpa spasi)

### Error: "Permission denied"
- Pastikan bucket dibuat sebagai **public bucket**
- Atau pastikan RLS policies sudah di-set dengan benar

### Error: "File size too large"
- Pastikan file yang diupload tidak lebih dari 5MB
- Atau ubah file size limit di bucket settings

---

## 📝 Catatan

- Bucket "avatars" digunakan untuk menyimpan foto profile user
- Bucket "landing-images" digunakan untuk menyimpan gambar di landing page
- Semua bucket dibuat sebagai public untuk memudahkan akses
- RLS policies memastikan user hanya bisa upload/update/delete avatar mereka sendiri
