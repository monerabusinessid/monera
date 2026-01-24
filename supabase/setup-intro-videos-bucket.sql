-- Setup Supabase Storage Bucket for Intro Videos
-- Run this in Supabase SQL Editor

-- 1. Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'intro-videos',
    'intro-videos',
    false, -- Private bucket
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policy: Users can upload their own videos
CREATE POLICY "Users can upload their own intro videos"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Create RLS policy: Users can view their own videos
CREATE POLICY "Users can view their own intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Create RLS policy: Users can update their own videos
CREATE POLICY "Users can update their own intro videos"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Create RLS policy: Users can delete their own videos
CREATE POLICY "Users can delete their own intro videos"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Create RLS policy: Admins can view all videos
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

-- Note: File paths should be in format: {user_id}/intro-video.{ext}
-- Example: 123e4567-e89b-12d3-a456-426614174000/intro-video.mp4
