-- Create Supabase Storage Bucket for Intro Videos (Simple Version)
-- Run this in Supabase SQL Editor
-- This only creates the bucket, RLS policies need to be set via Dashboard

-- Create bucket if it doesn't exist
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

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'intro-videos';

-- Note: After running this, you need to set RLS policies via Supabase Dashboard
-- Go to: Storage > intro-videos > Policies > New Policy
