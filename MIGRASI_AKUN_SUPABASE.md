# Panduan Migrasi Akun Supabase (Tanpa Create Ulang Database)

## 🎯 Tujuan
Mengubah project Supabase dari akun pribadi ke akun Monera **tanpa membuat ulang database** dan **tanpa kehilangan data**.

---

## 📋 Opsi Migrasi

### **Opsi 1: Transfer Project via Organization (RECOMMENDED) ⭐**

Ini adalah cara terbaik karena tidak perlu migrasi data.

#### Prerequisites:
- Akun Monera harus punya **Organization** (bukan personal account)
- Jika belum ada organization, buat dulu (lihat langkah di bawah)

#### Langkah-langkah:

**A. Buat Organization di Akun Monera (Jika Belum Ada)**

1. **Login ke Akun Monera**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun Monera

2. **Buat Organization**
   - Klik icon **Organization** di sidebar kiri (atau klik nama di pojok kanan atas)
   - Klik **Create Organization**
   - Isi:
     - **Organization Name:** Monera (atau nama lain)
     - **Organization Slug:** monera (atau slug lain)
   - Klik **Create Organization**

3. **Verifikasi Organization**
   - Pastikan organization sudah dibuat
   - Organization akan muncul di dropdown di pojok kanan atas

**B. Transfer Project ke Organization**

1. **Login ke Akun Pribadi (Akun Lama)**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun pribadi Anda

2. **Buka Project Settings**
   - Pilih project Monera
   - Klik **Settings** (⚙️) → **General**
   - Scroll ke bagian **Transfer Project**

3. **Transfer ke Organization Monera**
   - Klik **Transfer Project**
   - Pilih **Transfer to Organization**
   - Pilih organization Monera yang sudah dibuat
   - Konfirmasi transfer

4. **Login ke Akun Monera**
   - Login dengan akun Monera
   - Pilih organization Monera
   - Project akan muncul di dashboard
   - **Database tetap sama, tidak ada data yang hilang!**

5. **Update Credentials di .env**
   - Buka Supabase Dashboard (akun Monera, organization Monera)
   - **Settings** → **API** → Copy credentials baru:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - **Settings** → **Database** → Copy connection string:
     - `DATABASE_URL`
   - Update file `.env` dengan credentials baru

6. **Test Koneksi**
   ```bash
   npm run dev
   ```
   - Pastikan aplikasi masih bisa connect ke database
   - Cek data masih ada di Table Editor

**Catatan:** Jika transfer ke organization tidak memungkinkan, gunakan **Opsi 2 (Backup & Restore)** atau **Opsi 3 (Invite Team Member)**.

---

### **Opsi 2: Backup & Restore (Jika Transfer Tidak Tersedia)**

Jika Supabase tidak support transfer project, gunakan backup & restore.

#### Langkah-langkah:

1. **Backup Database dari Akun Lama**

   a. **Via Supabase Dashboard:**
   - Login ke akun pribadi
   - **Settings** → **Database** → **Backups**
   - Klik **Download backup** (pilih format SQL)
   - Tunggu sampai download selesai

   b. **Via pg_dump (Alternatif):**
   ```bash
   pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres" > backup.sql
   ```

2. **Buat Project Baru di Akun Monera**
   - Login ke akun Monera
   - Klik **New Project**
   - Isi:
     - **Name:** monera
     - **Database Password:** Buat password baru (simpan baik-baik!)
     - **Region:** Pilih yang sama dengan project lama (untuk konsistensi)
   - Klik **Create new project**
   - Tunggu sampai project siap

3. **Restore Database ke Project Baru**

   a. **Via Supabase Dashboard:**
   - Di project baru, buka **SQL Editor**
   - Klik **New query**
   - Buka file backup SQL yang sudah didownload
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik **Run** (atau `Ctrl+Enter`)
   - Tunggu sampai restore selesai

   b. **Via psql (Alternatif):**
   ```bash
   psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_PROJECT-ID].supabase.co:5432/postgres" < backup.sql
   ```

4. **Setup Schema & Migrations**
   ```bash
   # Update .env dengan credentials project baru
   # Lalu jalankan:
   npm run db:generate
   npm run db:push
   ```

5. **Migrasi Storage Buckets (Jika Ada)**
   - Di akun lama, buka **Storage**
   - Download semua file dari buckets (jika ada)
   - Di akun baru, buat buckets yang sama
   - Upload semua file kembali
   - Atau jalankan script SQL untuk membuat buckets:
     ```bash
     # Jalankan di SQL Editor project baru:
     # - supabase/create-landing-images-bucket.sql
     # - supabase/setup-intro-videos-bucket.sql (jika ada)
     ```

6. **Update Environment Variables**
   - Update file `.env` dengan credentials project baru:
     ```env
     # Supabase Database
     DATABASE_URL="postgresql://postgres:[NEW_PASSWORD]@db.[NEW_PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
     
     # Supabase API
     NEXT_PUBLIC_SUPABASE_URL="https://[NEW_PROJECT-ID].supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW_ANON_KEY]"
     SUPABASE_SERVICE_ROLE_KEY="[NEW_SERVICE_ROLE_KEY]"
     ```

7. **Verifikasi Data**
   - Buka Supabase Dashboard (akun baru)
   - **Table Editor** → Cek semua tables dan data masih ada
   - **Storage** → Cek semua buckets dan files masih ada
   - Test aplikasi: `npm run dev`

---

### **Opsi 3: Invite Team Member (PALING MUDAH) ⚡**

Jika transfer tidak memungkinkan, bisa invite akun Monera sebagai team member. Ini cara paling mudah dan cepat!

1. **Di Akun Pribadi:**
   - Login ke akun pribadi
   - Pilih project Monera
   - **Settings** → **Team**
   - Klik **Invite Team Member**
   - Masukkan email akun Monera
   - Berikan role **Owner** atau **Admin**
   - Klik **Send Invitation**

2. **Di Akun Monera:**
   - Login dengan akun Monera
   - Cek email untuk invitation
   - Klik link invitation di email
   - Atau buka Supabase Dashboard → **Team** → Terima invitation
   - Project akan muncul di dashboard
   - Bisa akses dan manage project penuh

3. **Update Credentials (Jika Perlu)**
   - Credentials tetap sama (karena project masih di akun pribadi)
   - Tapi akun Monera sudah bisa akses dan manage
   - Jika ingin transfer ownership nanti, bisa lakukan setelah jadi team member

4. **Kemudian Transfer (Opsional)**
   - Setelah akun Monera jadi team member, bisa transfer ownership
   - Atau biarkan sebagai team member jika tidak perlu transfer penuh
   - Untuk transfer, perlu buat organization dulu (lihat Opsi 1)

---

## ✅ Checklist Setelah Migrasi

- [ ] Database connection string sudah diupdate di `.env`
- [ ] Supabase API credentials sudah diupdate di `.env`
- [ ] Semua tables masih ada dan data lengkap
- [ ] Storage buckets sudah dibuat ulang (jika ada)
- [ ] Aplikasi bisa connect ke database (`npm run dev`)
- [ ] Test login/register masih berfungsi
- [ ] Test CRUD operations masih berfungsi
- [ ] Test upload file masih berfungsi (jika ada)

---

## 🐛 Troubleshooting

### Error: "Connection refused" setelah migrasi
- Pastikan credentials di `.env` sudah diupdate
- Pastikan project baru sudah **Active** (bukan "Setting up")
- Restart dev server: `npm run dev`

### Data tidak muncul setelah restore
- Cek apakah backup SQL berhasil dijalankan tanpa error
- Cek di Table Editor apakah tables sudah ada
- Cek apakah ada error di SQL Editor saat restore

### Storage buckets tidak ada
- Buat buckets manual di Dashboard → Storage
- Atau jalankan script SQL untuk membuat buckets
- Upload file kembali jika perlu

### Authentication tidak bekerja
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
- Pastikan RLS policies sudah ada (biasanya ikut saat restore)
- Cek di Supabase Dashboard → Authentication → Policies

---

## 📝 Catatan Penting

1. **Backup Sebelum Migrasi**
   - Selalu backup database sebelum melakukan migrasi
   - Simpan backup di tempat yang aman

2. **Test Setelah Migrasi**
   - Test semua fitur penting setelah migrasi
   - Pastikan tidak ada data yang hilang

3. **Update Documentation**
   - Update dokumentasi dengan credentials baru
   - Update `.env.example` jika ada

4. **Hapus Project Lama (Opsional)**
   - Setelah migrasi berhasil dan semua sudah ditest
   - Bisa hapus project lama di akun pribadi (jika tidak diperlukan lagi)

---

## 🚀 Rekomendasi

**Urutan Prioritas:**

1. **Opsi 3 (Invite Team Member)** - ⭐ PALING MUDAH
   - ✅ Tidak perlu backup/restore
   - ✅ Tidak perlu transfer
   - ✅ Cepat (hanya invite & accept)
   - ✅ Akun Monera langsung bisa akses
   - ✅ Credentials tetap sama (tidak perlu update .env)

2. **Opsi 1 (Transfer via Organization)** - Jika ingin ownership penuh
   - ✅ Ownership penuh di akun Monera
   - ✅ Tidak perlu backup/restore
   - ⚠️ Perlu buat organization dulu
   - ⚠️ Perlu update credentials di .env

3. **Opsi 2 (Backup & Restore)** - Jika ingin project baru di akun Monera
   - ✅ Project baru di akun Monera
   - ✅ Ownership penuh
   - ⚠️ Perlu backup/restore (lebih lama)
   - ⚠️ Perlu update credentials di .env

**Saran:** Mulai dengan **Opsi 3 (Invite Team Member)** karena paling mudah. Jika nanti perlu transfer ownership, bisa lakukan setelah jadi team member.
