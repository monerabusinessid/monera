-- ============================================
-- SUPABASE ADMIN PANEL SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM (
        'SUPER_ADMIN',
        'QUALITY_ADMIN',
        'SUPPORT_ADMIN',
        'ANALYST',
        'RECRUITER',
        'TALENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuditAction" AS ENUM (
        'TALENT_APPROVED',
        'TALENT_REJECTED',
        'TALENT_SUSPENDED',
        'TALENT_UNSUSPENDED',
        'ROLE_CHANGED',
        'SETTINGS_UPDATED',
        'JOB_APPROVED',
        'JOB_REJECTED',
        'JOB_FLAGGED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role "UserRole" NOT NULL DEFAULT 'TALENT',
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TALENT PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS public.talent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    portfolio_url TEXT,
    availability TEXT DEFAULT 'Open',
    profile_completion DECIMAL(5, 2) DEFAULT 0,
    is_profile_ready BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    remote BOOLEAN DEFAULT false,
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'USD',
    status "JobStatus" NOT NULL DEFAULT 'DRAFT',
    company_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
    status "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    cover_letter TEXT,
    resume_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, talent_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TALENT SKILLS (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS public.talent_skills (
    talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (talent_id, skill_id)
);

ALTER TABLE public.talent_skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB SKILLS (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS public.job_skills (
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action "AuditAction" NOT NULL,
    target_type TEXT NOT NULL, -- 'user', 'talent', 'job', 'settings'
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS "UserRole" AS $$
    SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    FROM public.profiles
    WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT role = 'SUPER_ADMIN'
    FROM public.profiles
    WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- SUPER_ADMIN: Full access
CREATE POLICY "super_admin_full_access" ON public.profiles
    FOR ALL
    USING (is_super_admin(auth.uid()));

-- QUALITY_ADMIN: Read all, update status
CREATE POLICY "quality_admin_read_all" ON public.profiles
    FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "quality_admin_update_status" ON public.profiles
    FOR UPDATE
    USING (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'))
    WITH CHECK (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'));

-- SUPPORT_ADMIN: Read-only
CREATE POLICY "support_admin_read" ON public.profiles
    FOR SELECT
    USING (is_admin(auth.uid()));

-- ANALYST: Read-only
CREATE POLICY "analyst_read" ON public.profiles
    FOR SELECT
    USING (is_admin(auth.uid()));

-- Users can read their own profile
CREATE POLICY "users_read_own" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- ============================================
-- TALENT PROFILES POLICIES
-- ============================================

-- SUPER_ADMIN: Full access
CREATE POLICY "super_admin_talent_full" ON public.talent_profiles
    FOR ALL
    USING (is_super_admin(auth.uid()));

-- QUALITY_ADMIN: Read/Write
CREATE POLICY "quality_admin_talent_rw" ON public.talent_profiles
    FOR ALL
    USING (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'))
    WITH CHECK (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'));

-- SUPPORT_ADMIN: Read-only
CREATE POLICY "support_admin_talent_read" ON public.talent_profiles
    FOR SELECT
    USING (get_user_role(auth.uid()) = 'SUPPORT_ADMIN');

-- ANALYST: Read-only
CREATE POLICY "analyst_talent_read" ON public.talent_profiles
    FOR SELECT
    USING (get_user_role(auth.uid()) = 'ANALYST');

-- Talent can read/update own profile
CREATE POLICY "talent_own_profile" ON public.talent_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- JOBS POLICIES
-- ============================================

-- SUPER_ADMIN: Full access
CREATE POLICY "super_admin_jobs_full" ON public.jobs
    FOR ALL
    USING (is_super_admin(auth.uid()));

-- QUALITY_ADMIN: Read/Write
CREATE POLICY "quality_admin_jobs_rw" ON public.jobs
    FOR ALL
    USING (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'))
    WITH CHECK (get_user_role(auth.uid()) IN ('QUALITY_ADMIN', 'SUPER_ADMIN'));

-- ANALYST: Read-only
CREATE POLICY "analyst_jobs_read" ON public.jobs
    FOR SELECT
    USING (get_user_role(auth.uid()) = 'ANALYST');

-- Recruiters can manage their own jobs
CREATE POLICY "recruiters_own_jobs" ON public.jobs
    FOR ALL
    USING (
        auth.uid() = recruiter_id AND
        get_user_role(auth.uid()) = 'RECRUITER'
    )
    WITH CHECK (
        auth.uid() = recruiter_id AND
        get_user_role(auth.uid()) = 'RECRUITER'
    );

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

-- All admins can read
CREATE POLICY "admins_read_applications" ON public.applications
    FOR SELECT
    USING (is_admin(auth.uid()));

-- Recruiters can read applications for their jobs
CREATE POLICY "recruiters_read_applications" ON public.applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = applications.job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- Talent can read own applications
CREATE POLICY "talent_read_own_applications" ON public.applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.talent_profiles
            WHERE talent_profiles.id = applications.talent_id
            AND talent_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can read audit logs
CREATE POLICY "admins_read_audit_logs" ON public.audit_logs
    FOR SELECT
    USING (is_admin(auth.uid()));

-- Only admins can insert audit logs
CREATE POLICY "admins_insert_audit_logs" ON public.audit_logs
    FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- SYSTEM SETTINGS POLICIES
-- ============================================

-- SUPER_ADMIN only: Full access
CREATE POLICY "super_admin_settings_full" ON public.system_settings
    FOR ALL
    USING (is_super_admin(auth.uid()))
    WITH CHECK (is_super_admin(auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
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

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INITIAL SYSTEM SETTINGS
-- ============================================

INSERT INTO public.system_settings (key, value, description)
VALUES
    ('profile_readiness_threshold', '{"value": 80}', 'Minimum profile completion % for readiness'),
    ('matching_weight_skills', '{"value": 0.4}', 'Weight for skills in job matching'),
    ('matching_weight_experience', '{"value": 0.3}', 'Weight for experience in job matching'),
    ('matching_weight_rate', '{"value": 0.3}', 'Weight for rate in job matching')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Supabase Admin Panel schema created successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Create a SUPER_ADMIN user via Supabase Auth';
    RAISE NOTICE '   2. Insert profile with role SUPER_ADMIN';
    RAISE NOTICE '   3. Configure environment variables';
END $$;
