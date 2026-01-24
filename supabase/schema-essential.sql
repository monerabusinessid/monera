-- ============================================
-- SUPABASE ESSENTIAL SCHEMA (Progress Bertahap)
-- ============================================
-- Run this in Supabase SQL Editor
-- Hanya tabel yang diperlukan untuk progress saat ini
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
        'CLIENT',
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
        'JOB_FLAGGED',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DELETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PROFILES TABLE (Main user table)
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

-- RLS Policies for profiles (basic - can be refined later)
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
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    last_validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- Add user_id column if table exists but column doesn't (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'user_id') THEN
            ALTER TABLE public.talent_profiles ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================
-- COMPANIES (For recruiters/clients)
-- ============================================

CREATE TABLE IF NOT EXISTS public.companies (
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

CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- Add user_id column if table exists but column doesn't (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recruiter_profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recruiter_profiles' AND column_name = 'user_id') THEN
            ALTER TABLE public.recruiter_profiles ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================
-- JOBS
-- ============================================
-- Note: Using TEXT for id to match existing structure
-- If you want to use UUID, change id to UUID and update _JobSkills accordingly

CREATE TABLE IF NOT EXISTS public.jobs (
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
-- Note: Using TEXT for id to match existing structure
-- If you want to use UUID, change id to UUID and update _JobSkills accordingly

CREATE TABLE IF NOT EXISTS public.skills (
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

CREATE TABLE IF NOT EXISTS public._JobSkills (
    "A" TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE INDEX IF NOT EXISTS "_JobSkills_B_index" ON public._JobSkills("B");

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.applications (
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

CREATE TABLE IF NOT EXISTS public.talent_requests (
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

CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- Create indexes with error handling in case tables/columns don't exist yet
DO $$ 
BEGIN
    -- Talent profiles indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'talent_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);
        END IF;
    END IF;
    
    -- Recruiter profiles indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recruiter_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recruiter_profiles' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user_id ON public.recruiter_profiles(user_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recruiter_profiles' AND column_name = 'company_id') THEN
            CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_company_id ON public.recruiter_profiles(company_id);
        END IF;
    END IF;
    
    -- Jobs indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'recruiter_id') THEN
            CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'company_id') THEN
            CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
        END IF;
    END IF;
    
    -- Applications indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'job_id') THEN
            CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'candidate_id') THEN
            CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
        END IF;
    END IF;
    
    -- Audit logs indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'admin_id') THEN
            CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
        END IF;
    END IF;
END $$;
