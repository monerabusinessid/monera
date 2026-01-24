-- ============================================
-- CREATE PROFILES TABLE ONLY
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates only the profiles table needed for Supabase Auth
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (only if not exists)
-- ============================================

-- Check if UserRole enum exists, if yes, add missing values
DO $$ 
BEGIN
    -- Try to create enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM (
            'SUPER_ADMIN',
            'QUALITY_ADMIN',
            'SUPPORT_ADMIN',
            'ANALYST',
            'RECRUITER',
            'TALENT',
            'CANDIDATE'
        );
    ELSE
        -- Enum exists, add missing values if needed
        -- Add TALENT if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TALENT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
            ALTER TYPE "UserRole" ADD VALUE 'TALENT';
        END IF;
        -- Add SUPER_ADMIN if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
            ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
        END IF;
        -- Add QUALITY_ADMIN if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'QUALITY_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
            ALTER TYPE "UserRole" ADD VALUE 'QUALITY_ADMIN';
        END IF;
        -- Add SUPPORT_ADMIN if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPPORT_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
            ALTER TYPE "UserRole" ADD VALUE 'SUPPORT_ADMIN';
        END IF;
        -- Add ANALYST if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ANALYST' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
            ALTER TYPE "UserRole" ADD VALUE 'ANALYST';
        END IF;
    END IF;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role "UserRole" NOT NULL DEFAULT 'CANDIDATE', -- Use CANDIDATE as default (exists in old enum)
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ============================================
-- BASIC RLS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "users_can_read_own_profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Service role can do everything (for seed scripts)
CREATE POLICY "service_role_full_access" ON public.profiles
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- RECRUITER PROFILES (if needed)
-- ============================================

CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CANDIDATE PROFILES (if needed)
-- ============================================

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
