-- Script untuk menambahkan sample jobs sesuai kategori
-- 
-- INSTRUKSI PENTING:
-- 1. Pastikan field 'category' sudah ada di tabel jobs:
--    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
--
-- 2. Pastikan ada minimal 1 profile di tabel 'profiles' (bukan 'users')
--    Script akan mencari profile dengan role = 'CLIENT' terlebih dahulu
--    Jika tidak ada, akan menggunakan profile pertama yang ditemukan
--    Untuk melihat profiles yang ada, jalankan: SELECT id, role, full_name FROM profiles LIMIT 5;
--
-- 3. Company_id bisa NULL jika tidak ada company di database
--
-- 4. Pastikan struktur tabel jobs menggunakan 'recruiter_id' yang mengacu ke 'id' dari tabel 'profiles'

-- Catatan: Script ini menggunakan tabel 'profiles' (bukan 'users')
-- Pastikan ada minimal 1 profile di database sebelum menjalankan script ini
-- Script akan mencari profile dengan role = 'CLIENT' terlebih dahulu
-- Jika tidak ada, akan menggunakan profile pertama yang ditemukan

-- Buat dummy company jika belum ada
DO $$
DECLARE
  company_id UUID;
BEGIN
  -- Cek apakah sudah ada company
  SELECT id INTO company_id 
  FROM companies 
  LIMIT 1;
  
  -- Jika belum ada, buat dummy company
  IF company_id IS NULL THEN
    company_id := gen_random_uuid();
    INSERT INTO companies (id, name, description, created_at, updated_at)
    VALUES (
      company_id,
      'Sample Company',
      'Sample company for testing purposes',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Sample Jobs untuk berbagai kategori
-- Development & IT
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Senior Full-Stack Developer',
  'We are looking for an experienced Full-Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate should have strong problem-solving skills and be able to work independently as well as in a team environment.',
  '• 5+ years of experience in full-stack development\n• Strong proficiency in JavaScript, TypeScript, React, and Node.js\n• Experience with databases (PostgreSQL, MongoDB)\n• Knowledge of RESTful APIs and GraphQL\n• Experience with cloud platforms (AWS, Azure, or GCP)\n• Strong understanding of software development best practices',
  'Remote',
  true,
  6000,
  10000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Development & IT',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'React Native Mobile Developer',
  'Join our mobile development team to build cutting-edge mobile applications. We need a skilled React Native developer who can create beautiful, performant mobile apps for both iOS and Android platforms.',
  '• 3+ years of experience with React Native\n• Strong knowledge of JavaScript/TypeScript\n• Experience with Redux or MobX for state management\n• Familiarity with native build tools (Xcode, Android Studio)\n• Experience with mobile app deployment processes\n• Understanding of mobile UI/UX principles',
  'Remote',
  true,
  5000,
  8500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Development & IT',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Backend API Developer',
  'We are seeking a Backend API Developer to design and implement scalable RESTful APIs. You will work closely with frontend developers and product managers to deliver high-quality backend services.',
  '• 4+ years of backend development experience\n• Proficiency in Node.js, Python, or Go\n• Strong understanding of RESTful API design\n• Experience with database design and optimization\n• Knowledge of microservices architecture\n• Experience with API testing and documentation',
  'Remote',
  true,
  5500,
  9000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Development & IT',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Design & Creative
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'UI/UX Designer',
  'We are looking for a talented UI/UX Designer to create amazing user experiences. You will be responsible for designing user interfaces, creating wireframes, and collaborating with developers to bring designs to life.',
  '• 3+ years of UI/UX design experience\n• Proficiency in Figma, Adobe XD, or Sketch\n• Strong portfolio showcasing mobile and web design\n• Understanding of user-centered design principles\n• Experience with design systems and component libraries\n• Ability to create interactive prototypes',
  'Remote',
  true,
  4000,
  7000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Design & Creative',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Graphic Designer',
  'Join our creative team as a Graphic Designer. You will create visual concepts to communicate ideas that inspire, inform, and captivate consumers. You will develop the overall layout and production design for various applications.',
  '• 2+ years of graphic design experience\n• Proficiency in Adobe Creative Suite (Photoshop, Illustrator, InDesign)\n• Strong understanding of typography, color theory, and layout\n• Experience with branding and identity design\n• Ability to work on multiple projects simultaneously\n• Strong attention to detail',
  'Remote',
  true,
  3000,
  5500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Design & Creative',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Product Designer',
  'We need a Product Designer to help shape the future of our products. You will work on end-to-end product design, from research and ideation to final implementation, ensuring our products are both beautiful and functional.',
  '• 4+ years of product design experience\n• Strong portfolio of product design work\n• Experience with user research and testing\n• Proficiency in design tools (Figma, Principle, etc.)\n• Understanding of frontend development principles\n• Excellent communication and collaboration skills',
  'Remote',
  true,
  5000,
  8000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Design & Creative',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Sales & Marketing
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Digital Marketing Specialist',
  'We are seeking a Digital Marketing Specialist to develop and implement marketing strategies. You will be responsible for managing digital campaigns, analyzing performance metrics, and optimizing marketing efforts across various channels.',
  '• 3+ years of digital marketing experience\n• Strong knowledge of SEO, SEM, and social media marketing\n• Experience with Google Analytics and other analytics tools\n• Proficiency in content creation and copywriting\n• Experience with email marketing campaigns\n• Understanding of marketing automation tools',
  'Remote',
  true,
  3500,
  6000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Sales & Marketing',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Content Marketing Manager',
  'Join our marketing team as a Content Marketing Manager. You will be responsible for creating and managing content across all channels, developing content strategies, and measuring content performance.',
  '• 4+ years of content marketing experience\n• Excellent writing and editing skills\n• Experience with content management systems\n• Strong understanding of SEO best practices\n• Ability to create various content types (blog posts, videos, infographics)\n• Experience with content analytics and reporting',
  'Remote',
  true,
  4000,
  7000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Sales & Marketing',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Writing & Translation
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Technical Writer',
  'We need a Technical Writer to create clear and concise documentation for our products. You will work with developers and product managers to document features, APIs, and user guides.',
  '• 3+ years of technical writing experience\n• Strong writing and editing skills\n• Ability to translate complex technical concepts into clear documentation\n• Experience with documentation tools (Markdown, Git, etc.)\n• Understanding of software development processes\n• Attention to detail and accuracy',
  'Remote',
  true,
  3000,
  5500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Writing & Translation',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Content Writer',
  'We are looking for a Content Writer to create engaging content for our blog, website, and marketing materials. You will research topics, write articles, and ensure all content aligns with our brand voice.',
  '• 2+ years of content writing experience\n• Excellent writing and research skills\n• Ability to write for different audiences and formats\n• Understanding of SEO best practices\n• Experience with content management systems\n• Strong attention to detail and grammar',
  'Remote',
  true,
  2500,
  4500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Writing & Translation',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Admin & Customer Support
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Customer Support Specialist',
  'Join our customer support team to help our users succeed. You will respond to customer inquiries, troubleshoot issues, and ensure customer satisfaction. This role requires excellent communication skills and a customer-first mindset.',
  '• 2+ years of customer support experience\n• Excellent written and verbal communication skills\n• Ability to handle multiple customer inquiries simultaneously\n• Experience with customer support tools (Zendesk, Intercom, etc.)\n• Strong problem-solving skills\n• Patience and empathy when dealing with customers',
  'Remote',
  true,
  2000,
  4000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Admin & Customer Support',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid()::text,
  'Virtual Assistant',
  'We are seeking a Virtual Assistant to provide administrative support to our team. You will handle scheduling, email management, data entry, and other administrative tasks to help our team operate efficiently.',
  '• 2+ years of administrative or virtual assistant experience\n• Strong organizational and time management skills\n• Proficiency in Microsoft Office and Google Workspace\n• Excellent communication skills\n• Ability to work independently and prioritize tasks\n• Attention to detail and accuracy',
  'Remote',
  true,
  1800,
  3500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Admin & Customer Support',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Finance & Accounting
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Financial Analyst',
  'We need a Financial Analyst to help with financial planning, analysis, and reporting. You will analyze financial data, create reports, and provide insights to support business decisions.',
  '• 3+ years of financial analysis experience\n• Strong analytical and quantitative skills\n• Proficiency in Excel and financial modeling\n• Understanding of accounting principles\n• Experience with financial reporting and analysis\n• Excellent attention to detail',
  'Remote',
  true,
  4000,
  7000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Finance & Accounting',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Engineering & Architecture
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'DevOps Engineer',
  'Join our DevOps team to help build and maintain our infrastructure. You will work on CI/CD pipelines, cloud infrastructure, and automation to ensure our systems are reliable and scalable.',
  '• 4+ years of DevOps or infrastructure experience\n• Strong knowledge of cloud platforms (AWS, Azure, or GCP)\n• Experience with containerization (Docker, Kubernetes)\n• Proficiency in infrastructure as code (Terraform, CloudFormation)\n• Experience with CI/CD tools (Jenkins, GitHub Actions, etc.)\n• Strong scripting skills (Bash, Python, etc.)',
  'Remote',
  true,
  6000,
  10000,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Engineering & Architecture',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Legal
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) VALUES 
(
  gen_random_uuid()::text,
  'Legal Research Assistant',
  'We are seeking a Legal Research Assistant to support our legal team. You will conduct legal research, draft documents, and assist with various legal tasks. This role requires strong research and writing skills.',
  '• 2+ years of legal research experience\n• Strong research and analytical skills\n• Excellent writing and communication skills\n• Understanding of legal terminology and concepts\n• Proficiency in legal research databases\n• Attention to detail and accuracy',
  'Remote',
  true,
  3000,
  5500,
  'USD',
  'PUBLISHED',
  COALESCE(
    (SELECT id FROM profiles WHERE role = 'CLIENT' LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
  ),
  (SELECT id FROM companies LIMIT 1),
  'Legal',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Catatan: Pastikan field 'category' sudah ada di tabel jobs
-- Jika belum, jalankan perintah berikut terlebih dahulu:
-- ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
