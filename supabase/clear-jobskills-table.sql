-- ============================================
-- CLEAR _JobSkills TABLE
-- ============================================
-- Script ini akan mengosongkan table _JobSkills
-- Setelah ini, Anda bisa add ulang data via web interface
-- ============================================

-- Clear all data from _JobSkills table
TRUNCATE TABLE public."_JobSkills" CASCADE;

-- Verify table is empty
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM public."_JobSkills";
    RAISE NOTICE '✅ _JobSkills table cleared. Current record count: %', record_count;
END $$;
