# Test Form - Request Talent

## ✅ Status Setup

- ✅ Tables sudah dibuat di Supabase
- ✅ File `.env` sudah ada dengan connection string
- ✅ Form sudah siap digunakan

## 🚀 Test Form

### 1. Jalankan Server

```bash
npm run dev
```

Server akan running di: **http://localhost:3000**

### 2. Buka Form di Browser

Buka salah satu:
- **Form langsung:** http://localhost:3000/request-talent
- **Homepage:** http://localhost:3000 (ada tombol link ke form)

### 3. Isi Form dengan Data Test

**Data Test:**
- **Client Name:** `John Doe`
- **Email:** `john@example.com`
- **Company:** `Acme Corporation` (opsional)
- **Talent Type:** `Developer`
- **Budget:** `50000`
- **Notes:** `Looking for senior React developer` (opsional)

### 4. Submit Form

- Klik tombol **"Submit Request"**
- Tunggu beberapa detik
- Anda akan melihat:
  - ✅ **Success message** jika berhasil
  - ❌ **Error message** jika ada masalah

### 5. Verifikasi Data di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Table Editor** di sidebar
4. Pilih table **`talent_requests`**
5. Data yang baru submit akan muncul di sana!

---

## 🐛 Troubleshooting

### Form tidak muncul
- Pastikan server running: `npm run dev`
- Cek browser console (F12) untuk error
- Refresh halaman

### Error saat submit
- Cek browser console (F12) → Network tab
- Cek terminal server untuk error log
- Pastikan connection string di `.env` benar

### Data tidak muncul di Supabase
- Cek apakah submit berhasil (success message)
- Refresh Supabase Table Editor
- Cek terminal server untuk error database

### Error "Cannot connect to database"
- Pastikan connection string di `.env` benar
- Pastikan project Supabase aktif
- Cek apakah tables sudah dibuat dengan benar

---

## ✅ Checklist Test

- [ ] Server running (`npm run dev`)
- [ ] Form bisa diakses di browser
- [ ] Semua field bisa diisi
- [ ] Submit berhasil (muncul success message)
- [ ] Data muncul di Supabase `talent_requests` table
- [ ] Form reset setelah sukses

---

## 🎉 Setelah Test Berhasil

Form sudah siap digunakan! Data akan:
- ✅ Tersimpan di Supabase database
- ✅ Bisa dilihat di Supabase Table Editor
- ✅ Email notification akan terkirim ke admin (jika SMTP configured)

Selamat! 🚀
