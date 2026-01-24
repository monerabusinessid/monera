# Fix: Header Settings Tidak Update di Landing Page

## 🔧 Perbaikan yang Sudah Dilakukan

1. **Error Handling** - Menambahkan Promise.allSettled untuk menangani error per field
2. **Logging** - Menambahkan console.log untuk debugging
3. **Cache Control** - Menambahkan cache headers untuk mencegah cache
4. **Data Merging** - Memastikan data dari API di-merge dengan benar

## 📋 Langkah Troubleshooting

### 1. Cek Browser Console

**Di Admin Panel:**
1. Buka Admin Panel → Landing Page → Header
2. Buka Developer Tools (F12)
3. Isi form dan klik "Save Header Settings"
4. Cek console untuk log:
   - `Saving header settings:` - Data yang akan disimpan
   - `Updating setting: hero_image_url = ...` - Setiap field yang disimpan
   - `Setting hero_image_url updated successfully:` - Konfirmasi save berhasil
   - `All header settings saved successfully` - Semua berhasil
   - Atau error message jika ada masalah

**Di Landing Page:**
1. Buka landing page (`/`)
2. Buka Developer Tools (F12)
3. Cek console untuk log:
   - `Header settings fetched from API:` - Data dari API
   - `Merged header settings:` - Data setelah merge
   - `Header image URL updated:` - URL gambar yang digunakan

### 2. Cek Database Langsung

1. **Buka Supabase Dashboard**
   - Login ke: https://supabase.com/dashboard
   - Pilih project Anda

2. **Cek Table `landing_page_settings`**
   - Buka **Table Editor** → `landing_page_settings`
   - Cek apakah ada rows dengan keys:
     - `hero_image_url`
     - `hero_title`
     - `hero_subtitle`
     - `hero_description`
     - dll

3. **Verifikasi Data**
   - Pastikan `value` field tidak kosong
   - Pastikan `key` field benar (case-sensitive)
   - Pastikan `updated_at` ter-update setelah save

### 3. Test API Langsung

**Test GET:**
```bash
# Di browser console atau Postman
fetch('/api/landing/settings')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Test PUT:**
```bash
# Di browser console
fetch('/api/landing/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    key: 'hero_title', 
    value: 'Test Title' 
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### 4. Hard Refresh

Setelah save di admin panel:
1. **Hard refresh landing page:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

2. **Clear browser cache:**
   - Buka DevTools (F12)
   - Klik kanan tombol refresh
   - Pilih "Empty Cache and Hard Reload"

### 5. Cek Network Tab

1. **Buka Developer Tools** (F12)
2. **Buka tab Network**
3. **Filter by "settings"**
4. **Save di admin panel** dan lihat request:
   - Cek apakah request berhasil (status 200)
   - Cek response body
   - Cek apakah ada error

5. **Refresh landing page** dan lihat request:
   - Cek apakah data yang di-fetch benar
   - Cek apakah ada cache issue

## 🛠️ Solusi untuk Masalah Umum

### Masalah 1: Data Tidak Ter-Save

**Gejala:** Save berhasil tapi data tidak ada di database

**Solusi:**
1. Cek console untuk error
2. Cek apakah table `landing_page_settings` ada
3. Cek apakah user punya permission untuk write

### Masalah 2: Data Ter-Save Tapi Tidak Tampil

**Gejala:** Data ada di database tapi tidak tampil di landing page

**Solusi:**
1. Hard refresh browser
2. Cek console untuk melihat data yang di-fetch
3. Cek apakah key di database sama dengan yang di-fetch
4. Clear cache `.next` folder:
   ```bash
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

### Masalah 3: Hanya Beberapa Field yang Update

**Gejala:** Beberapa field update, beberapa tidak

**Solusi:**
1. Cek console untuk melihat field mana yang gagal
2. Pastikan semua field memiliki value (tidak null/undefined)
3. Cek apakah ada error di database untuk field tertentu

### Masalah 4: Cache Issue

**Gejala:** Data update di database tapi landing page masih menampilkan data lama

**Solusi:**
1. Hard refresh browser
2. Clear `.next` cache
3. Restart dev server
4. Cek apakah cache headers sudah ditambahkan (sudah dilakukan)

## 📝 Checklist

- [ ] Console tidak ada error saat save
- [ ] Data ter-save di database (cek di Supabase)
- [ ] API GET mengembalikan data yang benar
- [ ] Landing page fetch data dengan benar (cek console)
- [ ] Sudah hard refresh browser
- [ ] Sudah clear cache `.next`
- [ ] Key di database sama dengan yang digunakan di code

## 🔄 Langkah Perbaikan Cepat

1. **Save di Admin Panel:**
   - Buka Admin Panel → Landing Page → Header
   - Isi semua field
   - Klik "Save Header Settings"
   - Cek console untuk konfirmasi

2. **Verifikasi di Database:**
   - Buka Supabase Dashboard
   - Cek table `landing_page_settings`
   - Pastikan data sudah ter-save

3. **Test di Landing Page:**
   - Buka landing page
   - Hard refresh (`Ctrl + Shift + R`)
   - Cek console untuk log
   - Cek apakah data tampil

4. **Jika Masih Tidak Tampil:**
   - Clear `.next` cache
   - Restart dev server
   - Hard refresh lagi
