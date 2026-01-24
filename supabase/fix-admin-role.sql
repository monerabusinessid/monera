-- ============================================
-- FIX ADMIN ROLE ENUM ISSUE
-- ============================================
-- Run this script in Supabase SQL Editor to fix the ADMIN role issue

-- Check if there are any profiles with "ADMIN" role
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM public.profiles
    WHERE role::text = 'ADMIN';
    
    IF admin_count > 0 THEN
        RAISE NOTICE 'Found % profiles with ADMIN role. Updating to SUPER_ADMIN...', admin_count;
        
        -- Update all ADMIN roles to SUPER_ADMIN
        UPDATE public.profiles
        SET role = 'SUPER_ADMIN'::"UserRole"
        WHERE role::text = 'ADMIN';
        
        RAISE NOTICE '✅ Updated % profiles from ADMIN to SUPER_ADMIN', admin_count;
    ELSE
        RAISE NOTICE '✅ No profiles with ADMIN role found';
    END IF;
END $$;

-- Verify the fix
SELECT 
    role,
    COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin role fix completed!';
END $$;
