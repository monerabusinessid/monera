# Fix Video Upload Bucket Error

## Error: "Failed to upload video: Bucket not found"

Error ini terjadi karena bucket `intro-videos` belum dibuat di Supabase Storage.

## Solusi

### Opsi 1: Buat Bucket via Dashboard (RECOMMENDED - Paling Mudah)

1. Buka **Supabase Dashboard** → **Storage**
2. Klik **New bucket** atau **Create bucket**
3. Isi form:
   - **Name**: `intro-videos`
   - **Public bucket**: `OFF` (unchecked - Private bucket)
   - **File size limit**: `104857600` (100MB)
   - **Allowed MIME types**: 
     ```
     video/mp4, video/webm, video/quicktime, video/x-msvideo, video/avi, video/mov
     ```
4. Klik **Create bucket**

### Opsi 2: Buat Bucket via SQL Editor (Jika Dashboard tidak tersedia)

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy dan paste script berikut (versi sederhana - hanya membuat bucket):

```sql
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'intro-videos',
    'intro-videos',
    false, -- Private bucket
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO UPDATE
SET 
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov'];
```

3. Klik **Run** untuk menjalankan script

### Langkah 2: Set RLS Policies via Dashboard

Setelah bucket dibuat, Anda perlu mengatur RLS (Row Level Security) policies:

1. Buka **Supabase Dashboard** → **Storage** → **intro-videos**
2. Klik tab **Policies**
3. Klik **New Policy** atau **Add Policy**

#### Policy 1: Users can upload their own videos

- **Policy name**: `Users can upload their own intro videos`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'intro-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

#### Policy 2: Users can view their own videos

- **Policy name**: `Users can view their own intro videos`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'intro-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

#### Policy 3: Users can update their own videos

- **Policy name**: `Users can update their own intro videos`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  (bucket_id = 'intro-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

#### Policy 4: Users can delete their own videos

- **Policy name**: `Users can delete their own intro videos`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  (bucket_id = 'intro-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

#### Policy 5: Admins can view all videos

- **Policy name**: `Admins can view all intro videos`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'intro-videos' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()::text
    AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
  ))
  ```

### Langkah 3: Verifikasi Bucket

Setelah bucket dan policies dibuat:

1. Buka **Supabase Dashboard** → **Storage**
2. Pastikan bucket `intro-videos` muncul di daftar
3. Klik bucket tersebut → **Policies**
4. Pastikan semua 5 policies sudah dibuat

### Langkah 4: Test Upload Video

1. Buka aplikasi dan login sebagai talent user
2. Buka halaman onboarding: `/user/onboarding`
3. Lanjutkan ke step 4 (Video Intro)
4. Upload video (max 100MB)
5. Pastikan tidak ada error

## Catatan

- **File Path Format**: `{user_id}/intro-video.{ext}`
  - Contoh: `123e4567-e89b-12d3-a456-426614174000/intro-video.mp4`
- **File Size Limit**: 100MB
- **Allowed Formats**: MP4, WebM, QuickTime, AVI, MOV
- **Bucket Type**: Private (users hanya bisa akses video mereka sendiri)
- **Admin Access**: Admin bisa melihat semua video

## Troubleshooting

### Error: "must be owner of table objects"

Jika Anda mendapat error ini saat menjalankan SQL script, gunakan **Opsi 1 (Dashboard)** untuk membuat bucket dan policies.

### Jika masih error setelah membuat bucket:

1. **Cek RLS Policies**: Pastikan semua policies sudah dibuat dengan benar via Dashboard
2. **Cek User Authentication**: Pastikan user sudah login
3. **Cek File Size**: Pastikan file tidak lebih dari 100MB
4. **Cek File Format**: Pastikan file adalah video format yang didukung

### Alternative: Buat Bucket Public (Tidak Recommended)

Jika Anda ingin membuat bucket public (semua orang bisa akses), ubah `public: false` menjadi `public: true`. Namun ini **TIDAK DISARANKAN** untuk video intro karena privacy concerns.

## File Script

- Script sederhana (hanya bucket): `supabase/create-intro-videos-bucket-simple.sql`
- Script lengkap (bucket + policies): `supabase/create-intro-videos-bucket.sql` (mungkin memerlukan owner privileges)
