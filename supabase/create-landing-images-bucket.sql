-- Create bucket for landing page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-images', 'landing-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for landing-images bucket
CREATE POLICY "Public can view landing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-images');

CREATE POLICY "Admins can upload landing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'landing-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = auth.uid()::text
    AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
  )
);

CREATE POLICY "Admins can update landing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'landing-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = auth.uid()::text
    AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
  )
);

CREATE POLICY "Admins can delete landing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'landing-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id::text = auth.uid()::text
    AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
  )
);
