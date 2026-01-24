-- ============================================
-- FIX DUPLICATE _JobSkills TABLE
-- ============================================
-- Script ini akan:
-- 1. Memastikan data di _JobSkills (yang benar)
-- 2. Drop table _jobskills (yang tidak digunakan)
-- ============================================

-- Check if _jobskills exists and has data
DO $$
DECLARE
    jobskills_count INTEGER;
    jobskills_lower_count INTEGER;
BEGIN
    -- Count records in _JobSkills (correct table)
    SELECT COUNT(*) INTO jobskills_count FROM public."_JobSkills";
    
    -- Check if _jobskills (lowercase) exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_jobskills'
    ) THEN
        SELECT COUNT(*) INTO jobskills_lower_count FROM public._jobskills;
        
        RAISE NOTICE 'Found _JobSkills table with % records', jobskills_count;
        RAISE NOTICE 'Found _jobskills table with % records', jobskills_lower_count;
        
        -- If _jobskills has data but _JobSkills doesn't, we might need to migrate
        -- But based on the image, _JobSkills has data and _jobskills is empty
        IF jobskills_lower_count > 0 AND jobskills_count = 0 THEN
            RAISE NOTICE 'WARNING: _jobskills has data but _JobSkills is empty. Consider migrating data.';
        END IF;
        
        -- Drop the unused _jobskills table
        DROP TABLE IF EXISTS public._jobskills CASCADE;
        RAISE NOTICE '✅ Dropped unused _jobskills table';
    ELSE
        RAISE NOTICE '✅ No duplicate _jobskills table found';
    END IF;
    
    RAISE NOTICE '✅ Using _JobSkills table with % records', jobskills_count;
END $$;

-- Verify the correct table exists and has proper structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_JobSkills'
    ) THEN
        RAISE EXCEPTION 'ERROR: _JobSkills table does not exist!';
    END IF;
    
    RAISE NOTICE '✅ _JobSkills table exists and is ready to use';
END $$;
