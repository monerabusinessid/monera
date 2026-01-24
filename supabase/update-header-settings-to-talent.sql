-- Update existing header settings to use "Talent" instead of "Freelancers"
-- Run this script in Supabase SQL Editor to update existing data

UPDATE landing_page_settings
SET 
  value = CASE 
    WHEN key = 'hero_title' THEN 'Hire Vetted Remote Talent | Premium Talent Marketplace'
    WHEN key = 'hero_subtitle' THEN 'Quality-First Freelance Platform | Pre-Vetted Remote Talent'
    WHEN key = 'hero_description' THEN 'Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants.'
    ELSE value
  END,
  description = CASE
    WHEN key = 'hero_title' THEN 'Main headline in the hero section (SEO-friendly)'
    WHEN key = 'hero_subtitle' THEN 'Subtitle in the hero section (SEO-friendly)'
    WHEN key = 'hero_description' THEN 'Description text in the hero section (SEO-friendly)'
    ELSE description
  END,
  updated_at = NOW()
WHERE key IN ('hero_title', 'hero_subtitle', 'hero_description')
  AND (value LIKE '%Freelancer%' OR value LIKE '%freelancer%' OR value = '' OR value IS NULL);

-- Also insert if they don't exist
INSERT INTO landing_page_settings (key, value, description)
VALUES
  ('hero_title', 'Hire Vetted Remote Talent | Premium Talent Marketplace', 'Main headline in the hero section (SEO-friendly)'),
  ('hero_subtitle', 'Quality-First Freelance Platform | Pre-Vetted Remote Talent', 'Subtitle in the hero section (SEO-friendly)'),
  ('hero_description', 'Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants.', 'Description text in the hero section (SEO-friendly)')
ON CONFLICT (key) DO UPDATE
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();
