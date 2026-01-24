# Database Connection Guide - Talent Onboarding

## Overview
Semua API routes dan pages untuk talent onboarding sudah terhubung ke Supabase database.

## Database Tables

### 1. `profiles` Table
**Kolom yang digunakan:**
- `id` (UUID/TEXT) - Primary key, reference dari auth.users
- `full_name` (TEXT) - Nama lengkap user
- `country` (TEXT) - Negara user
- `timezone` (TEXT) - Timezone user
- `status` (TEXT) - Status profile: DRAFT, SUBMITTED, NEED_REVISION, APPROVED, REJECTED
- `revision_notes` (TEXT) - Catatan revisi dari admin
- `role` (TEXT) - Role user: TALENT, CANDIDATE, CLIENT, dll
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**API Routes:**
- `GET /api/user/profile` - Fetch profile data
- `PUT /api/user/profile/update` - Update profile
- `POST /api/user/profile/submit` - Submit profile (update status to SUBMITTED)

### 2. `talent_profiles` Table
**Kolom yang digunakan:**
- `id` (UUID) - Primary key
- `user_id` (UUID/TEXT) - Foreign key ke profiles.id
- `experience` (TEXT) - Pengalaman user
- `portfolio_url` (TEXT) - URL portfolio
- `intro_video_url` (TEXT) - URL video intro
- `submitted_at` (TIMESTAMP) - Waktu submit profile
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**API Routes:**
- `GET /api/user/profile` - Fetch talent profile data
- `POST /api/user/profile/submit` - Create/update talent profile
- `PUT /api/user/profile/update` - Update talent profile

### 3. `_CandidateSkills` Junction Table
**Kolom:**
- `A` (UUID/TEXT) - talent_profiles.id
- `B` (UUID/TEXT) - skills.id

**API Routes:**
- `POST /api/user/profile/submit` - Insert skill links
- `PUT /api/user/profile/update` - Update skill links

### 4. `skills` Table
**Kolom:**
- `id` (UUID/TEXT) - Primary key
- `name` (TEXT) - Nama skill
- `category` (TEXT) - Kategori skill

**API Routes:**
- `GET /api/skills` - Fetch all skills (used in onboarding)

### 5. `jobs` Table
**Kolom yang digunakan:**
- `id` (UUID/TEXT)
- `title` (TEXT)
- `description` (TEXT)
- `status` (TEXT) - PUBLISHED untuk jobs yang bisa dilihat
- `company_id` (UUID/TEXT)
- `recruiter_id` (UUID/TEXT)
- dll

**API Routes:**
- `GET /api/jobs?status=PUBLISHED` - Fetch published jobs (used in /user/jobs)

### 6. `applications` Table
**Kolom yang digunakan:**
- `id` (UUID/TEXT)
- `job_id` (UUID/TEXT)
- `candidate_id` (UUID/TEXT) - Reference ke profiles.id
- `status` (TEXT)
- `cover_letter` (TEXT)
- `expected_rate` (DECIMAL)
- dll

**API Routes:**
- `GET /api/applications?candidateId=me` - Fetch user applications
- `POST /api/applications` - Create new application

## Storage Bucket

### `intro-videos` Bucket
**Path format:** `{user_id}/intro-video.{ext}`

**API Routes:**
- `POST /api/user/upload-video` - Upload video intro

**RLS Policies:**
- Users can upload/view/update/delete their own videos
- Admins can view all videos

## Setup Steps

### 1. Run Database Schema
```sql
-- File: supabase/talent-onboarding-schema.sql
-- Menambahkan kolom status, revision_notes, country, timezone ke profiles
-- Menambahkan kolom experience, submitted_at, intro_video_url ke talent_profiles
```

### 2. Verify Schema
```sql
-- File: supabase/verify-talent-onboarding-schema.sql
-- Verifikasi semua kolom sudah ada
```

### 3. Setup Storage
```sql
-- File: supabase/setup-intro-videos-bucket.sql
-- Membuat bucket dan RLS policies
```

## API Routes Summary

### Profile Management
- `GET /api/user/profile` - Get profile data (profiles + talent_profiles + skills)
- `POST /api/user/profile/submit` - Submit profile for review
- `PUT /api/user/profile/update` - Update profile

### Video Upload
- `POST /api/user/upload-video` - Upload intro video to Supabase Storage

### Jobs & Applications
- `GET /api/jobs?status=PUBLISHED` - Get published jobs
- `GET /api/jobs/[id]` - Get job details
- `GET /api/applications?candidateId=me` - Get user applications
- `POST /api/applications` - Submit application

## Data Flow

### Onboarding Flow
1. User fills form → `POST /api/user/profile/submit`
2. API updates `profiles` table (status → SUBMITTED)
3. API creates/updates `talent_profiles` table
4. API updates `_CandidateSkills` junction table
5. Trigger updates `submitted_at` automatically

### Profile Update Flow
1. User edits profile → `PUT /api/user/profile/update`
2. API updates `profiles` table
3. API updates `talent_profiles` table
4. API updates `_CandidateSkills` junction table

### Job Application Flow
1. User applies → `POST /api/applications`
2. API creates record in `applications` table
3. `candidate_id` references `profiles.id` (not talent_profiles.id)

## Important Notes

1. **User ID Format:**
   - `profiles.id` = `auth.users.id` (UUID atau TEXT, tergantung setup)
   - `talent_profiles.user_id` references `profiles.id`
   - `applications.candidate_id` references `profiles.id`

2. **Status Values:**
   - DRAFT - Profile belum complete
   - SUBMITTED - Profile sudah di-submit, menunggu review
   - NEED_REVISION - Perlu revisi
   - APPROVED - Profile approved, bisa akses jobs
   - REJECTED - Profile ditolak

3. **Access Control:**
   - Middleware check status untuk gate routes
   - `/user/jobs` hanya bisa diakses jika status = APPROVED
   - Layout menampilkan status banner

4. **Error Handling:**
   - Semua API routes menggunakan try-catch
   - Error messages yang jelas
   - Logging untuk debugging

## Testing Checklist

- [ ] Run `supabase/talent-onboarding-schema.sql`
- [ ] Run `supabase/verify-talent-onboarding-schema.sql` (verify semua kolom ada)
- [ ] Run `supabase/setup-intro-videos-bucket.sql`
- [ ] Test onboarding flow (submit profile)
- [ ] Test profile update
- [ ] Test video upload
- [ ] Test job browsing (setelah approval)
- [ ] Test job application
- [ ] Test applications list
