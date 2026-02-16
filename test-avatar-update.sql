-- Manual update avatar_url for testing
-- Replace with your actual user ID and a test image URL

UPDATE profiles 
SET avatar_url = 'https://via.placeholder.com/150'
WHERE id = '1117ac26-f3d8-4321-85b6-c82edae4e575';

UPDATE talent_profiles 
SET avatar_url = 'https://via.placeholder.com/150'
WHERE user_id = '1117ac26-f3d8-4321-85b6-c82edae4e575';
