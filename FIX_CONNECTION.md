# Fix Connection Supabase

## 🔍 Langkah-langkah Debug

### 1. Ambil Connection String dari Supabase Dashboard

1. Buka: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Settings** (⚙️) → **Database**
4. Scroll ke **Connection string**
5. Pilih tab **"URI"**
6. Copy connection string yang muncul
7. **Ganti `[YOUR-PASSWORD]` dengan password baru:** `EAxwkywkzuDyxb6l`

### 2. Update File .env

Ganti `DATABASE_URL` di file `.env` dengan connection string dari dashboard.

**Format yang mungkin muncul:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres
```

**Setelah ganti password:**
```
postgresql://postgres:EAxwkywkzuDyxb6l@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres
```

### 3. Cek Status Project di Supabase

1. Di Supabase Dashboard, cek apakah project status **"Active"**
2. Jika masih "Setting up" atau "Paused", tunggu sampai aktif

### 4. Coba Format Alternatif

Jika masih error, coba format ini di `.env`:

**Opsi 1: Dengan SSL explicit**
```
DATABASE_URL="postgresql://postgres:EAxwkywkzuDyxb6l@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres?sslmode=require"
```

**Opsi 2: Tanpa SSL parameter (Supabase auto SSL)**
```
DATABASE_URL="postgresql://postgres:EAxwkywkzuDyxb6l@db.ctnzhargmgaopcrxykxv.supabase.co:5432/postgres"
```

**Opsi 3: Dengan connection pooling (port 6543)**
```
DATABASE_URL="postgresql://postgres:EAxwkywkzuDyxb6l@db.ctnzhargmgaopcrxykxv.supabase.co:6543/postgres?pgbouncer=true"
```

### 5. Restart Server

Setelah update `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 6. Test Koneksi Manual

Coba test koneksi dengan Prisma Studio:
```bash
npm run db:studio
```

Jika Prisma Studio bisa connect, berarti connection string benar.

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- ✅ Cek apakah project Supabase sudah **Active**
- ✅ Cek password sudah benar
- ✅ Cek connection string format
- ✅ Coba restart server setelah update `.env`

### Error: "Connection refused"
- ✅ Cek firewall/network tidak block
- ✅ Cek project Supabase tidak paused
- ✅ Coba dari network lain

### Error: "Authentication failed"
- ✅ Password salah - cek password di Supabase
- ✅ Reset password di Supabase jika perlu

---

## ✅ Checklist

- [ ] Connection string di-copy langsung dari Supabase Dashboard
- [ ] Password sudah diganti dengan benar
- [ ] Project Supabase status **Active**
- [ ] File `.env` sudah di-update
- [ ] Server sudah di-restart setelah update `.env`
- [ ] Coba test dengan Prisma Studio

---

## 💡 Tips

1. **Selalu ambil connection string dari Supabase Dashboard** - format bisa berbeda
2. **Gunakan password yang baru di-reset** - password lama mungkin sudah expired
3. **Tunggu beberapa menit** setelah reset password sebelum test
4. **Cek Supabase Dashboard** untuk melihat apakah ada error atau warning
