-- ============================================
-- FIX ALL ADMIN ROLE ISSUES
-- ============================================
-- Run this script in Supabase SQL Editor to fix all ADMIN-related issues

-- Step 1: Update any profiles with "ADMIN" role to "SUPER_ADMIN"
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Try to update using text comparison (in case enum is causing issues)
    SELECT COUNT(*) INTO admin_count
    FROM public.profiles
    WHERE role::text = 'ADMIN';
    
    IF admin_count > 0 THEN
        RAISE NOTICE 'Found % profiles with ADMIN role. Updating to SUPER_ADMIN...', admin_count;
        
        UPDATE public.profiles
        SET role = 'SUPER_ADMIN'::"UserRole"
        WHERE role::text = 'ADMIN';
        
        RAISE NOTICE '✅ Updated % profiles from ADMIN to SUPER_ADMIN', admin_count;
    ELSE
        RAISE NOTICE '✅ No profiles with ADMIN role found';
    END IF;
END $$;

-- Step 2: Drop all profiles policies first (before dropping functions)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "quality_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "quality_admin_update_status" ON public.profiles;
DROP POLICY IF EXISTS "support_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "analyst_read" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own" ON public.profiles;

-- Step 3: Drop and recreate helper functions to ensure they don't reference "ADMIN"
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_super_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Recreate helper functions (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND role = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS "UserRole" AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate profiles policies

-- Recreate policies using helper functions
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete profiles" ON public.profiles
    FOR DELETE USING (public.is_super_admin(auth.uid()));

-- Step 5: Verify the fix
SELECT 
    role,
    COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All admin role issues fixed!';
    RAISE NOTICE '   - Updated any ADMIN roles to SUPER_ADMIN';
    RAISE NOTICE '   - Recreated helper functions';
    RAISE NOTICE '   - Recreated RLS policies';
END $$;
