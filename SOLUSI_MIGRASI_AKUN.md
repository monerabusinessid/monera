# Solusi Migrasi Akun Supabase - Step by Step

## 🎯 Masalah
Error: "You do not have any organizations you can transfer your project to."

Ini terjadi karena Supabase tidak bisa transfer project langsung ke personal account, harus ke organization.

---

## ✅ SOLUSI TERMUDAH: Invite Team Member

Ini adalah cara **paling mudah** dan **tidak perlu transfer**. Akun Monera akan jadi team member dengan akses penuh.

### Langkah-langkah:

#### **Step 1: Invite dari Akun Pribadi**

1. **Login ke Supabase dengan akun pribadi**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun pribadi Anda

2. **Buka Project Monera**
   - Klik project Monera di dashboard

3. **Buka Settings → Team**
   - Klik **Settings** (⚙️) di sidebar kiri
   - Klik **Team** di menu settings

4. **Invite Akun Monera**
   - Klik tombol **"Invite Team Member"** atau **"Add Member"**
   - Masukkan **email akun Monera** (email yang digunakan untuk login Supabase)
   - Pilih role: **Owner** atau **Admin** (agar punya akses penuh)
   - Klik **"Send Invitation"** atau **"Invite"**

5. **Konfirmasi**
   - Email invitation akan dikirim ke akun Monera
   - Catat email yang sudah di-invite

#### **Step 2: Accept Invitation di Akun Monera**

1. **Login ke Supabase dengan akun Monera**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun Monera

2. **Terima Invitation**
   - **Opsi A: Via Email**
     - Cek email akun Monera
     - Buka email invitation dari Supabase
     - Klik link **"Accept Invitation"** di email
   
   - **Opsi B: Via Dashboard**
     - Di Supabase Dashboard, cek notifikasi (bell icon) di pojok kanan atas
     - Atau buka **Settings** → **Team**
     - Klik **"Accept"** pada invitation yang muncul

3. **Verifikasi**
   - Setelah accept, project Monera akan muncul di dashboard akun Monera
   - Akun Monera sekarang bisa akses dan manage project penuh

#### **Step 3: Test Akses**

1. **Di Akun Monera**
   - Buka project Monera
   - Cek apakah bisa akses:
     - ✅ Table Editor (lihat data)
     - ✅ SQL Editor (run query)
     - ✅ Storage (lihat buckets)
     - ✅ Settings (ubah settings)

2. **Tidak Perlu Update .env**
   - Credentials tetap sama (karena project masih di akun pribadi)
   - Aplikasi tetap berjalan normal
   - Tidak perlu update `DATABASE_URL` atau API keys

---

## 🔄 OPSI ALTERNATIF: Buat Organization Lalu Transfer

Jika Anda **benar-benar ingin transfer ownership** ke akun Monera (bukan hanya team member), ikuti langkah ini:

### **Step 1: Buat Organization di Akun Monera**

1. **Login ke Supabase dengan akun Monera**
   - Buka: https://supabase.com/dashboard

2. **Buat Organization**
   - Klik **icon Organization** di sidebar kiri (atau klik **nama/avatar** di pojok kanan atas)
   - Klik **"Create Organization"** atau **"New Organization"**
   - Isi form:
     - **Organization Name:** `Monera` (atau nama lain)
     - **Organization Slug:** `monera` (atau slug lain, harus unique)
   - Klik **"Create Organization"**

3. **Verifikasi**
   - Organization akan muncul di dropdown di pojok kanan atas
   - Pastikan Anda sudah switch ke organization tersebut

### **Step 2: Transfer Project ke Organization**

1. **Login ke Supabase dengan akun pribadi**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun pribadi

2. **Buka Project Settings**
   - Pilih project Monera
   - Klik **Settings** (⚙️) → **General**
   - Scroll ke bagian **"Transfer Project"**

3. **Transfer ke Organization**
   - Klik **"Transfer Project"**
   - Pilih **"Transfer to Organization"** (bukan "Transfer to User")
   - Pilih organization **Monera** yang sudah dibuat
   - Konfirmasi transfer
   - ⚠️ **PERINGATAN:** Pastikan Anda sudah buat organization di akun Monera!

4. **Verifikasi di Akun Monera**
   - Login ke akun Monera
   - Switch ke organization Monera
   - Project akan muncul di dashboard
   - **Database tetap sama, tidak ada data yang hilang!**

### **Step 3: Update Credentials di .env**

1. **Ambil Credentials Baru**
   - Di akun Monera, buka project Monera
   - **Settings** → **API** → Copy:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - **Settings** → **Database** → Copy connection string:
     - `DATABASE_URL`

2. **Update File .env**
   - Buka file `.env` di root project
   - Update semua credentials dengan yang baru
   - Simpan file

3. **Test Koneksi**
   ```bash
   npm run dev
   ```
   - Pastikan aplikasi masih bisa connect
   - Test beberapa fitur untuk memastikan semuanya berjalan

---

## 📊 Perbandingan Opsi

| Aspek | Invite Team Member | Transfer ke Organization |
|-------|-------------------|------------------------|
| **Kesulitan** | ⭐ Sangat Mudah | ⭐⭐ Sedang |
| **Waktu** | 2-5 menit | 10-15 menit |
| **Update .env** | ❌ Tidak perlu | ✅ Perlu |
| **Ownership** | Team Member | Full Owner |
| **Akses** | ✅ Penuh | ✅ Penuh |
| **Risiko Data** | ✅ Aman | ✅ Aman |

---

## 🎯 Rekomendasi

**Gunakan "Invite Team Member"** jika:
- ✅ Ingin akses cepat tanpa ribet
- ✅ Tidak perlu update `.env`
- ✅ Team member sudah cukup (tidak perlu full ownership)

**Gunakan "Transfer ke Organization"** jika:
- ✅ Ingin full ownership di akun Monera
- ✅ Ingin project benar-benar "milik" akun Monera
- ✅ Tidak masalah update `.env`

---

## 🐛 Troubleshooting

### Invitation tidak muncul di email
- Cek folder **Spam/Junk**
- Pastikan email yang di-invite benar
- Cek di Dashboard → Settings → Team (invitation mungkin sudah ada di sana)

### Tidak bisa accept invitation
- Pastikan login dengan email yang benar
- Coba logout dan login lagi
- Cek apakah invitation sudah expired (biasanya valid 7 hari)

### Organization tidak muncul saat transfer
- Pastikan sudah buat organization di akun Monera
- Pastikan sudah switch ke organization tersebut
- Coba refresh browser

### Error setelah transfer
- Pastikan credentials di `.env` sudah diupdate
- Restart dev server: `npm run dev`
- Cek apakah project status "Active"

---

## ✅ Checklist Setelah Migrasi

- [ ] Akun Monera bisa akses project
- [ ] Bisa lihat data di Table Editor
- [ ] Bisa run query di SQL Editor
- [ ] Bisa akses Storage
- [ ] Aplikasi masih berjalan normal (jika invite team member)
- [ ] Aplikasi masih berjalan normal dengan credentials baru (jika transfer)
- [ ] Test login/register masih berfungsi
- [ ] Test CRUD operations masih berfungsi

---

## 💡 Tips

1. **Backup Sebelum Transfer** (jika transfer ke organization)
   - Settings → Database → Backups → Download backup
   - Simpan backup di tempat aman

2. **Test Setelah Migrasi**
   - Test semua fitur penting
   - Pastikan tidak ada data yang hilang
   - Cek logs untuk error

3. **Update Documentation**
   - Update dokumentasi dengan credentials baru (jika transfer)
   - Update `.env.example` jika ada
