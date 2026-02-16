-- Create function to get profile by id (bypass RLS)
CREATE OR REPLACE FUNCTION get_profile_by_id(profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  country TEXT,
  timezone TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  linked_in_url TEXT,
  github_url TEXT,
  email_verified BOOLEAN,
  avatar_url TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.status,
    p.created_at,
    p.updated_at,
    p.country,
    p.timezone,
    p.bio,
    p.phone,
    p.location,
    p.linked_in_url,
    p.github_url,
    p.email_verified,
    p.avatar_url
  FROM profiles p
  WHERE p.id = profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_profile_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_id(UUID) TO service_role;
