-- Add engagement and project details fields to jobs table
-- These fields match Upwork-style job postings

DO $$ 
BEGIN
    -- Add scope_of_work (TEXT) - for detailed scope of work description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'scope_of_work'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN scope_of_work TEXT;
        RAISE NOTICE '✅ Added scope_of_work column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ scope_of_work column already exists';
    END IF;

    -- Add engagement_type (TEXT) - 'Hourly' or 'Fixed'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'engagement_type'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN engagement_type TEXT;
        RAISE NOTICE '✅ Added engagement_type column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ engagement_type column already exists';
    END IF;

    -- Add hours_per_week (TEXT) - 'Less than 30 hrs/week' or 'More than 30 hrs/week'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'hours_per_week'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN hours_per_week TEXT;
        RAISE NOTICE '✅ Added hours_per_week column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ hours_per_week column already exists';
    END IF;

    -- Add duration (TEXT) - 'Less than 1 month', '1-3 months', '3-6 months', '6+ months'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN duration TEXT;
        RAISE NOTICE '✅ Added duration column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ duration column already exists';
    END IF;

    -- Add experience_level (TEXT) - 'Entry', 'Intermediate', 'Expert'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'experience_level'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN experience_level TEXT;
        RAISE NOTICE '✅ Added experience_level column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ experience_level column already exists';
    END IF;

    -- Add project_type (TEXT) - 'One-time project' or 'Ongoing project'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs' 
        AND column_name = 'project_type'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN project_type TEXT;
        RAISE NOTICE '✅ Added project_type column to jobs table';
    ELSE
        RAISE NOTICE 'ℹ️ project_type column already exists';
    END IF;

    RAISE NOTICE '✅ All engagement fields added successfully!';
END $$;
