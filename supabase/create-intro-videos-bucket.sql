-- Create Supabase Storage Bucket for Intro Videos
-- Run this in Supabase SQL Editor
-- This bucket stores user introduction videos for talent onboarding

-- 1. Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'intro-videos',
    'intro-videos',
    false, -- Private bucket (users can only access their own videos)
    104857600, -- 100MB limit (100 * 1024 * 1024)
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO UPDATE
SET 
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov'];

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all intro videos" ON storage.objects;

-- 4. Create RLS policy: Users can upload their own videos
CREATE POLICY "Users can upload their own intro videos"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Create RLS policy: Users can view their own videos
CREATE POLICY "Users can view their own intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Create RLS policy: Users can update their own videos
CREATE POLICY "Users can update their own intro videos"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Create RLS policy: Users can delete their own videos
CREATE POLICY "Users can delete their own intro videos"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Create RLS policy: Admins can view all videos
CREATE POLICY "Admins can view all intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
);

-- 9. Create RLS policy: Admins can manage all videos
CREATE POLICY "Admins can manage all intro videos"
ON storage.objects
FOR ALL
USING (
    bucket_id = 'intro-videos' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
);

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'intro-videos';

-- Note: 
-- - File paths should be in format: {user_id}/intro-video.{ext}
-- - Example: 123e4567-e89b-12d3-a456-426614174000/intro-video.mp4
-- - Users can only access videos in their own folder (based on user_id)
-- - Admins can access all videos
