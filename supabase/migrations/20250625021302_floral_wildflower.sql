/*
  # Create Admin User

  1. New Functions
    - `create_admin_user` - Creates a new admin user with the specified email
    
  2. Admin User Creation
    - Creates a user with email 'angel@email.com' and password 'angel1234'
    - Sets the user's admin status to true
*/

-- Create a function to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert the user into auth.users
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

-- Create the admin user
SELECT create_admin_user('angel@email.com', 'angel1234');

-- Drop the function after use for security
DROP FUNCTION create_admin_user;