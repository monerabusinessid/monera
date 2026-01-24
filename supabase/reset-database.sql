-- ============================================
-- RESET DATABASE - CREATE ULANG DARI AWAL
-- ============================================
-- ⚠️  WARNING: Script ini akan menghapus SEMUA data dan tabel!
-- Jalankan script ini di Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP ALL EXISTING INDEXES FIRST
-- ============================================

DROP INDEX IF EXISTS public._JobSkills_B_index CASCADE;
DROP INDEX IF EXISTS public._jobskills_B_index CASCADE;
DROP INDEX IF EXISTS public.idx_profiles_role CASCADE;
DROP INDEX IF EXISTS public.idx_profiles_status CASCADE;
DROP INDEX IF EXISTS public.idx_talent_profiles_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_recruiter_profiles_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_recruiter_profiles_company_id CASCADE;
DROP INDEX IF EXISTS public.idx_jobs_recruiter_id CASCADE;
DROP INDEX IF EXISTS public.idx_jobs_company_id CASCADE;
DROP INDEX IF EXISTS public.idx_jobs_status CASCADE;
DROP INDEX IF EXISTS public.idx_applications_job_id CASCADE;
DROP INDEX IF EXISTS public.idx_applications_candidate_id CASCADE;
DROP INDEX IF EXISTS public.idx_audit_logs_admin_id CASCADE;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at CASCADE;

-- ============================================
-- DROP TABLES YANG TIDAK DIPERLUKAN (untuk cleanup)
-- ============================================

-- Tabel yang tidak diperlukan (bisa dihapus)
DROP TABLE IF EXISTS public._CandidateSkills CASCADE;
DROP TABLE IF EXISTS public.candidate_profiles CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.languages CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.users CASCADE; -- Kita pakai profiles, bukan users
DROP TABLE IF EXISTS public.work_history CASCADE;

-- ============================================
-- DROP TABLES YANG AKAN DIBUAT ULANG
-- ============================================

DROP TABLE IF EXISTS public._JobSkills CASCADE;
DROP TABLE IF EXISTS public._jobskills CASCADE; -- Handle case sensitivity
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.talent_requests CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.recruiter_profiles CASCADE;
DROP TABLE IF EXISTS public.talent_profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop system settings if exists
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- ============================================
-- DROP ALL EXISTING ENUMS
-- ============================================

DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "JobStatus" CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "AuditAction" CASCADE;

-- ============================================
-- CREATE ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM (
    'SUPER_ADMIN',
    'QUALITY_ADMIN',
    'SUPPORT_ADMIN',
    'ANALYST',
    'CLIENT',
    'TALENT'
);

CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED');

CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

CREATE TYPE "AuditAction" AS ENUM (
    'TALENT_APPROVED',
    'TALENT_REJECTED',
    'TALENT_SUSPENDED',
    'TALENT_UNSUSPENDED',
    'ROLE_CHANGED',
    'SETTINGS_UPDATED',
    'JOB_APPROVED',
    'JOB_REJECTED',
    'JOB_FLAGGED',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED'
);

-- ============================================
-- PROFILES TABLE (Main user table)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role "UserRole" NOT NULL DEFAULT 'TALENT', -- Default untuk user baru
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
        )
    );

-- ============================================
-- TALENT PROFILES (Extended info for talents)
-- ============================================

CREATE TABLE public.talent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    portfolio_url TEXT,
    availability TEXT DEFAULT 'Open',
    profile_completion DECIMAL(5, 2) DEFAULT 0,
    is_profile_ready BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    last_validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMPANIES (For recruiters/clients)
-- ============================================

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RECRUITER PROFILES (Extended info for recruiters)
-- ============================================

CREATE TABLE public.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOBS
-- ============================================
-- Using TEXT for id to match existing structure

CREATE TABLE public.jobs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    remote BOOLEAN DEFAULT false,
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'USD',
    status "JobStatus" NOT NULL DEFAULT 'DRAFT',
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SKILLS
-- ============================================
-- Using TEXT for id to match existing structure

CREATE TABLE public.skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB SKILLS (Many-to-Many)
-- ============================================
-- Using TEXT for both columns to match existing structure

CREATE TABLE public._JobSkills (
    "A" TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE INDEX IF NOT EXISTS "_JobSkills_B_index" ON public._JobSkills("B");

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    cover_letter TEXT,
    resume_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TALENT REQUESTS
-- ============================================

CREATE TABLE public.talent_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    talent_type TEXT NOT NULL,
    budget TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.talent_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action "AuditAction" NOT NULL,
    target_type TEXT NOT NULL, -- 'user', 'job', 'talent', etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON public.recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_company_id ON public.recruiter_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================
-- TRIGGERS for auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at
    BEFORE UPDATE ON public.talent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at
    BEFORE UPDATE ON public.recruiter_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_requests_updated_at
    BEFORE UPDATE ON public.talent_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database berhasil di-reset dan dibuat ulang!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Create admin users via Supabase Auth';
    RAISE NOTICE '   2. Insert profiles dengan role SUPER_ADMIN';
    RAISE NOTICE '   3. Test aplikasi';
END $$;
