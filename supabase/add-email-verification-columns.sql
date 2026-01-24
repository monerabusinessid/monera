-- Add email verification columns to profiles table
-- Run this script in Supabase SQL Editor

-- Add email_verified column (default: false)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
        
        COMMENT ON COLUMN public.profiles.email_verified IS 'Whether the user has verified their email address';
    END IF;
END $$;

-- Add verification_code column (nullable, stores 6-digit OTP)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_code'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN verification_code TEXT;
        
        COMMENT ON COLUMN public.profiles.verification_code IS '6-digit OTP code for email verification';
    END IF;
END $$;

-- Add verification_code_expires_at column (nullable, stores expiration timestamp)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_code_expires_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN verification_code_expires_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN public.profiles.verification_code_expires_at IS 'Expiration timestamp for verification code (10 minutes from generation)';
    END IF;
END $$;

-- Add verification_attempts column (track failed attempts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_attempts'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN verification_attempts INTEGER NOT NULL DEFAULT 0;
        
        COMMENT ON COLUMN public.profiles.verification_attempts IS 'Number of failed verification attempts for current code';
    END IF;
END $$;

-- Add last_code_sent_at column (for rate limiting resend requests)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_code_sent_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN last_code_sent_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN public.profiles.last_code_sent_at IS 'Timestamp of last verification code sent (for rate limiting)';
    END IF;
END $$;

-- Create index on email_verified for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified) WHERE email_verified = false;

-- Create index on verification_code_expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_expires ON public.profiles(verification_code_expires_at) WHERE verification_code_expires_at IS NOT NULL;

-- Update existing users to have email_verified = true (for backward compatibility)
-- Only update users who don't have email_verified set yet
UPDATE public.profiles 
SET email_verified = true 
WHERE email_verified IS NULL OR email_verified = false
AND id IN (
    SELECT id FROM public.profiles 
    WHERE created_at < NOW() - INTERVAL '1 day'
);
