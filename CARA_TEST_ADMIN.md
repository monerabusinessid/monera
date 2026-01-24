# 🧪 Cara Test Admin Roles

Panduan lengkap untuk testing admin panel di Monera.

## 📋 Prerequisites

1. ✅ Supabase project sudah dibuat
2. ✅ Environment variables sudah di-set di `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. ✅ Database schema sudah di-run

## 🚀 Step 1: Setup Database Schema

Jalankan SQL schema di Supabase SQL Editor:

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/admin-schema.sql`
3. Paste dan jalankan di SQL Editor
4. Pastikan tidak ada error

## 🌱 Step 2: Seed Admin Users

Jalankan script untuk membuat semua admin users:

```bash
npm run seed:all-admins
```

Script ini akan membuat 4 admin users:

| Role | Email | Password |
|------|-------|----------|
| **SUPER_ADMIN** | superadmin@monera.com | SuperAdmin123! |
| **QUALITY_ADMIN** | quality@monera.com | Quality123! |
| **SUPPORT_ADMIN** | support@monera.com | Support123! |
| **ANALYST** | analyst@monera.com | Analyst123! |

## 🎯 Step 3: Test Admin Roles

### Test 1: SUPER_ADMIN (Full Access)

1. **Login:**
   - Email: `superadmin@monera.com`
   - Password: `SuperAdmin123!`
   - URL: http://localhost:3001/login

2. **Akses ke Admin Panel:**
   - Setelah login, akses: http://localhost:3001/admin/dashboard
   - Atau klik menu "Admin" di navbar (jika ada)

3. **Test Routes:**
   - ✅ `/admin/dashboard` - Dashboard
   - ✅ `/admin/users` - Manage Users
   - ✅ `/admin/talent-review` - Review Talent
   - ✅ `/admin/jobs` - Manage Jobs
   - ✅ `/admin/applications` - View Applications
   - ✅ `/admin/skills` - Manage Skills
   - ✅ `/admin/analytics` - View Analytics
   - ✅ `/admin/settings` - **ONLY SUPER_ADMIN** (System Settings)
   - ✅ `/admin/audit-logs` - View Audit Logs
   - ✅ `/admin/test-roles` - Test Roles Page

4. **Test Actions:**
   - Approve/Reject talent di `/admin/talent-review`
   - Update system settings di `/admin/settings`
   - Suspend/Unsuspend users di `/admin/users`

### Test 2: QUALITY_ADMIN (Talent & Jobs Management)

1. **Login:**
   - Email: `quality@monera.com`
   - Password: `Quality123!`

2. **Expected Access:**
   - ✅ `/admin/dashboard` - Access
   - ✅ `/admin/users` - Access
   - ✅ `/admin/talent-review` - Access
   - ✅ `/admin/jobs` - Access
   - ✅ `/admin/applications` - Access
   - ✅ `/admin/skills` - Access
   - ❌ `/admin/analytics` - **BLOCKED** (ANALYST/SUPER_ADMIN only)
   - ❌ `/admin/settings` - **BLOCKED** (SUPER_ADMIN only)
   - ✅ `/admin/audit-logs` - Access

3. **Test:**
   - Coba akses `/admin/settings` → Should redirect dengan error
   - Coba akses `/admin/analytics` → Should redirect dengan error
   - Test approve/reject talent → Should work

### Test 3: SUPPORT_ADMIN (Read-Only Support)

1. **Login:**
   - Email: `support@monera.com`
   - Password: `Support123!`

2. **Expected Access:**
   - ✅ `/admin/dashboard` - Access
   - ✅ `/admin/users` - Access (read-only)
   - ❌ `/admin/talent-review` - **BLOCKED**
   - ❌ `/admin/jobs` - **BLOCKED**
   - ✅ `/admin/applications` - Access (read-only)
   - ❌ `/admin/skills` - **BLOCKED**
   - ❌ `/admin/analytics` - **BLOCKED**
   - ❌ `/admin/settings` - **BLOCKED**
   - ✅ `/admin/audit-logs` - Access (read-only)

3. **Test:**
   - Coba akses `/admin/talent-review` → Should redirect dengan error
   - Coba akses `/admin/jobs` → Should redirect dengan error
   - Verify menu items - hanya allowed pages yang visible

### Test 4: ANALYST (Analytics Only)

1. **Login:**
   - Email: `analyst@monera.com`
   - Password: `Analyst123!`

2. **Expected Access:**
   - ✅ `/admin/dashboard` - Access
   - ❌ `/admin/users` - **BLOCKED**
   - ❌ `/admin/talent-review` - **BLOCKED**
   - ❌ `/admin/jobs` - **BLOCKED**
   - ✅ `/admin/applications` - Access (read-only)
   - ❌ `/admin/skills` - **BLOCKED**
   - ✅ `/admin/analytics` - **ONLY ANALYST/SUPER_ADMIN**
   - ❌ `/admin/settings` - **BLOCKED**
   - ✅ `/admin/audit-logs` - Access (read-only)

3. **Test:**
   - Coba akses `/admin/analytics` → Should work
   - Coba akses `/admin/talent-review` → Should redirect dengan error
   - Coba akses `/admin/settings` → Should redirect dengan error

## 🔒 Step 4: Test Route Protection

### Test Tanpa Login:
1. Buka browser incognito/private
2. Akses langsung: http://localhost:3001/admin/dashboard
3. **Expected:** Redirect ke `/login?redirect=/admin/dashboard`

### Test dengan Non-Admin User:
1. Login sebagai user biasa (TALENT/RECRUITER)
2. Coba akses: http://localhost:3001/admin/dashboard
3. **Expected:** Redirect ke `/` dengan error `admin_access_required`

## 🎯 Step 5: Test Role Testing Page

Setelah login sebagai admin, akses:

**URL:** http://localhost:3001/admin/test-roles

Halaman ini akan menampilkan:
- ✅ Current user info (email, role, status)
- ✅ Your capabilities (permissions)
- ✅ Route access test (link ke semua routes dengan status access)

## 📊 Step 6: Test Actions

### Test Talent Approval (QUALITY_ADMIN & SUPER_ADMIN):

1. Login sebagai `quality@monera.com` atau `superadmin@monera.com`
2. Akses: http://localhost:3001/admin/talent-review
3. Klik "Approve" pada talent
4. **Expected:** Talent status berubah menjadi "Ready"
5. Check audit log - seharusnya ada entry

### Test System Settings Update (SUPER_ADMIN ONLY):

1. Login sebagai `superadmin@monera.com`
2. Akses: http://localhost:3001/admin/settings
3. Update profile readiness threshold
4. **Expected:** Settings updated successfully

5. **Test sebagai QUALITY_ADMIN:**
   - Login sebagai `quality@monera.com`
   - Coba akses: http://localhost:3001/admin/settings
   - **Expected:** Redirect dengan error `insufficient_permissions`

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:**
- Check file `.env` di root project
- Pastikan ada:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Restart server setelah update `.env`

### Error: "Profile not found"
**Solution:**
- Run: `npm run seed:all-admins`
- Pastikan script berhasil membuat semua admin users

### Error: "Insufficient permissions"
**Expected:** Ini adalah behavior yang benar untuk role-based access
- Check role yang sedang login
- Verify route permissions di `lib/admin/rbac.ts`

### Routes tidak redirect dengan benar
**Solution:**
- Check middleware is running
- Verify `middleware.ts` ada di root directory
- Check browser console untuk errors

## ✅ Checklist Testing

- [ ] Database schema sudah di-run
- [ ] Semua admin users sudah dibuat via `npm run seed:all-admins`
- [ ] SUPER_ADMIN bisa akses semua routes
- [ ] QUALITY_ADMIN bisa akses talent review & jobs
- [ ] SUPPORT_ADMIN hanya read-only access
- [ ] ANALYST hanya bisa akses analytics
- [ ] Route protection working (middleware)
- [ ] Menu items show/hide berdasarkan role
- [ ] Test roles page working di `/admin/test-roles`

## 📝 Notes

- Semua password: `[Role]123!` (contoh: `SuperAdmin123!`)
- **PENTING:** Ganti password setelah testing di production!
- Audit logs ada di table `audit_logs` di Supabase
- RLS policies enforced di database level
- Middleware enforces route-level permissions

## 🎉 Quick Test Commands

```bash
# 1. Seed admin users
npm run seed:all-admins

# 2. Start server
npm run dev

# 3. Test URLs:
# - Login: http://localhost:3001/login
# - Admin Dashboard: http://localhost:3001/admin/dashboard
# - Test Roles: http://localhost:3001/admin/test-roles
```
