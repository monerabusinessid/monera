# Cara Mendapatkan Connection String Supabase

## 🎯 Langkah-langkah:

### 1. Login ke Supabase Dashboard
- Buka: https://supabase.com/dashboard
- Login dengan akun Anda

### 2. Pilih Project
- Klik project yang sudah dibuat

### 3. Buka Settings
- Klik icon **Settings** (⚙️) di sidebar kiri
- Pilih **Database**

### 4. Ambil Connection String
- Scroll ke bagian **"Connection string"**
- Pilih tab **"URI"**
- Anda akan melihat connection string seperti:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
  ```

### 5. Copy Connection String Lengkap
- Copy seluruh connection string
- Password sudah ada: `yOBGLTs3tO1XnF8r`
- Project ID adalah bagian `abcdefghijklmnop` (huruf/angka setelah `db.`)

### 6. Format Lengkap
Connection string Anda akan terlihat seperti:
```
postgresql://postgres:yOBGLTs3tO1XnF8r@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 7. Tambahkan Connection Pooling
Tambahkan di akhir: `?pgbouncer=true&connection_limit=1`

**Hasil akhir:**
```
postgresql://postgres:yOBGLTs3tO1XnF8r@db.abcdefghijklmnop.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

---

## 📝 Quick Copy

Setelah dapat connection string dari Supabase, copy ke file `.env`:

```env
DATABASE_URL="postgresql://postgres:yOBGLTs3tO1XnF8r@db.[PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

Ganti `[PROJECT-ID]` dengan project ID dari Supabase Dashboard.

---

## ✅ Setelah .env Selesai

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Push Schema ke Supabase:**
   ```bash
   npm run db:push
   ```

3. **Jalankan Server:**
   ```bash
   npm run dev
   ```

4. **Test Form:**
   - Buka: http://localhost:3000/request-talent
   - Isi form dan submit
   - Cek data di Supabase Table Editor
