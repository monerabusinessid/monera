# Cara Mendapatkan Supabase Credentials

Karena project Supabase Anda sudah ada, ikuti langkah berikut untuk mendapatkan credentials:

## 📋 Langkah-langkah:

### 1. Buka Supabase Dashboard
- Kunjungi: https://supabase.com/dashboard
- Login dengan akun Anda

### 2. Pilih Project
- Klik project yang sudah Anda buat

### 3. Buka Settings → API
- Di sidebar kiri, klik icon **Settings** (⚙️)
- Pilih **API**

### 4. Copy Credentials

Anda akan melihat 3 bagian penting:

#### a. Project URL
- Di bagian **"Project URL"**
- Copy URL lengkapnya (contoh: `https://abcdefghijklmnop.supabase.co`)
- Ini untuk `NEXT_PUBLIC_SUPABASE_URL`

#### b. anon public key
- Di bagian **"Project API keys"**
- Cari key dengan label **"anon"** dan **"public"**
- Copy key-nya (panjang, dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- Ini untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### c. service_role key (SECRET!)
- Di bagian yang sama, cari key dengan label **"service_role"** dan **"secret"**
- ⚠️ **PENTING**: Key ini sangat rahasia, jangan share ke siapa pun!
- Copy key-nya (juga panjang, dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- Ini untuk `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Update File .env

Setelah dapat semua credentials, buka file `.env` di root project dan update:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ganti:**
- `https://xxxxx.supabase.co` dengan Project URL Anda
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` dengan key yang sesuai

## ✅ Test Setelah Update

Setelah update `.env`, jalankan:

```bash
npm run test:supabase
```

Jika semua berhasil, Anda akan melihat:
```
✅ All environment variables are set
✅ URL format is valid
✅ Anon key connection successful
✅ Service role key connection successful
✅ Database tables are accessible
🎉 All tests passed!
```

## 🐛 Troubleshooting

### Jika tidak bisa menemukan service_role key:
1. Pastikan Anda login sebagai owner/admin project
2. Scroll ke bawah di halaman API settings
3. Key mungkin tersembunyi, klik "Reveal" atau icon mata untuk melihat

### Jika key tidak bekerja:
- Pastikan tidak ada spasi di awal/akhir key
- Pastikan key dalam tanda kutip `""`
- Pastikan project Supabase tidak dalam status "Paused"
