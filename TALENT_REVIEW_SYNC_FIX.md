# Talent Review Data Synchronization Fix

## Problem
Data di halaman **Talent Review** tidak sama dengan data **Users** yang memiliki role TALENT. Ini menyebabkan kebingungan karena tidak semua talent user muncul di talent review.

## Solution
Mengubah logika Talent Review untuk menggunakan **profiles table** sebagai sumber utama data, bukan talent_profiles table.

## Changes Made

### 1. `/app/admin/talent-review/page.tsx`
**Before:**
- Fetch dari `talent_profiles` table
- Hanya menampilkan talent yang sudah punya talent_profile
- Data tidak sinkron dengan users table

**After:**
- Fetch semua user dengan `role = 'TALENT'` dari `profiles` table
- Enrich data dengan `talent_profiles` jika ada
- Fetch email dari Supabase Auth
- Semua talent user akan muncul di review

### 2. `/components/admin/talent-review-table.tsx`
**Changes:**
- Tambah field `email` ke interface Talent
- Tampilkan email di kolom talent (lebih informatif)
- Tambah email ke search filter

## Data Flow

```
profiles (role=TALENT) 
  ↓
  + talent_profiles (optional enrichment)
  ↓
  + auth.users (email)
  ↓
Talent Review Table
```

## Benefits

✅ **Sinkronisasi Data**: Semua talent user akan muncul di talent review
✅ **Konsistensi**: Data sama dengan Users page (filtered by role)
✅ **Informasi Lengkap**: Email ditampilkan untuk identifikasi lebih mudah
✅ **Backward Compatible**: Talent yang belum punya talent_profile tetap muncul

## Testing

1. Buka `/admin/talent-review`
2. Verifikasi semua user dengan role TALENT muncul
3. Check email ditampilkan dengan benar
4. Test search by email
5. Verifikasi profile completion dan status

## Notes

- Talent yang belum complete profile akan muncul dengan status PENDING
- Profile completion = 0% jika belum ada talent_profile
- Email diambil dari Supabase Auth (bukan dari profiles table)
