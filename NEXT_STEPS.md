# 🚀 Langkah Selanjutnya Setelah Reset Database

## ✅ Yang Sudah Selesai:
1. ✅ Database sudah di-reset dengan schema yang benar
2. ✅ Tabel yang tidak diperlukan sudah dihapus
3. ✅ Role system disederhanakan (CLIENT & TALENT)

## 📋 Langkah Selanjutnya:

### 1. Create SUPER_ADMIN User Pertama

Jalankan script untuk membuat admin user pertama:

```bash
npx tsx scripts/create-super-admin.ts
```

Atau jika sudah ada di package.json:
```bash
npm run create:super-admin
```

**Default credentials:**
- Email: `admin@monera.com`
- Password: `admin123`
- Role: `SUPER_ADMIN`

⚠️ **PENTING:** Ganti password setelah login pertama kali!

---

### 2. Test Login

1. Buka aplikasi: `http://localhost:3001`
2. Klik "Sign In"
3. Login dengan:
   - Email: `admin@monera.com`
   - Password: `admin123`
4. Seharusnya redirect ke `/admin/dashboard`

---

### 3. Test CRUD Functionality

#### A. Test Admin Users Management
1. Buka `/admin/users`
2. Klik "Add New User"
3. Create user baru dengan role:
   - SUPER_ADMIN
   - QUALITY_ADMIN
   - SUPPORT_ADMIN
   - ANALYST
   - CLIENT
   - TALENT
4. Test Edit user
5. Test Delete user

#### B. Test Talent Users
1. Buka `/admin/users/talents`
2. Verifikasi kolom khusus:
   - Hourly Rate
   - Profile Status
3. Test CRUD operations

#### C. Test Client Users
1. Buka `/admin/users/clients`
2. Verifikasi kolom khusus:
   - Company Name
   - Jobs Posted
3. Test CRUD operations

#### D. Test Jobs Management
1. Buka `/admin/jobs`
2. Klik "Create Job"
3. Fill form dan create job
4. Test Edit job
5. Test Delete job
6. Test Approve/Reject job

#### E. Test Skills Management
1. Buka `/admin/skills`
2. Test Add, Edit, Delete skills

#### F. Test Applications
1. Buka `/admin/applications`
2. Verifikasi data applications muncul

#### G. Test Talent Requests
1. Buka `/admin/talent-requests`
2. Verifikasi data talent requests muncul

---

### 4. Verifikasi Dashboard

1. Buka `/admin/dashboard`
2. Verifikasi semua statistik muncul:
   - Total Users
   - Admin Users (dengan link)
   - Talent Users (dengan link)
   - Client Users (dengan link)
   - Active Jobs
   - Applications
   - Pending Reviews
   - Audit Logs

---

### 5. Test Navigation

1. Verifikasi sidebar menu:
   - Dashboard
   - Admin Users
   - Talent Users
   - Client Users
   - Jobs
   - Applications
   - Talent Requests
   - Skills
   - Analytics
   - Audit Logs
   - Settings

2. Test sidebar collapse/expand
3. Test logout
4. Test "Back to Site" (harus tetap logged in)

---

### 6. Test Public Pages (dengan admin logged in)

1. Klik "Back to Site"
2. Verifikasi navbar muncul dengan:
   - Profile dropdown
   - "Dashboard" link di dropdown
   - User name/email di profile button
3. Test logout dari public page

---

### 7. Create Test Data (Optional)

Jika perlu test data untuk development:

```bash
# Create multiple admin users
npx tsx scripts/seed-all-admins.ts

# Atau create demo accounts (jika script sudah diupdate)
npx tsx scripts/seed-demo-accounts.ts
```

---

## 🐛 Troubleshooting

### Jika ada error saat create user:
1. Cek `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Pastikan database sudah di-reset dengan benar
3. Cek Supabase Dashboard → Authentication → Users

### Jika login tidak berfungsi:
1. Cek middleware.ts
2. Cek Supabase Auth settings
3. Cek browser console untuk errors

### Jika CRUD tidak berfungsi:
1. Cek browser console untuk errors
2. Cek server logs
3. Verifikasi RLS policies di Supabase
4. Pastikan menggunakan admin client untuk bypass RLS

---

## 📝 Notes

- **Role System:** Sekarang hanya menggunakan CLIENT dan TALENT (bukan RECRUITER dan CANDIDATE)
- **Table Structure:** Hanya tabel yang diperlukan yang dibuat
- **Email Storage:** Email disimpan di Supabase Auth, bukan di profiles table
- **Admin Client:** Semua admin operations menggunakan admin client untuk bypass RLS

---

## ✅ Checklist Selesai:

- [ ] Database reset berhasil
- [ ] SUPER_ADMIN user created
- [ ] Login berhasil
- [ ] Dashboard muncul dengan benar
- [ ] Admin Users CRUD bekerja
- [ ] Talent Users CRUD bekerja
- [ ] Client Users CRUD bekerja
- [ ] Jobs CRUD bekerja
- [ ] Skills CRUD bekerja
- [ ] Applications muncul
- [ ] Talent Requests muncul
- [ ] Navigation bekerja
- [ ] Sidebar collapse/expand bekerja
- [ ] Logout bekerja
- [ ] Public pages dengan admin logged in bekerja

---

**Selamat! Database sudah siap digunakan. 🎉**
