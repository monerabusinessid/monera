-- Add reset token columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_reset_token ON profiles(reset_token);
