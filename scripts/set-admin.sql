-- Set jt.connor88@gmail.com as admin
UPDATE profiles
SET is_admin = true
WHERE email = 'jt.connor88@gmail.com';

-- Verify the change
SELECT id, email, is_admin, created_at
FROM profiles
WHERE email = 'jt.connor88@gmail.com';
