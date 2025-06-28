/*
  # Create Admin User (If Not Exists)

  1. New Functions
    - `create_admin_user_if_not_exists` - Creates a new admin user with the specified email if it doesn't already exist
    
  2. Admin User Creation
    - Checks if user with email 'angel@email.com' exists
    - If not, creates a user with email 'angel@email.com' and password 'angel1234'
    - Sets the user's admin status to true
    - If user exists, ensures they have admin status
*/

-- Create a function to create an admin user if not exists
CREATE OR REPLACE FUNCTION create_admin_user_if_not_exists(admin_email TEXT, admin_password TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_user_id uuid;
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = admin_email;
  
  -- If user exists, ensure they have admin status
  IF existing_user_id IS NOT NULL THEN
    -- Update or insert user profile with admin status
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (existing_user_id, 'Admin User', true)
    ON CONFLICT (id) 
    DO UPDATE SET is_admin = true;
    
    RETURN existing_user_id;
  END IF;

  -- Insert the user into auth.users if they don't exist
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create user profile with admin status
  INSERT INTO public.user_profiles (
    id,
    full_name,
    is_admin
  )
  VALUES (
    new_user_id,
    'Admin User',
    true
  );

  RETURN new_user_id;
END;
$$;

-- Create the admin user if not exists
SELECT create_admin_user_if_not_exists('angel@email.com', 'angel1234');

-- Drop the function after use for security
DROP FUNCTION create_admin_user_if_not_exists;