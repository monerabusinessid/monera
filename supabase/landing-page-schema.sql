-- Landing Page Content Tables

-- Testimonials Table
CREATE TABLE IF NOT EXISTS landing_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar TEXT,
  type TEXT NOT NULL CHECK (type IN ('CLIENT', 'TALENT')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted Companies Table
CREATE TABLE IF NOT EXISTS landing_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Browse Talent Categories Table
CREATE TABLE IF NOT EXISTS landing_talent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  count TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Table
CREATE TABLE IF NOT EXISTS landing_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE landing_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_talent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_faqs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read active testimonials" ON landing_testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active companies" ON landing_companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active talent categories" ON landing_talent_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active FAQs" ON landing_faqs
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage testimonials" ON landing_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
  );

CREATE POLICY "Admins can manage companies" ON landing_companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
  );

CREATE POLICY "Admins can manage talent categories" ON landing_talent_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
  );

CREATE POLICY "Admins can manage FAQs" ON landing_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_landing_testimonials_type ON landing_testimonials(type, is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_landing_companies_active ON landing_companies(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_landing_talent_categories_active ON landing_talent_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_landing_faqs_active ON landing_faqs(is_active, display_order);

-- Insert default data
INSERT INTO landing_testimonials (name, role, content, avatar, type, display_order) VALUES
  ('Sarah Chen', 'CEO, TechStart', 'Found the perfect developer in 2 days. Quality-first approach saved us weeks of screening.', '👩', 'CLIENT', 1),
  ('Emily Watson', 'HR Director, ScaleUp', 'Pre-vetted talent means less time interviewing, more time building.', '👩', 'CLIENT', 2),
  ('David Kim', 'CTO, InnovateCo', 'Profile readiness system ensures we only see serious candidates. Game changer!', '👨', 'CLIENT', 3),
  ('Lisa Anderson', 'Founder, StartupHub', 'Best hiring platform we''ve used. Quality over quantity really works.', '👩', 'CLIENT', 4),
  ('Robert Martinez', 'Product Manager, TechCorp', 'The quality of talent here is unmatched. Found our lead developer in just 3 days!', '👨', 'CLIENT', 5),
  ('Jennifer Lee', 'CEO, DesignStudio', 'Monera''s vetting process saved us countless hours. Every candidate was top-notch.', '👩', 'CLIENT', 6),
  ('Michael Rodriguez', 'Freelance Designer', 'Best match jobs are game-changing. Only see opportunities that actually fit my skills.', '👨', 'TALENT', 1),
  ('Alex Johnson', 'Full-Stack Developer', 'Profile readiness unlocked best matches. No more spam applying to irrelevant jobs.', '👨', 'TALENT', 2),
  ('Maria Garcia', 'UI/UX Designer', 'Quality-first approach means better clients and higher success rate. Love it!', '👩', 'TALENT', 3),
  ('James Wilson', 'Marketing Specialist', 'Smart matching algorithm finds perfect jobs. Saved me so much time.', '👨', 'TALENT', 4),
  ('Sophie Brown', 'Frontend Developer', 'The matching system is incredible. I only see jobs that match my exact skills and preferences.', '👩', 'TALENT', 5),
  ('Daniel Kim', 'Backend Engineer', 'Found my dream remote job through Monera. The quality of opportunities here is amazing.', '👨', 'TALENT', 6)
ON CONFLICT DO NOTHING;

INSERT INTO landing_companies (name, logo, display_order) VALUES
  ('Microsoft', '🪟', 1),
  ('Google', '🔍', 2),
  ('Amazon', '📦', 3),
  ('Meta', '📘', 4),
  ('Apple', '🍎', 5),
  ('Netflix', '🎬', 6),
  ('Spotify', '🎵', 7),
  ('Airbnb', '🏠', 8),
  ('Tesla', '⚡', 9),
  ('Adobe', '🎨', 10),
  ('Salesforce', '☁️', 11),
  ('Oracle', '🗄️', 12)
ON CONFLICT DO NOTHING;

INSERT INTO landing_talent_categories (name, icon, count, display_order) VALUES
  ('Developers', '💻', '500+', 1),
  ('Designers', '🎨', '300+', 2),
  ('Marketers', '📈', '200+', 3),
  ('Writers', '✍️', '150+', 4),
  ('Data Analysts', '📊', '100+', 5),
  ('Project Managers', '📋', '80+', 6)
ON CONFLICT DO NOTHING;

INSERT INTO landing_faqs (question, answer, display_order) VALUES
  ('How does Monera ensure quality?', 'We have a rigorous vetting process that validates every profile before they can apply to jobs. This ensures only serious, qualified candidates reach your inbox.', 1),
  ('What makes Monera different from other platforms?', 'Monera focuses on quality over quantity. Our profile readiness system and smart matching algorithm ensure better matches and higher success rates.', 2),
  ('How do I get started as a client?', 'Simply create an account, post your job requirements, and our system will match you with vetted talent that fits your needs.', 3),
  ('How do I get started as talent?', 'Create your profile, complete the onboarding process, and once approved, you''ll start receiving job recommendations that match your skills.', 4),
  ('Is there a fee to use Monera?', 'Please check our pricing page for detailed information about our plans and pricing structure.', 5),
  ('Can I work remotely?', 'Yes! Monera supports remote work opportunities. You can filter jobs by location and work type when searching.', 6)
ON CONFLICT DO NOTHING;

-- Landing Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for settings
ALTER TABLE landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read settings" ON landing_page_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admins can manage settings" ON landing_page_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
  );

-- Insert default settings
INSERT INTO landing_page_settings (key, value, description) VALUES
  ('hero_image_url', '', 'URL gambar untuk hero section header'),
  ('hero_title', 'Supercharge Your Talent 🔒', 'Judul utama di hero section'),
  ('hero_subtitle', 'for Ultimate Quality ⚛️', 'Subtitle di hero section'),
  ('hero_description', 'No more random applicants. Monera has got your back with vetted profiles, smart matching, and next-level tools for your always-on hiring needs.', 'Deskripsi di hero section'),
  ('hero_image_width', '100%', 'Lebar gambar hero (px, %, rem, dll)'),
  ('hero_image_height', 'auto', 'Tinggi gambar hero (px, %, rem, dll)'),
  ('hero_image_object_fit', 'cover', 'Object fit untuk gambar (cover, contain, fill, none, scale-down)'),
  ('hero_image_border_radius', '24px', 'Border radius untuk gambar (px, rem, %)'),
  ('hero_image_opacity', '1', 'Opacity gambar (0-1)'),
  ('hero_image_position', 'center', 'Posisi gambar (center, left, right, top, bottom)'),
  ('hero_image_alignment', 'center', 'Alignment gambar di container (center, left, right)')
ON CONFLICT (key) DO NOTHING;
