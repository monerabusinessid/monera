-- Fix RLS Policy for Jobs Table
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS for jobs table (for development/testing)
-- ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- Option 2: Create/Update RLS Policy to allow CLIENT/RECRUITER to create jobs
-- Drop existing policies if exists
DROP POLICY IF EXISTS "recruiters_own_jobs" ON public.jobs;
DROP POLICY IF EXISTS "clients_can_create_jobs" ON public.jobs;
DROP POLICY IF EXISTS "clients_recruiters_can_create_jobs" ON public.jobs;
DROP POLICY IF EXISTS "public_jobs_read" ON public.jobs;

-- Create policy for recruiters/clients to manage their own jobs
-- Handle type casting properly: recruiter_id is UUID, profiles.id might be TEXT or UUID
CREATE POLICY "recruiters_own_jobs" ON public.jobs
    FOR ALL
    USING (
        -- Check if user is admin
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id::text = auth.uid()::text
            AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
        )
        OR
        -- Check if user is CLIENT/RECRUITER and owns this job
        (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id::text = auth.uid()::text
                AND profiles.role IN ('CLIENT', 'RECRUITER')
            )
            AND jobs.recruiter_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        -- Check if user is admin
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id::text = auth.uid()::text
            AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
        )
        OR
        -- Check if user is CLIENT/RECRUITER and owns this job
        (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id::text = auth.uid()::text
                AND profiles.role IN ('CLIENT', 'RECRUITER')
            )
            AND jobs.recruiter_id::text = auth.uid()::text
        )
    );

-- Alternative: Simpler policy that allows CLIENT/RECRUITER to insert jobs
-- (This is more permissive but easier to manage)
CREATE POLICY "clients_recruiters_can_create_jobs" ON public.jobs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id::text = auth.uid()::text
            AND profiles.role IN ('CLIENT', 'RECRUITER', 'SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
        )
    );

-- Allow CLIENT/RECRUITER to read all published jobs
CREATE POLICY "public_jobs_read" ON public.jobs
    FOR SELECT
    USING (
        -- Anyone can read published jobs
        status = 'PUBLISHED'
        OR
        -- Admins can read all jobs
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id::text = auth.uid()::text
            AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
        )
        OR
        -- CLIENT/RECRUITER can read their own jobs
        (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id::text = auth.uid()::text
                AND profiles.role IN ('CLIENT', 'RECRUITER')
            )
            AND jobs.recruiter_id::text = auth.uid()::text
        )
    );

-- Verify RLS status
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'jobs';

-- List all policies on jobs table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'jobs';
