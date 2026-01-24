# Panduan Testing Client Portal

## 📋 Daftar Isi
1. [Persiapan Testing](#persiapan-testing)
2. [Testing Authentication](#testing-authentication)
3. [Testing Dashboard](#testing-dashboard)
4. [Testing CRUD Operations](#testing-crud-operations)
5. [Testing Koneksi ke Database](#testing-koneksi-ke-database)
6. [Testing Koneksi dengan Admin](#testing-koneksi-dengan-admin)
7. [Checklist Testing](#checklist-testing)

---

## 🚀 Persiapan Testing

### 1. Pastikan Development Server Berjalan
```bash
npm run dev
```
Server akan berjalan di `http://localhost:3001`

### 2. Pastikan Database Terhubung
- Pastikan Supabase credentials sudah di-set di `.env`
- Pastikan database sudah di-migrate dan terisi data

### 3. Buat Test Account (jika belum ada)
- Buka `http://localhost:3001/register`
- Register sebagai **CLIENT** dengan email dan password yang mudah diingat
- Verifikasi email (jika production mode)

---

## 🔐 Testing Authentication

### Test Case 1: Login sebagai Client
1. Buka `http://localhost:3001/login`
2. Masukkan email dan password client
3. **Expected**: Redirect ke `/client` (client dashboard)
4. **Verify**: Sidebar navigation muncul dengan semua menu

### Test Case 2: Akses Client Portal Tanpa Login
1. Buka `http://localhost:3001/client` (tanpa login)
2. **Expected**: Redirect ke `/login?redirect=/client`
3. Setelah login, **Expected**: Redirect kembali ke `/client`

### Test Case 3: Logout
1. Klik tombol "Logout" di sidebar
2. **Expected**: Redirect ke `/login`
3. **Verify**: Session cleared, tidak bisa akses `/client` lagi

---

## 📊 Testing Dashboard

### Test Case 1: Dashboard Load Data
1. Login sebagai client
2. Buka `/client`
3. **Verify**:
   - Stats cards menampilkan angka yang benar
   - "My Jobs" section menampilkan jobs (jika ada)
   - "Recent Applications" section menampilkan applications (jika ada)
   - Tidak ada error di console

### Test Case 2: Auto-Refresh
1. Buka dashboard
2. Tunggu 30 detik
3. **Verify**: Data ter-refresh otomatis (cek timestamp "Last updated")

### Test Case 3: Manual Refresh
1. Klik tombol "Refresh"
2. **Verify**: Data ter-refresh, loading indicator muncul

### Test Case 4: Window Focus Refresh
1. Buka dashboard
2. Switch ke tab lain
3. Kembali ke tab dashboard
4. **Verify**: Data ter-refresh otomatis

---

## ✏️ Testing CRUD Operations

### 1. CREATE - Post a Job

#### Test Case: Create New Job
1. Buka `/client/post-job`
2. Isi form:
   - Title: "Test Job"
   - Description: "Test description"
   - Location: "Remote"
   - Remote: ✓ (checked)
   - Salary Min: 50000
   - Salary Max: 100000
   - Currency: USD
   - Skills: Pilih beberapa skills
3. Klik "Post Job"
4. **Expected**: 
   - Success message muncul
   - Redirect ke `/client/jobs` setelah 2 detik
   - Job muncul di list "My Jobs"

#### Test Case: Create Job dengan Company
1. Buka `/client/post-job`
2. Pilih company dari dropdown (jika ada)
3. Isi form dan submit
4. **Verify**: Job ter-associate dengan company yang dipilih

---

### 2. READ - My Jobs

#### Test Case: View All Jobs
1. Buka `/client/jobs`
2. **Verify**:
   - Semua jobs client muncul
   - Stats cards menampilkan angka yang benar
   - Filter search berfungsi
   - Filter status berfungsi (All, Published, Draft, Closed)

#### Test Case: View Job Detail
1. Buka `/client/jobs`
2. Klik "View" pada salah satu job
3. **Expected**: Redirect ke `/jobs/[id]` dengan detail lengkap

---

### 3. UPDATE - Edit Job

#### Test Case: Edit Job
1. Buka `/client/jobs`
2. Klik "Edit" pada salah satu job
3. **Expected**: Redirect ke `/jobs/[id]/edit`
4. **Verify**:
   - Form terisi dengan data job yang ada
   - Skills yang sudah dipilih muncul checked
5. Ubah beberapa field (title, description, status)
6. Klik "Update Job"
7. **Expected**:
   - Success message muncul
   - Redirect ke `/client/jobs`
   - Perubahan muncul di list

#### Test Case: Update Job Skills
1. Edit job
2. Tambah/hapus skills
3. Submit
4. **Verify**: Skills ter-update di database

---

### 4. DELETE - Delete Job

#### Test Case: Delete Job
1. Buka `/client/jobs`
2. Klik "Delete" pada salah satu job
3. **Expected**: Konfirmasi dialog muncul
4. Klik "OK" di konfirmasi
5. **Expected**:
   - Job terhapus dari database
   - List ter-refresh
   - Job tidak muncul lagi

---

### 5. Applications - Update Status

#### Test Case: Update Application Status
1. Buka `/client/applications`
2. Pilih application dengan status "PENDING"
3. Klik "Shortlist" atau "Accept" atau "Reject"
4. **Expected**:
   - Status ter-update
   - List ter-refresh
   - Stats cards ter-update

---

## 🔍 Testing Koneksi ke Database

### Test Case 1: Data Persistence
1. Create job baru
2. Refresh halaman
3. **Verify**: Job masih ada di database

### Test Case 2: Real-time Updates
1. Buka 2 browser/tab berbeda dengan account yang sama
2. Di tab 1: Create/update/delete job
3. Di tab 2: Refresh atau tunggu auto-refresh
4. **Verify**: Perubahan muncul di tab 2

### Test Case 3: Data Consistency
1. Create job dengan skills tertentu
2. Edit job, ubah skills
3. **Verify**: Skills ter-update dengan benar di database
4. View job detail
5. **Verify**: Skills yang ditampilkan sesuai dengan yang di-update

---

## 🔗 Testing Koneksi dengan Admin

### Test Case 1: Talent Request Flow
1. **Client Side**:
   - Buka `/client/request-talent`
   - Submit talent request
   - **Verify**: Success message muncul
   - Buka `/client/talent-requests`
   - **Verify**: Request muncul dengan status "PENDING"

2. **Admin Side** (buka di browser lain atau logout/login sebagai admin):
   - Buka `/admin/talent-requests`
   - **Verify**: Request dari client muncul di list
   - Update status menjadi "PROCESSING" atau "COMPLETED"

3. **Client Side** (refresh atau auto-refresh):
   - Buka `/client/talent-requests`
   - **Verify**: Status request ter-update

### Test Case 2: Applications Visibility
1. **Client Side**:
   - Buka `/client/applications`
   - **Verify**: Hanya applications untuk jobs client yang muncul

2. **Admin Side**:
   - Buka `/admin/applications`
   - **Verify**: Semua applications muncul (termasuk dari client)

---

## ✅ Checklist Testing

### Authentication & Access
- [ ] Login sebagai client berhasil
- [ ] Redirect ke `/client` setelah login
- [ ] Sidebar navigation muncul
- [ ] Tidak bisa akses `/client/*` tanpa login
- [ ] Logout berfungsi

### Dashboard (`/client`)
- [ ] Stats cards menampilkan data yang benar
- [ ] My Jobs section menampilkan jobs
- [ ] Recent Applications section menampilkan applications
- [ ] Auto-refresh setiap 30 detik
- [ ] Manual refresh button berfungsi
- [ ] Window focus refresh berfungsi
- [ ] Link "View All" mengarah ke halaman yang benar

### Post a Job (`/client/post-job`)
- [ ] Form bisa diisi
- [ ] Skills multi-select berfungsi
- [ ] Company dropdown berfungsi (jika ada companies)
- [ ] Submit berhasil create job
- [ ] Redirect ke `/client/jobs` setelah submit
- [ ] Job muncul di database

### My Jobs (`/client/jobs`)
- [ ] Semua jobs client muncul
- [ ] Stats cards benar
- [ ] Search filter berfungsi
- [ ] Status filter berfungsi
- [ ] View button mengarah ke job detail
- [ ] Edit button mengarah ke edit page
- [ ] Delete button berfungsi dengan konfirmasi
- [ ] Auto-refresh berfungsi

### Edit Job (`/jobs/[id]/edit`)
- [ ] Form terisi dengan data job
- [ ] Skills yang sudah dipilih muncul checked
- [ ] Update berhasil
- [ ] Redirect ke `/client/jobs` setelah update
- [ ] Perubahan muncul di database

### Applications (`/client/applications`)
- [ ] Semua applications untuk jobs client muncul
- [ ] Stats cards benar
- [ ] Search filter berfungsi
- [ ] Status filter berfungsi
- [ ] Update status berfungsi (Shortlist, Accept, Reject)
- [ ] Auto-refresh berfungsi

### Find Talent (`/client/find-talent`)
- [ ] Search form berfungsi
- [ ] Skills filter berfungsi
- [ ] Location filter berfungsi
- [ ] Results menampilkan talent profiles
- [ ] Pagination berfungsi
- [ ] Data terhubung ke database

### Request Talent (`/client/request-talent`)
- [ ] Form bisa diisi
- [ ] Email dan name ter-auto-fill dari user
- [ ] Submit berhasil
- [ ] Success message muncul
- [ ] Form ter-reset setelah success
- [ ] Data tersimpan di database

### My Requests (`/client/talent-requests`)
- [ ] Hanya requests dari client yang login yang muncul
- [ ] Stats cards benar
- [ ] Search filter berfungsi
- [ ] Status badges benar (Pending, Processing, Completed)
- [ ] Auto-refresh berfungsi
- [ ] Link ke submit request berfungsi

### Koneksi dengan Admin
- [ ] Talent request dari client muncul di admin panel
- [ ] Admin bisa update status request
- [ ] Status update muncul di client portal
- [ ] Applications client muncul di admin panel

---

## 🐛 Common Issues & Solutions

### Issue: "Minta login terus"
**Solution**: 
- Cek apakah cookies ter-set dengan benar
- Cek middleware di `lib/supabase/middleware.ts`
- Pastikan `credentials: 'include'` digunakan di semua fetch

### Issue: "Data tidak muncul"
**Solution**:
- Cek console browser untuk error
- Cek Network tab untuk melihat response API
- Pastikan `recruiterId=me` digunakan dengan benar
- Cek apakah user memiliki jobs/applications

### Issue: "Sidebar tidak muncul"
**Solution**:
- Pastikan menggunakan route `/client/*` (bukan `/post-job`, `/request-talent` langsung)
- Cek `app/client/layout.tsx` apakah ter-load

### Issue: "Auto-refresh tidak bekerja"
**Solution**:
- Cek console untuk error
- Pastikan `useEffect` dan `setInterval` ter-set dengan benar
- Cek apakah ada error di `fetchData` function

---

## 📝 Notes

- **Development Mode**: Email verification mungkin di-skip
- **Production Mode**: Email verification diperlukan
- **Auto-refresh**: Setiap 30 detik + saat window focus
- **Authentication**: Menggunakan httpOnly cookies (Supabase session)

---

## 🎯 Priority Testing

### High Priority (Must Test)
1. ✅ Login/Logout
2. ✅ Create Job
3. ✅ View Jobs
4. ✅ Edit Job
5. ✅ Delete Job
6. ✅ View Applications
7. ✅ Update Application Status

### Medium Priority
1. ✅ Find Talent
2. ✅ Request Talent
3. ✅ My Requests
4. ✅ Auto-refresh
5. ✅ Search & Filters

### Low Priority
1. ✅ Stats accuracy
2. ✅ UI/UX consistency
3. ✅ Error handling

---

## 🚨 Testing Scenarios

### Scenario 1: Complete Job Posting Flow
1. Login sebagai client
2. Post new job dengan skills
3. View job di "My Jobs"
4. Edit job (ubah skills)
5. View job detail
6. Delete job
7. **Verify**: Job terhapus dari database

### Scenario 2: Application Management Flow
1. Pastikan ada job yang published
2. (Simulasi) Talent apply ke job
3. View applications di `/client/applications`
4. Update status: PENDING → SHORTLISTED → ACCEPTED
5. **Verify**: Status ter-update di database

### Scenario 3: Talent Request Flow
1. Submit talent request
2. View request di "My Requests"
3. (Admin) Update status di admin panel
4. Refresh "My Requests"
5. **Verify**: Status ter-update

---

## 📞 Support

Jika menemukan bug atau issue:
1. Cek console browser (F12)
2. Cek Network tab untuk API calls
3. Cek server logs
4. Dokumentasikan error message dan steps to reproduce
