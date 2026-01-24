# 📋 Admin Users Menu - Table Information

## Table yang Digunakan

Menu **Admin Users** (`/admin/users`) menggunakan:

### 1. **Supabase Auth** (`auth.users`)
   - Menyimpan data authentication (email, password hash)
   - Email disimpan di sini, bukan di `profiles` table
   - User ID (UUID) digunakan sebagai primary key

### 2. **Profiles Table** (`public.profiles`)
   - Menyimpan data user profile (full_name, role, status)
   - Primary key: `id` (UUID) yang reference ke `auth.users(id)`
   - Kolom:
     - `id` (UUID) - Reference ke auth.users
     - `full_name` (TEXT)
     - `role` (UserRole enum) - SUPER_ADMIN, QUALITY_ADMIN, SUPPORT_ADMIN, ANALYST, CLIENT, TALENT
     - `status` (UserStatus enum) - ACTIVE, SUSPENDED, PENDING_VERIFICATION
     - `created_at` (TIMESTAMPTZ)
     - `updated_at` (TIMESTAMPTZ)

## Flow Create User

1. **Create user di Supabase Auth** (`auth.users`)
   - Email & password disimpan di sini
   - Generate UUID sebagai user ID

2. **Create profile di `profiles` table**
   - Insert dengan `id` = user ID dari Auth
   - Insert `full_name`, `role`, `status`

3. **Jika user sudah ada di Auth tapi belum ada di `profiles`:**
   - Fetch existing user dari Auth
   - Check apakah profile sudah ada
   - Jika belum ada, buat profile baru
   - Jika sudah ada, return error

## Error Handling

### Error: "A user with this email address has already been registered"

**Penyebab:**
- Email sudah ada di Supabase Auth (`auth.users`)

**Solusi:**
- Jika user sudah ada di Auth tapi belum ada di `profiles`:
  - Fungsi akan otomatis fetch existing user dan create profile
- Jika user sudah ada di Auth DAN sudah ada di `profiles`:
  - Akan muncul error: "User with email {email} already exists in the system"
  - Gunakan email yang berbeda atau edit user yang sudah ada

## Query untuk Check Data

```sql
-- Check user di Auth
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- Check profile
SELECT * 
FROM public.profiles 
WHERE id = 'user-uuid-here';

-- Check apakah user ada di Auth tapi tidak ada di profiles
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'user@example.com'
AND p.id IS NULL;
```

## Notes

- **Email** disimpan di `auth.users`, bukan di `profiles`
- Saat fetch users untuk display, email diambil dari Supabase Auth menggunakan `adminSupabase.auth.admin.getUserById()`
- Semua CRUD operations menggunakan **admin client** untuk bypass RLS (Row Level Security)
