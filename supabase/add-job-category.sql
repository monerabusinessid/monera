-- Add category column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- Update existing jobs with default category
UPDATE jobs SET category = 'Development & IT' WHERE category IS NULL;

-- Verify the changes
SELECT id, title, category FROM jobs LIMIT 5;
