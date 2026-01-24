# Setup Database untuk Testing

## 🎯 Opsi 1: SQLite (Paling Mudah - Tidak Perlu Install PostgreSQL)

SQLite adalah database file-based, tidak perlu install server terpisah.

### Langkah-langkah:

1. **Update Prisma Schema untuk SQLite:**

Edit `prisma/schema.prisma`, ubah:
```prisma
datasource db {
  provider = "sqlite"  // ubah dari "postgresql"
  url      = "file:./dev.db"
}
```

2. **Generate dan Push Schema:**
```bash
npm run db:generate
npm run db:push
```

3. **File database akan dibuat:** `prisma/dev.db`

**Keuntungan:**
- ✅ Tidak perlu install PostgreSQL
- ✅ File-based, mudah dihapus/reset
- ✅ Cocok untuk development/testing

**Kekurangan:**
- ❌ Tidak cocok untuk production
- ❌ Fitur lebih terbatas dibanding PostgreSQL

---

## 🎯 Opsi 2: PostgreSQL (Production Ready)

### Langkah-langkah:

1. **Install PostgreSQL:**
   - Windows: Download dari https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Buat Database:**
```sql
CREATE DATABASE monera;
```

3. **Update `.env`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/monera?schema=public"
```
(Ganti `postgres` dan `password` dengan username/password PostgreSQL Anda)

4. **Push Schema:**
```bash
npm run db:generate
npm run db:push
```

---

## 🎯 Opsi 3: Mode Demo (Tanpa Database)

Untuk testing UI saja tanpa database, kita bisa buat mode demo. Tapi ini hanya untuk testing form, data tidak akan tersimpan.

**Catatan:** Form akan error saat submit karena tidak ada database.

---

## 🚀 Quick Start dengan SQLite (Recommended untuk Testing)

```bash
# 1. Update schema.prisma (ubah provider ke sqlite)
# 2. Generate client
npm run db:generate

# 3. Push schema (akan buat file dev.db)
npm run db:push

# 4. Jalankan server
npm run dev
```

Selesai! Database siap digunakan.

---

## 📝 Reset Database (SQLite)

Jika ingin reset database:
```bash
# Hapus file database
rm prisma/dev.db

# Push ulang schema
npm run db:push
```

---

## 🔍 Verifikasi Database

### SQLite:
```bash
# Buka Prisma Studio
npm run db:studio
```

### PostgreSQL:
```bash
# Connect ke database
psql -U postgres -d monera

# Lihat tables
\dt

# Lihat data
SELECT * FROM talent_requests;
```
