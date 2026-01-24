# Cara Setup Database Manual di Supabase

## 🚀 Langkah-langkah:

### 1. Buka Supabase SQL Editor

1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New query**

### 2. Copy & Paste SQL Script

1. Buka file `supabase_setup.sql` di project Anda
2. Copy seluruh isi file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik tombol **Run** (atau tekan `Ctrl+Enter`)

### 3. Verifikasi Tables

1. Setelah script selesai, klik **Table Editor** di sidebar
2. Anda akan melihat semua tables:
   - ✅ `users`
   - ✅ `candidate_profiles`
   - ✅ `recruiter_profiles`
   - ✅ `companies`
   - ✅ `jobs`
   - ✅ `applications`
   - ✅ `skills`
   - ✅ `talent_requests`
   - ✅ `_CandidateSkills` (junction table)
   - ✅ `_JobSkills` (junction table)

### 4. Test Form

1. Pastikan file `.env` sudah ada dengan connection string Supabase
2. Jalankan server:
   ```bash
   npm run dev
   ```
3. Buka browser: http://localhost:3000/request-talent
4. Isi form dan submit
5. Cek data di Supabase Table Editor → `talent_requests`

---

## ✅ Checklist

- [ ] SQL script sudah di-copy dari `supabase_setup.sql`
- [ ] Script sudah di-run di Supabase SQL Editor
- [ ] Semua tables sudah muncul di Table Editor
- [ ] File `.env` sudah ada dengan connection string
- [ ] Server sudah running (`npm run dev`)
- [ ] Form bisa diakses dan submit berhasil
- [ ] Data muncul di Supabase `talent_requests` table

---

## 🐛 Troubleshooting

### Error: "relation already exists"
- Tables sudah ada sebelumnya
- Tidak masalah, script menggunakan `IF NOT EXISTS`
- Lanjutkan saja

### Error: "type already exists"
- Enums sudah ada
- Tidak masalah, script sudah handle ini
- Lanjutkan saja

### Tidak ada data muncul setelah submit
- Cek console browser untuk error
- Cek terminal server untuk error
- Pastikan connection string di `.env` benar
- Pastikan tables sudah dibuat dengan benar

---

## 📝 Catatan

- Script ini akan membuat semua tables sesuai dengan Prisma schema
- Foreign keys sudah di-setup
- Indexes sudah dibuat untuk performa
- Junction tables untuk many-to-many relationships sudah dibuat

Setelah ini, form siap digunakan! 🎉
