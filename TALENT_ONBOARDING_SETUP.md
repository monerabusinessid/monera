# Talent Onboarding System - Setup Guide

## Overview
Sistem onboarding talent yang lengkap dengan status-based access control. User harus menyelesaikan onboarding dan mendapatkan approval sebelum bisa mengakses job pages.

## Database Setup

### 1. Run Schema Updates
Jalankan script berikut di Supabase SQL Editor:

```sql
-- File: supabase/talent-onboarding-schema.sql
```

Script ini akan:
- Menambahkan kolom `status`, `revision_notes`, `country`, `timezone` ke table `profiles`
- Menambahkan kolom `submitted_at`, `intro_video_url`, `portfolio_url` ke table `talent_profiles`
- Membuat index untuk status lookups
- Membuat trigger untuk update `submitted_at` otomatis

### 2. Setup Storage Bucket
Jalankan script berikut di Supabase SQL Editor:

```sql
-- File: supabase/setup-intro-videos-bucket.sql
```

Script ini akan:
- Membuat bucket `intro-videos` untuk menyimpan video intro
- Setup RLS policies untuk upload/view/update/delete videos
- Membuat policy untuk admin access

## Routes Structure

### `/user/*` Routes
- `/user/onboarding` - Step-based profile completion (4 steps)
- `/user/profile` - Edit profile
- `/user/status` - Approval status & feedback
- `/user/jobs` - Job listing (LOCKED until APPROVED)
- `/user/jobs/[jobId]` - Job detail & apply
- `/user/applications` - Applications list

## Status Flow

1. **DRAFT** - User sedang mengisi profile di onboarding
2. **SUBMITTED** - Profile sudah di-submit, menunggu review
3. **NEED_REVISION** - Profile perlu revisi, admin memberikan feedback
4. **APPROVED** - Profile approved, user bisa akses jobs
5. **REJECTED** - Profile ditolak

## Access Control

### Middleware Protection
- Routes `/user/jobs` dan `/user/apply` hanya bisa diakses jika status = APPROVED
- Jika status ≠ APPROVED, redirect ke `/user/status` atau `/user/onboarding`
- Layout menampilkan status banner di semua pages

### Status-Based Redirects
- DRAFT → `/user/onboarding`
- SUBMITTED/NEED_REVISION/REJECTED → `/user/status`
- APPROVED → `/user/jobs`

## User Flow

1. **Register/Login** → Redirect ke `/user/onboarding`
2. **Complete Onboarding** (4 steps):
   - Step 1: Identity (name, country, timezone)
   - Step 2: Skills (select from available skills)
   - Step 3: Experience (description, portfolio URL)
   - Step 4: Video Intro (upload video)
3. **Submit Profile** → Status menjadi SUBMITTED
4. **Wait for Review** → Admin review profile
5. **If NEED_REVISION**:
   - View revision notes
   - Edit profile
   - Re-submit
6. **If APPROVED**:
   - Unlock job pages
   - Can browse and apply to jobs

## API Endpoints

### `/api/user/profile`
- GET: Fetch user profile data
- PUT: Update profile (via `/api/user/profile/update`)

### `/api/user/profile/submit`
- POST: Submit profile for review (status → SUBMITTED)

### `/api/user/upload-video`
- POST: Upload intro video to Supabase Storage

## Update Required

### Register/Login Redirect
Update redirect untuk TALENT users:
- Register: Redirect ke `/user/onboarding` (bukan `/talent/dashboard`)
- Login: Redirect ke `/user/onboarding` jika status = DRAFT, atau `/user/jobs` jika APPROVED

## Testing Checklist

- [ ] Run database schema updates
- [ ] Setup storage bucket
- [ ] Test onboarding flow (all 4 steps)
- [ ] Test profile submission
- [ ] Test status page display
- [ ] Test access control (try accessing /user/jobs with DRAFT status)
- [ ] Test profile editing
- [ ] Test video upload
- [ ] Test job browsing (after approval)
- [ ] Test job application

## Notes

- All writes use Server Actions/API routes with admin client for RLS bypass
- Status banner appears on all `/user/*` pages if status ≠ APPROVED
- Middleware handles route gating automatically
- Profile data is fetched from both `profiles` and `talent_profiles` tables
