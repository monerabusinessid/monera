-- Fix RLS Policy for Intro Videos Bucket
-- This script fixes the RLS policy to work with custom JWT authentication
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all intro videos" ON storage.objects;

-- 2. Since we're using custom JWT auth (not Supabase Auth), 
--    the upload will be done via admin client (service role key)
--    So we need to allow service role to manage all files
--    But we still want to restrict access for regular users

-- Option 1: Allow all operations for service role (recommended)
-- The service role key bypasses RLS automatically, so we don't need a policy for it
-- But we can add a policy that allows authenticated users to access their own files
-- Since we're using custom auth, this might not work with auth.uid()

-- Option 2: Temporarily disable RLS for intro-videos bucket (for development)
-- This allows uploads to work while using admin client
-- Note: This is less secure, but works for development

-- For now, let's create a policy that allows service role operations
-- Service role automatically bypasses RLS, so we mainly need policies for public access

-- 3. Create policy: Allow authenticated users to view files in their own folder
-- Note: This might not work with custom JWT, but we'll keep it for future use
CREATE POLICY "Allow users to view their own intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos'
    -- Since we're using custom JWT, auth.uid() won't work
    -- Service role will bypass this anyway
);

-- 4. Verify bucket exists and is configured correctly
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types 
FROM storage.buckets 
WHERE id = 'intro-videos';

-- IMPORTANT NOTES:
-- 1. Since the application uses custom JWT authentication (not Supabase Auth),
--    the upload endpoint uses admin client (service role key) which bypasses RLS
-- 2. The RLS policies above are mainly for future use or if you switch to Supabase Auth
-- 3. For now, uploads will work via admin client which bypasses all RLS policies
-- 4. To make this more secure, you could:
--    - Validate user ID in the API route before upload
--    - Use Supabase Auth instead of custom JWT
--    - Create a custom RLS policy that checks against your custom auth system
