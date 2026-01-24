# Pengecekan Kolom Table `talent_profiles`

## 📋 Kolom yang Diperlukan

Berdasarkan implementasi fitur profile talent, berikut kolom yang diperlukan di table `talent_profiles`:

### ✅ Kolom yang Sudah Ada (dari schema)
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key ke `profiles(id)`
- `headline` (TEXT)
- `bio` (TEXT)
- `hourly_rate` (DECIMAL)
- `portfolio_url` (TEXT)
- `availability` (TEXT)
- `profile_completion` (DECIMAL)
- `is_profile_ready` (BOOLEAN)
- `status` (TEXT)
- `last_validated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### ⚠️ Kolom yang Perlu Ditambahkan

1. **`avatar_url`** (TEXT)
   - Untuk menyimpan URL avatar/profile picture
   - Type: TEXT
   - Nullable: YES

2. **`work_history`** (JSONB)
   - Untuk menyimpan array work history
   - Type: JSONB
   - Default: `[]` (empty array)
   - Format: `[{title, company, startDate, endDate, description}]`

3. **`education`** (JSONB)
   - Untuk menyimpan array education
   - Type: JSONB
   - Default: `[]` (empty array)
   - Format: `[{institution, degree, field, startYear, endYear}]`

4. **`languages`** (JSONB)
   - Untuk menyimpan array languages
   - Type: JSONB
   - Default: `[]` (empty array)
   - Format: `[{name, proficiency}]`

5. **`certifications`** (JSONB)
   - Untuk menyimpan array certifications
   - Type: JSONB
   - Default: `[]` (empty array)
   - Format: `[{name, issuer, issueDate, expiryDate, credentialUrl}]`

## 🔍 Cara Mengecek Kolom

### Langkah 1: Cek Kolom yang Ada
Jalankan script berikut di Supabase SQL Editor:

```sql
-- File: supabase/check-talent-profiles-columns.sql
```

Script ini akan menampilkan:
- Semua kolom yang ada di `talent_profiles`
- Status kolom yang diperlukan (ada/tidak ada)
- Tipe data kolom JSONB (jika ada)

### Langkah 2: Tambahkan Kolom yang Belum Ada
Jika ada kolom yang belum ada, jalankan script berikut:

```sql
-- File: supabase/add-talent-profiles-experience-columns.sql
```

Script ini akan:
- Menambahkan kolom `avatar_url` jika belum ada
- Menambahkan kolom `work_history` (JSONB) jika belum ada
- Menambahkan kolom `education` (JSONB) jika belum ada
- Menambahkan kolom `languages` (JSONB) jika belum ada
- Menambahkan kolom `certifications` (JSONB) jika belum ada
- Menampilkan verifikasi kolom yang baru ditambahkan

## 📝 Format Data JSONB

### Work History
```json
[
  {
    "title": "Senior Developer",
    "company": "Tech Corp",
    "startDate": "March 2022",
    "endDate": "Present",
    "description": "Led development team..."
  }
]
```

### Education
```json
[
  {
    "institution": "University of Technology",
    "degree": "Bachelor",
    "field": "Computer Science",
    "startYear": 2018,
    "endYear": 2022
  }
]
```

### Languages
```json
[
  {
    "name": "English",
    "proficiency": "Fluent"
  },
  {
    "name": "Indonesian",
    "proficiency": "Native"
  }
]
```

### Certifications
```json
[
  {
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "issueDate": "March 2023",
    "expiryDate": "March 2026",
    "credentialUrl": "https://..."
  }
]
```

## ✅ Verifikasi

Setelah menjalankan script, pastikan:
1. Semua kolom sudah ada
2. Tipe data sudah benar (TEXT untuk `avatar_url`, JSONB untuk yang lain)
3. Default value untuk JSONB adalah `[]` (empty array)

## 🚨 Troubleshooting

### Error: "column already exists"
- Kolom sudah ada, tidak perlu ditambahkan lagi
- Cek tipe data apakah sudah benar

### Error: "table does not exist"
- Table `talent_profiles` belum dibuat
- Jalankan script `supabase/schema-essential.sql` terlebih dahulu

### Error: "permission denied"
- Pastikan menggunakan service role key atau user dengan permission yang cukup
- Atau jalankan di Supabase Dashboard dengan akun admin

## 📌 Catatan Penting

1. **JSONB vs JSON**: Menggunakan JSONB karena lebih efisien untuk query dan indexing
2. **Default Value**: Semua kolom JSONB memiliki default `[]` untuk menghindari NULL
3. **Nullable**: Kolom `avatar_url` nullable karena tidak semua user punya avatar
4. **Indexing**: Tidak perlu index khusus untuk kolom JSONB karena data relatif kecil
