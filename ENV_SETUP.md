# Setup Environment Variables (.env)

File `.env` diperlukan untuk menjalankan aplikasi. Buat file `.env` di root project dengan konten berikut:

## 📝 Cara Membuat File .env

1. Buat file baru bernama `.env` di root project (sama level dengan `package.json`)
2. Copy template di bawah ini ke file `.env`
3. Isi nilai-nilai yang diperlukan dari Supabase Dashboard

## 🔑 Template .env

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Supabase Database (Optional - for Prisma)
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

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Node Environment
NODE_ENV="development"
```

## 🎯 Cara Mendapatkan Variabel Supabase

### 1. NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. DATABASE_URL (Optional)

1. Di Supabase Dashboard, buka **Settings** → **Database**
2. Scroll ke **Connection string**
3. Pilih tab **"URI"**
4. Copy connection string dan ganti `[YOUR-PASSWORD]` dengan password database Anda
5. Tambahkan `?pgbouncer=true&connection_limit=1` di akhir

## ✅ Setelah File .env Dibuat

1. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Test koneksi:**
   - Buka: http://localhost:3001
   - Jika tidak ada error, berarti setup berhasil!

## ⚠️ Catatan Penting

- **JANGAN** commit file `.env` ke Git (sudah ada di `.gitignore`)
- **JANGAN** share service_role key ke publik
- Simpan file `.env` dengan aman
- Untuk production, gunakan environment variables di hosting platform

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` ada di root project
- Pastikan variabel `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah diisi
- Restart development server setelah membuat/mengubah `.env`

### Error: "Invalid API key"
- Pastikan key yang di-copy sudah benar (tidak ada spasi di awal/akhir)
- Pastikan menggunakan key yang sesuai (anon key untuk client, service_role untuk admin)
