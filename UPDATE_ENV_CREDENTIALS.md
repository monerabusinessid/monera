# Update .env dengan Credentials Supabase

## 🔐 Credentials yang Diberikan

**Connection String:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres
```

**Password:** `6Y39Qwwn64zYKU1X`

**Project ID:** `ctnzhargmgaopcrxykxv`

---

## 📝 Format Connection String Lengkap

### Untuk Development (dengan Connection Pooling):
```env
DATABASE_URL="postgresql://postgres:6Y39Qwwn64zYKU1X@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### Untuk Migrations (Direct Connection):
```env
DATABASE_URL="postgresql://postgres:6Y39Qwwn64zYKU1X@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres"
```

---

## 🔑 Supabase API Credentials

Selain `DATABASE_URL`, Anda juga perlu credentials berikut dari Supabase Dashboard:

### Cara Mendapatkan:

1. **Login ke Supabase Dashboard**
   - Buka: https://supabase.com/dashboard
   - Login dengan akun Anda
   - Pilih project dengan ID: `ctnzhargmgaopcrxykxv`

2. **Ambil API Credentials**
   - Klik **Settings** (⚙️) → **API**
   - Copy credentials berikut:

#### a. Project URL
```
NEXT_PUBLIC_SUPABASE_URL="https://ctnzhargmgaopcrxykxv.supabase.co"
```

#### b. anon public key
- Di bagian **"Project API keys"**
- Cari key dengan label **"anon"** dan **"public"**
- Copy key-nya (panjang, dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
```
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### c. service_role key (SECRET!)
- Di bagian yang sama, cari key dengan label **"service_role"** dan **"secret"**
- ⚠️ **PENTING**: Key ini sangat rahasia, jangan share ke siapa pun!
- Copy key-nya
```
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📄 Format Lengkap File .env

Update file `.env` di root project dengan format berikut:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:6Y39Qwwn64zYKU1X@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://ctnzhargmgaopcrxykxv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[COPY_DARI_DASHBOARD]"
SUPABASE_SERVICE_ROLE_KEY="[COPY_DARI_DASHBOARD]"

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
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Node Environment
NODE_ENV="development"
```

---

## ✅ Langkah-langkah Update

1. **Buka file `.env`** di root project
2. **Update `DATABASE_URL`** dengan connection string di atas
3. **Ambil API credentials** dari Supabase Dashboard (Settings → API)
4. **Update `NEXT_PUBLIC_SUPABASE_URL`** dengan Project URL
5. **Update `NEXT_PUBLIC_SUPABASE_ANON_KEY`** dengan anon key
6. **Update `SUPABASE_SERVICE_ROLE_KEY`** dengan service_role key
7. **Simpan file `.env`**
8. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Test Koneksi

Setelah update `.env`, test koneksi:

```bash
# Test dengan Prisma Studio
npm run db:studio

# Atau test dengan dev server
npm run dev
```

Jika tidak ada error, berarti koneksi berhasil! ✅

---

## 🐛 Troubleshooting

### Error: "Connection refused"
- Pastikan password sudah benar: `6Y39Qwwn64zYKU1X`
- Pastikan project ID sudah benar: `ctnzhargmgaopcrxykxv`
- Pastikan project status "Active" di Supabase Dashboard

### Error: "Missing Supabase environment variables"
- Pastikan semua variabel sudah diisi:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Invalid API key"
- Pastikan API keys sudah di-copy dengan benar (tidak ada spasi di awal/akhir)
- Pastikan keys dalam tanda kutip `""`
- Pastikan project tidak dalam status "Paused"

---

## 🔒 Security Notes

⚠️ **PENTING:**
- Jangan commit file `.env` ke Git
- File `.env` sudah ada di `.gitignore`
- Jangan share credentials ke siapa pun
- Jika credentials ter-expose, segera reset di Supabase Dashboard

---

## 📋 Checklist

- [ ] `DATABASE_URL` sudah diupdate dengan password yang benar
- [ ] `NEXT_PUBLIC_SUPABASE_URL` sudah diupdate
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah diupdate
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sudah diupdate
- [ ] File `.env` sudah disimpan
- [ ] Dev server sudah di-restart
- [ ] Test koneksi berhasil
