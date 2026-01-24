-- ============================================
-- FIX INFINITE RECURSION IN PROFILES POLICIES
-- ============================================
-- Run this script in Supabase SQL Editor to fix the RLS policy issue

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create helper function to check if user is admin (SECURITY DEFINER bypasses RLS)
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

-- Create helper function to check if user is super admin
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

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS "UserRole" AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New policies using helper functions (no recursion)
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Profiles policies fixed!';
    RAISE NOTICE '   - Removed infinite recursion';
    RAISE NOTICE '   - Added helper functions with SECURITY DEFINER';
    RAISE NOTICE '   - Policies now use helper functions';
END $$;
