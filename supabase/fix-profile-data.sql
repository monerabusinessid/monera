-- Script to fix profile data issues:
-- 1. Update status to SUBMITTED for profiles that have data but status is still DRAFT
-- 2. Recalculate profile_completion for all talent profiles
-- 3. Ensure all data is properly stored

-- Step 1: Find profiles that should be SUBMITTED but are still DRAFT
SELECT 
    tp.id,
    tp.user_id,
    tp.status,
    tp.profile_completion,
    tp.headline,
    tp.experience,
    tp.submitted_at,
    p.full_name
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON p.id = tp.user_id
WHERE tp.status = 'DRAFT'
    AND (
        (tp.headline IS NOT NULL AND tp.headline != '')
        OR (tp.experience IS NOT NULL AND tp.experience != '')
        OR tp.profile_completion > 0
    )
ORDER BY tp.updated_at DESC;

-- Step 2: Update status to SUBMITTED for profiles that have completed data
-- This will update all profiles that have headline AND experience filled (minimum requirements)
UPDATE public.talent_profiles
SET 
    status = 'SUBMITTED',
    submitted_at = COALESCE(submitted_at, updated_at, NOW())
WHERE status = 'DRAFT'
    AND headline IS NOT NULL 
    AND headline != ''
    AND experience IS NOT NULL 
    AND experience != '';

-- Step 3: Recalculate profile_completion for all talent profiles
-- This function calculates completion based on filled fields
DO $$
DECLARE
    talent_record RECORD;
    completion_score INTEGER;
    total_fields INTEGER := 13; -- Total number of fields to check (including skills)
    filled_fields INTEGER;
    skills_table_exists BOOLEAN;
BEGIN
    -- Check if _CandidateSkills table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_CandidateSkills'
    ) INTO skills_table_exists;
    
    -- If skills table doesn't exist, reduce total_fields by 1
    IF NOT skills_table_exists THEN
        total_fields := total_fields - 1;
        RAISE NOTICE 'Skills table not found, calculating completion without skills (total_fields: %)', total_fields;
    END IF;
    FOR talent_record IN 
        SELECT 
            tp.id,
            tp.user_id,
            tp.headline,
            tp.experience,
            tp.portfolio_url,
            tp.intro_video_url,
            p.full_name,
            p.country,
            p.timezone,
            p.bio,
            p.phone,
            p.location,
            p.linked_in_url,
            p.github_url
        FROM public.talent_profiles tp
        LEFT JOIN public.profiles p ON p.id = tp.user_id
    LOOP
        filled_fields := 0;
        
        -- Count filled fields
        IF talent_record.full_name IS NOT NULL AND talent_record.full_name != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.headline IS NOT NULL AND talent_record.headline != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.country IS NOT NULL AND talent_record.country != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.timezone IS NOT NULL AND talent_record.timezone != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.experience IS NOT NULL AND talent_record.experience != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.bio IS NOT NULL AND talent_record.bio != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.phone IS NOT NULL AND talent_record.phone != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.location IS NOT NULL AND talent_record.location != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.portfolio_url IS NOT NULL AND talent_record.portfolio_url != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.linked_in_url IS NOT NULL AND talent_record.linked_in_url != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.github_url IS NOT NULL AND talent_record.github_url != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF talent_record.intro_video_url IS NOT NULL AND talent_record.intro_video_url != '' THEN
            filled_fields := filled_fields + 1;
        END IF;
        
        -- Check if skills exist (only if table exists)
        IF skills_table_exists THEN
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM public."_CandidateSkills" 
                    WHERE "A" = talent_record.id
                ) THEN
                    filled_fields := filled_fields + 1;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    -- Error querying skills table, skip skills check
                    RAISE NOTICE 'Error checking skills for user_id %: %', talent_record.user_id, SQLERRM;
            END;
        END IF;
        
        -- Calculate completion percentage
        completion_score := ROUND((filled_fields::NUMERIC / total_fields::NUMERIC) * 100);
        
        -- Update profile_completion
        UPDATE public.talent_profiles
        SET profile_completion = completion_score
        WHERE id = talent_record.id;
        
        RAISE NOTICE 'Updated profile_completion for user_id %: %%%', talent_record.user_id, completion_score;
    END LOOP;
END $$;

-- Step 4: Verify the updates
SELECT 
    tp.id,
    tp.user_id,
    tp.status,
    tp.profile_completion,
    tp.headline,
    tp.experience,
    tp.submitted_at,
    p.full_name
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON p.id = tp.user_id
WHERE tp.status = 'SUBMITTED'
ORDER BY tp.submitted_at DESC
LIMIT 10;

-- Step 5: Show summary
SELECT 
    status,
    COUNT(*) as count,
    AVG(profile_completion) as avg_completion,
    MIN(profile_completion) as min_completion,
    MAX(profile_completion) as max_completion
FROM public.talent_profiles
GROUP BY status
ORDER BY status;
