# ⚡ Quick Fix: Environment Variables Error

## Error yang muncul:
```
process.env.NEXT_PUBLIC_SUPABASE_URL is undefined
```

## Solusi Cepat:

### 1. Buat file `.env` di root project

Copy file `.env.example` atau buat manual:

```env
# Supabase Configuration (WAJIB untuk Admin Panel)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (untuk Prisma - existing setup)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google

# Admin User (untuk seeding)
ADMIN_EMAIL=admin@monera.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_NAME=Super Admin

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

### 2. Dapatkan Supabase Credentials

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Settings** (⚙️) → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ JANGAN expose ke client!)

### 3. Restart Server

Setelah update `.env`, **WAJIB restart server**:

```bash
# Stop server (Ctrl+C)
# Lalu jalankan lagi:
npm run dev
```

## ⚠️ Catatan Penting:

- File `.env` **JANGAN** di-commit ke Git (sudah di `.gitignore`)
- `SUPABASE_SERVICE_ROLE_KEY` adalah **SECRET** - jangan expose ke client
- Environment variables hanya ter-load saat server start
- Untuk production, set environment variables di hosting platform (Vercel, etc.)

## ✅ Setelah Setup:

1. Run database schema: `supabase/admin-schema.sql` di Supabase SQL Editor
2. Seed admin user: `npm run seed:admin`
3. Akses admin panel: http://localhost:3001/admin/dashboard
