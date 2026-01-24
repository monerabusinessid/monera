# Penjelasan Table Skills di Database

## Table yang Terkait dengan Skills

### 1. `skills` (Main Table) ✅ **YANG DIPAKAI**
- **Fungsi**: Menyimpan daftar semua skills yang tersedia di platform
- **Kolom**:
  - `id` (TEXT, PRIMARY KEY)
  - `name` (TEXT, UNIQUE) - Nama skill (contoh: "Canva", "Notion", "PHP 5")
  - `category` (TEXT) - Kategori skill (contoh: "Design", "Marketing", "Programming")
  - `created_at` (TIMESTAMP)
- **Digunakan oleh**: 
  - Admin panel untuk menambah/edit skills
  - Client panel untuk memilih skills saat post job
  - Talent panel untuk memilih skills di profile

### 2. `_JobSkills` (Junction Table) ✅ **YANG DIPAKAI**
- **Fungsi**: Menghubungkan jobs dengan skills (many-to-many relationship)
- **Kolom**:
  - `A` (TEXT) - Job ID (references `jobs.id`)
  - `B` (TEXT) - Skill ID (references `skills.id`)
- **Digunakan oleh**: 
  - Saat client post job dan memilih skills
  - Saat menampilkan skills yang dibutuhkan untuk suatu job

### 3. `_CandidateSkills` (Junction Table) ✅ **YANG DIPAKAI**
- **Fungsi**: Menghubungkan talent profiles dengan skills (many-to-many relationship)
- **Kolom**:
  - `A` (TEXT) - Talent Profile ID (references `talent_profiles.id`)
  - `B` (TEXT) - Skill ID (references `skills.id`)
- **Digunakan oleh**: 
  - Saat talent mengisi skills di profile mereka
  - Saat mencari talent berdasarkan skills

## Kesimpulan

**Semua 3 table digunakan dan penting:**
- `skills` = Master data skills
- `_JobSkills` = Relasi jobs dengan skills
- `_CandidateSkills` = Relasi talent dengan skills

## Troubleshooting: Skills Tidak Muncul di Form Post Job

Jika skills sudah ditambahkan di admin panel tapi tidak muncul di form post job, kemungkinan masalahnya:

1. **RLS (Row Level Security)**: Table `skills` mungkin memiliki RLS policy yang memblokir akses
2. **Format Response API**: Response dari `/api/skills` mungkin tidak sesuai format yang diharapkan
3. **Caching**: Browser mungkin cache response lama

### Solusi:
1. Pastikan RLS policy untuk table `skills` mengizinkan SELECT untuk semua user (atau disable RLS untuk development)
2. Check console browser untuk melihat response dari `/api/skills`
3. Check network tab untuk melihat apakah request berhasil
