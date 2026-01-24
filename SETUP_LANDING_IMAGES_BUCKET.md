# Setup Landing Images Bucket di Supabase

## 🚀 Cara Membuat Bucket untuk Upload Logo Companies

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik **SQL Editor** di sidebar kiri
   - Klik **New query**

3. **Copy & Paste SQL Script**
   - Buka file `supabase/create-landing-images-bucket.sql` di project Anda
   - Copy seluruh isi file tersebut
   - Paste ke SQL Editor di Supabase
   - Klik tombol **Run** (atau tekan `Ctrl+Enter`)

4. **Verifikasi Bucket**
   - Klik **Storage** di sidebar kiri
   - Anda akan melihat bucket `landing-images` sudah ada
   - Pastikan bucket tersebut **Public** (bisa diakses publik)

### Atau Buat Manual di Dashboard:

1. **Buka Storage**
   - Klik **Storage** di sidebar kiri
   - Klik **New bucket**

2. **Isi Form**
   - **Name:** `landing-images`
   - **Public bucket:** ✅ Centang (agar bisa diakses publik)
   - Klik **Create bucket**

3. **Setup RLS Policies**
   - Setelah bucket dibuat, klik bucket `landing-images`
   - Klik tab **Policies**
   - Tambahkan policies sesuai dengan file `supabase/create-landing-images-bucket.sql`

---

## ✅ Setelah Bucket Dibuat

1. Refresh halaman admin landing page
2. Coba upload logo di menu Companies
3. Logo seharusnya sudah bisa di-upload dengan sukses

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
- Pastikan bucket `landing-images` sudah dibuat
- Pastikan nama bucket tepat: `landing-images` (dengan tanda hubung)

### Error: "Permission denied"
- Pastikan RLS policies sudah dibuat
- Pastikan user yang login adalah admin

### Logo tidak muncul setelah upload
- Cek apakah bucket **Public**
- Cek URL yang dihasilkan di console browser
