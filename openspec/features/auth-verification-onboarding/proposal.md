# Authentication, Verification & Onboarding System

## Overview
Implementasi sistem autentikasi dengan verifikasi kode (Google OAuth & Email), onboarding flow untuk talent, dan company document verification system dengan admin approval.

## User Stories

### As a Talent
- Saya ingin mendaftar menggunakan Google account atau email biasa
- Saya ingin menerima kode verifikasi untuk memverifikasi akun saya
- Setelah verifikasi, saya ingin langsung masuk ke onboarding flow
- Setelah menyelesaikan onboarding, saya ingin diarahkan ke `/talent` dashboard
- Ketika reload page, saya ingin tetap di `/talent` tanpa kembali ke onboarding

### As a Company/Client
- Saya ingin mendaftar menggunakan Google account atau email biasa
- Saya ingin menerima kode verifikasi untuk memverifikasi akun saya
- Setelah verifikasi, saya ingin langsung masuk ke halaman kelengkapan berkas perusahaan
- Setelah submit berkas, saya ingin diarahkan ke `/client` dashboard
- Ketika reload page, saya ingin tetap di `/client` tanpa kembali ke halaman berkas
- Saya ingin melihat status review berkas saya

### As an Admin
- Saya ingin melihat daftar perusahaan yang submit berkas untuk review
- Saya ingin bisa approve/reject berkas perusahaan
- Saya ingin bisa memberikan catatan/feedback untuk rejection

## Technical Requirements

### 1. Authentication System
- Support Google OAuth 2.0
- Support email/password registration
- Email verification dengan 6-digit code
- JWT token management
- Session persistence

### 2. Verification Flow
- Generate 6-digit verification code
- Send via email (Nodemailer)
- Code expiration (15 minutes)
- Resend functionality
- Rate limiting untuk prevent spam

### 3. User State Management
- `isVerified`: boolean
- `onboardingCompleted`: boolean (talent)
- `documentsSubmitted`: boolean (company)
- `documentsApproved`: enum ['pending', 'approved', 'rejected']

### 4. Routing Logic
```
Talent Flow:
- Not verified → /auth/verify
- Verified + !onboardingCompleted → /onboarding
- Verified + onboardingCompleted → /talent

Company Flow:
- Not verified → /auth/verify  
- Verified + !documentsSubmitted → /company/documents
- Verified + documentsSubmitted → /client
```

### 5. Admin Panel Features
- Company documents review dashboard
- Approve/reject functionality
- Document preview/download
- Notification system untuk status changes

## Database Schema Updates

### Users Table
```sql
ALTER TABLE users ADD COLUMN verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN verification_code_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
```

### Candidate Profiles Table
```sql
ALTER TABLE candidate_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

### Recruiter Profiles Table
```sql
ALTER TABLE recruiter_profiles ADD COLUMN documents_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE recruiter_profiles ADD COLUMN documents_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE recruiter_profiles ADD COLUMN admin_notes TEXT;
```

### Company Documents Table (New)
```sql
CREATE TABLE company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'business_license', 'tax_certificate', etc.
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password or Google
- `POST /api/auth/verify` - Verify email with code
- `POST /api/auth/resend-code` - Resend verification code
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback

### User State
- `GET /api/user/state` - Get current user state for routing
- `PUT /api/user/onboarding-complete` - Mark onboarding as completed

### Company Documents
- `POST /api/company/documents` - Upload company documents
- `GET /api/company/documents` - Get company documents
- `PUT /api/company/documents/submit` - Submit documents for review

### Admin (Company Review)
- `GET /api/admin/companies/pending` - Get companies pending review
- `PUT /api/admin/companies/[id]/approve` - Approve company
- `PUT /api/admin/companies/[id]/reject` - Reject company with notes

## Implementation Plan

### Phase 1: Authentication & Verification
1. Setup Google OAuth configuration
2. Create verification code system
3. Update registration/login flows
4. Implement email verification

### Phase 2: User State & Routing
1. Add user state fields to database
2. Create middleware untuk route protection
3. Implement routing logic based on user state
4. Update existing auth flows

### Phase 3: Onboarding Flow
1. Create onboarding pages untuk talent
2. Implement onboarding completion tracking
3. Update routing untuk post-onboarding

### Phase 4: Company Documents System
1. Create company documents upload page
2. Implement file upload functionality
3. Create document submission flow
4. Update routing untuk post-submission

### Phase 5: Admin Panel
1. Create admin dashboard untuk company review
2. Implement approve/reject functionality
3. Add notification system
4. Create document preview functionality

## Security Considerations
- Rate limiting untuk verification attempts
- File upload validation dan sanitization
- Secure file storage (cloud storage recommended)
- Admin role-based access control
- CSRF protection untuk admin actions

## Testing Strategy
- Unit tests untuk verification logic
- Integration tests untuk auth flows
- E2E tests untuk complete user journeys
- Load testing untuk verification system

## Success Metrics
- Verification completion rate > 95%
- Onboarding completion rate > 80%
- Document submission completion rate > 70%
- Admin review processing time < 24 hours