# Setup Supabase untuk Monera

## 🚀 Langkah-langkah Setup Supabase

### 1. Buat Project di Supabase

1. Kunjungi: https://supabase.com
2. Sign up / Login
3. Klik **"New Project"**
4. Isi:
   - **Name:** monera (atau nama lain)
   - **Database Password:** Buat password yang kuat (simpan baik-baik!)
   - **Region:** Pilih yang terdekat (Singapore untuk Indonesia)
5. Klik **"Create new project"**
6. Tunggu beberapa menit sampai project siap

### 2. Dapatkan Connection String

1. Di Supabase Dashboard, klik **Settings** (icon gear) di sidebar kiri
2. Pilih **Database**
3. Scroll ke bagian **Connection string**
4. Pilih tab **"URI"**
5. Copy connection string, contoh:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Ganti `[YOUR-PASSWORD]`** dengan password yang Anda buat saat create project

### 3. Setup Environment Variables

Buat file `.env` di root project:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Email SMTP (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@monera.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Catatan Penting:**
- Ganti `YOUR_PASSWORD` dengan password Supabase Anda
- Ganti `xxxxx` dengan project ID Supabase Anda
- Tambahkan `?pgbouncer=true&connection_limit=1` di akhir untuk connection pooling

### 4. Generate Prisma Client & Push Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke Supabase (akan create semua tables)
npm run db:push
```

### 5. Verifikasi

1. Buka Supabase Dashboard
2. Klik **Table Editor** di sidebar
3. Anda akan melihat semua tables:
   - `users`
   - `candidate_profiles`
   - `recruiter_profiles`
   - `companies`
   - `jobs`
   - `applications`
   - `skills`
   - `talent_requests`

### 6. Jalankan Server

```bash
npm run dev
```

Form siap digunakan! 🎉

---

## 🔍 Tips Supabase

### Connection Pooling

Supabase menyediakan connection pooling. Untuk production, gunakan:
- **Direct connection:** `postgresql://...` (untuk migrations)
- **Pooled connection:** `postgresql://...?pgbouncer=true` (untuk aplikasi)

### Database Password

- Simpan password dengan aman
- Jangan commit password ke Git
- Gunakan Supabase Dashboard untuk reset password jika lupa

### Monitoring

- Buka **Database** → **Connection Pooling** untuk monitor connections
- Buka **Database** → **Logs** untuk melihat query logs

### Backup

Supabase otomatis backup database Anda. Untuk manual backup:
1. **Settings** → **Database**
2. Scroll ke **Backups**
3. Klik **Download backup**

---

## 🐛 Troubleshooting

### Error: "Connection refused"
- Cek apakah password benar
- Cek apakah project ID benar
- Pastikan project Supabase sudah aktif

### Error: "Too many connections"
- Tambahkan `?pgbouncer=true&connection_limit=1` di connection string
- Atau gunakan connection pooling

### Error: "Schema not found"
- Pastikan sudah run `npm run db:push`
- Cek di Supabase Table Editor apakah tables sudah ada

### Error: "SSL required"
- Supabase memerlukan SSL. Pastikan connection string sudah benar
- Jika masih error, tambahkan `?sslmode=require` di connection string

---

## 📝 Format Connection String Lengkap

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

Contoh:
```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

---

## ✅ Checklist

- [ ] Project Supabase sudah dibuat
- [ ] Password sudah disimpan dengan aman
- [ ] Connection string sudah di-copy
- [ ] File `.env` sudah dibuat dengan `DATABASE_URL`
- [ ] Sudah run `npm run db:generate`
- [ ] Sudah run `npm run db:push`
- [ ] Tables sudah muncul di Supabase Table Editor
- [ ] Server sudah running (`npm run dev`)
- [ ] Form bisa diakses di http://localhost:3000/request-talent
