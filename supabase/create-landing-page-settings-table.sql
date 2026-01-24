-- Create landing_page_settings table for header and landing page configuration
CREATE TABLE IF NOT EXISTS landing_page_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_page_settings_key ON landing_page_settings(key);

-- Enable RLS (Row Level Security)
ALTER TABLE landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for landing page)
CREATE POLICY "Public can read landing page settings"
ON landing_page_settings
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert/update (for admin panel)
CREATE POLICY "Authenticated users can manage landing page settings"
ON landing_page_settings
FOR ALL
USING (auth.role() = 'authenticated');

-- Insert default header settings
INSERT INTO landing_page_settings (key, value, description) VALUES
  ('hero_image_url', '', 'URL of the hero image displayed in the header'),
  ('hero_title', 'Hire Vetted Remote Talent | Premium Talent Marketplace', 'Main headline in the hero section (SEO-friendly)'),
  ('hero_subtitle', 'Quality-First Freelance Platform | Pre-Vetted Remote Talent', 'Subtitle in the hero section (SEO-friendly)'),
  ('hero_description', 'Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants.', 'Description text in the hero section (SEO-friendly)'),
  ('hero_image_width', '100%', 'Width of the hero image'),
  ('hero_image_height', 'auto', 'Height of the hero image'),
  ('hero_image_object_fit', 'cover', 'CSS object-fit property for hero image'),
  ('hero_image_border_radius', '24px', 'Border radius of the hero image'),
  ('hero_image_opacity', '1', 'Opacity of the hero image (0-1)'),
  ('hero_image_position', 'center', 'CSS object-position for hero image'),
  ('hero_image_alignment', 'center', 'Alignment of hero image (left, center, right)')
ON CONFLICT (key) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_landing_page_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_landing_page_settings_updated_at
  BEFORE UPDATE ON landing_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_page_settings_updated_at();
