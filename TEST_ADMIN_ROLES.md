# 🧪 Testing Admin Roles

Panduan lengkap untuk testing semua admin roles di Monera Admin Panel.

## 📋 Prerequisites

1. ✅ Supabase project sudah dibuat
2. ✅ Environment variables sudah di-set di `.env`
3. ✅ Database schema sudah di-run (`supabase/admin-schema.sql`)

## 🚀 Quick Start

### 1. Seed All Admin Users

Jalankan script untuk membuat semua admin users:

```bash
npm run seed:all-admins
```

Script ini akan membuat 4 admin users:

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | superadmin@monera.com | SuperAdmin123! |
| QUALITY_ADMIN | quality@monera.com | Quality123! |
| SUPPORT_ADMIN | support@monera.com | Support123! |
| ANALYST | analyst@monera.com | Analyst123! |

### 2. Start Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3001**

## 🧪 Test Cases

### Test 1: SUPER_ADMIN Access

**Login sebagai:** `superadmin@monera.com`

**Expected Access:**
- ✅ `/admin/dashboard` - Full access
- ✅ `/admin/users` - Full access
- ✅ `/admin/talent-review` - Full access
- ✅ `/admin/jobs` - Full access
- ✅ `/admin/applications` - Full access
- ✅ `/admin/skills` - Full access
- ✅ `/admin/analytics` - Full access
- ✅ `/admin/settings` - **ONLY SUPER_ADMIN** can access
- ✅ `/admin/audit-logs` - Full access

**Test Actions:**
1. Login dengan SUPER_ADMIN credentials
2. Navigate ke semua admin pages
3. Verify semua menu items visible
4. Test approve/reject talent
5. Test update system settings (should work)
6. Test suspend/unsuspend users

### Test 2: QUALITY_ADMIN Access

**Login sebagai:** `quality@monera.com`

**Expected Access:**
- ✅ `/admin/dashboard` - Access
- ✅ `/admin/users` - Access
- ✅ `/admin/talent-review` - Access
- ✅ `/admin/jobs` - Access
- ✅ `/admin/applications` - Access
- ✅ `/admin/skills` - Access
- ❌ `/admin/analytics` - **BLOCKED** (ANALYST/SUPER_ADMIN only)
- ❌ `/admin/settings` - **BLOCKED** (SUPER_ADMIN only)
- ✅ `/admin/audit-logs` - Access

**Test Actions:**
1. Login dengan QUALITY_ADMIN credentials
2. Navigate ke `/admin/dashboard` - should work
3. Navigate ke `/admin/talent-review` - should work
4. Navigate ke `/admin/settings` - should redirect with error
5. Navigate ke `/admin/analytics` - should redirect with error
6. Test approve/reject talent - should work
7. Test update system settings - should fail

### Test 3: SUPPORT_ADMIN Access

**Login sebagai:** `support@monera.com`

**Expected Access:**
- ✅ `/admin/dashboard` - Access
- ✅ `/admin/users` - Access (read-only)
- ❌ `/admin/talent-review` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ❌ `/admin/jobs` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ✅ `/admin/applications` - Access (read-only)
- ❌ `/admin/skills` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ❌ `/admin/analytics` - **BLOCKED** (ANALYST/SUPER_ADMIN only)
- ❌ `/admin/settings` - **BLOCKED** (SUPER_ADMIN only)
- ✅ `/admin/audit-logs` - Access (read-only)

**Test Actions:**
1. Login dengan SUPPORT_ADMIN credentials
2. Navigate ke `/admin/dashboard` - should work
3. Navigate ke `/admin/talent-review` - should redirect with error
4. Navigate ke `/admin/jobs` - should redirect with error
5. Navigate ke `/admin/settings` - should redirect with error
6. Verify menu items - only allowed pages visible

### Test 4: ANALYST Access

**Login sebagai:** `analyst@monera.com`

**Expected Access:**
- ✅ `/admin/dashboard` - Access
- ❌ `/admin/users` - **BLOCKED** (SUPER_ADMIN/QUALITY_ADMIN only)
- ❌ `/admin/talent-review` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ❌ `/admin/jobs` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ✅ `/admin/applications` - Access (read-only)
- ❌ `/admin/skills` - **BLOCKED** (QUALITY_ADMIN/SUPER_ADMIN only)
- ✅ `/admin/analytics` - **ONLY ANALYST/SUPER_ADMIN** can access
- ❌ `/admin/settings` - **BLOCKED** (SUPER_ADMIN only)
- ✅ `/admin/audit-logs` - Access (read-only)

**Test Actions:**
1. Login dengan ANALYST credentials
2. Navigate ke `/admin/dashboard` - should work
3. Navigate ke `/admin/analytics` - should work
4. Navigate ke `/admin/talent-review` - should redirect with error
5. Navigate ke `/admin/settings` - should redirect with error
6. Verify menu items - only allowed pages visible

## 🔒 Route Protection Tests

### Test Middleware Protection

1. **Without Login:**
   - Try to access `/admin/dashboard` without login
   - Expected: Redirect to `/login?redirect=/admin/dashboard`

2. **With Non-Admin User:**
   - Login as regular user (TALENT/RECRUITER)
   - Try to access `/admin/dashboard`
   - Expected: Redirect to `/` with error `admin_access_required`

3. **With Suspended Admin:**
   - Suspend an admin user
   - Try to login
   - Expected: Redirect with error `account_suspended`

### Test Route-Specific Permissions

1. **QUALITY_ADMIN trying to access /admin/settings:**
   - Login as QUALITY_ADMIN
   - Navigate to `/admin/settings`
   - Expected: Redirect to `/admin/dashboard?error=insufficient_permissions`

2. **SUPPORT_ADMIN trying to access /admin/talent-review:**
   - Login as SUPPORT_ADMIN
   - Navigate to `/admin/talent-review`
   - Expected: Redirect to `/admin/dashboard?error=insufficient_permissions`

## 🎯 Action Tests

### Test Talent Approval (QUALITY_ADMIN & SUPER_ADMIN)

1. Login as QUALITY_ADMIN or SUPER_ADMIN
2. Go to `/admin/talent-review`
3. Click "Approve" on a talent
4. Expected: Talent status changes to "Ready"
5. Check audit log - should have entry

### Test Talent Rejection (QUALITY_ADMIN & SUPER_ADMIN)

1. Login as QUALITY_ADMIN or SUPER_ADMIN
2. Go to `/admin/talent-review`
3. Click "Reject" on a talent
4. Enter rejection reason
5. Expected: Talent status changes to "Not Ready"
6. Check audit log - should have entry

### Test System Settings Update (SUPER_ADMIN ONLY)

1. Login as SUPER_ADMIN
2. Go to `/admin/settings`
3. Update profile readiness threshold
4. Expected: Settings updated successfully
5. Check audit log - should have entry

6. **Test as QUALITY_ADMIN:**
   - Login as QUALITY_ADMIN
   - Try to access `/admin/settings`
   - Expected: Redirect with error

## 📊 RLS Policy Tests

### Test Database-Level Security

1. **Direct Database Query Test:**
   - Login as SUPPORT_ADMIN
   - Try to update a talent profile directly via SQL
   - Expected: RLS policy should block the update

2. **Read-Only Access Test:**
   - Login as ANALYST
   - Try to read jobs table
   - Expected: Should work (read-only)
   - Try to update jobs table
   - Expected: Should fail (RLS blocks)

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- **Solution:** Check `.env` file has all required variables
- Restart server after updating `.env`

### Error: "Profile not found"
- **Solution:** Run `npm run seed:all-admins` to create admin profiles

### Error: "Insufficient permissions"
- **Expected:** This is correct behavior for role-based access
- Check which role you're logged in as
- Verify route permissions in `lib/admin/rbac.ts`

### Routes not redirecting properly
- **Solution:** Check middleware is running
- Verify `middleware.ts` is in root directory
- Check browser console for errors

## ✅ Checklist

- [ ] All admin users created via `npm run seed:all-admins`
- [ ] SUPER_ADMIN can access all routes
- [ ] QUALITY_ADMIN can access talent review & jobs
- [ ] SUPPORT_ADMIN has read-only access
- [ ] ANALYST can only access analytics
- [ ] Route protection working (middleware)
- [ ] RLS policies working (database level)
- [ ] Audit logging working
- [ ] Menu items show/hide based on role

## 📝 Notes

- All passwords are: `[Role]123!` (e.g., `SuperAdmin123!`)
- Change passwords after testing in production
- Audit logs are in `audit_logs` table
- RLS policies are enforced at database level
- Middleware enforces route-level permissions
