-- Create admin roles table to define different types of admin roles
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for user admin roles
CREATE TABLE IF NOT EXISTS user_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin (with unique name)
CREATE OR REPLACE FUNCTION check_user_is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has is_admin flag set to true
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_uuid AND is_admin = true
  );
END;
$$;

-- Create function to check if user has specific admin role (with unique name)
CREATE OR REPLACE FUNCTION check_user_has_admin_role(role_name text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_admin_roles uar
    JOIN admin_roles ar ON uar.role_id = ar.id
    WHERE uar.user_id = user_uuid 
      AND ar.name = role_name
      AND uar.is_active = true
      AND (uar.expires_at IS NULL OR uar.expires_at > now())
  );
END;
$$;

-- Create function to get user admin permissions (with unique name)
CREATE OR REPLACE FUNCTION get_user_admin_permissions(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  permissions jsonb := '{}';
  role_permissions jsonb;
BEGIN
  -- If user is super admin (is_admin = true), return all permissions
  IF check_user_is_admin(user_uuid) THEN
    RETURN '{"super_admin": true, "all_permissions": true}';
  END IF;

  -- Aggregate permissions from all active roles
  SELECT jsonb_agg(ar.permissions)
  INTO role_permissions
  FROM user_admin_roles uar
  JOIN admin_roles ar ON uar.role_id = ar.id
  WHERE uar.user_id = user_uuid 
    AND uar.is_active = true
    AND (uar.expires_at IS NULL OR uar.expires_at > now());

  RETURN COALESCE(role_permissions, '{}');
END;
$$;

-- Insert default admin roles
INSERT INTO admin_roles (name, description, permissions) VALUES
  ('super_admin', 'Full system administrator', '{"all": true}'),
  ('content_admin', 'Content management administrator', '{"blog": {"create": true, "edit": true, "delete": true, "publish": true}}'),
  ('user_admin', 'User management administrator', '{"users": {"view": true, "edit": true, "delete": true}}'),
  ('analytics_admin', 'Analytics and reporting administrator', '{"analytics": {"view": true, "export": true}}')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies for admin_roles
CREATE POLICY "Admins can view admin roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

CREATE POLICY "Super admins can manage admin roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- RLS Policies for user_admin_roles
CREATE POLICY "Admins can view user admin roles"
  ON user_admin_roles
  FOR SELECT
  TO authenticated
  USING (check_user_is_admin());

CREATE POLICY "Super admins can manage user admin roles"
  ON user_admin_roles
  FOR ALL
  TO authenticated
  USING (check_user_is_admin())
  WITH CHECK (check_user_is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_user_id ON user_admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_role_id ON user_admin_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_active ON user_admin_roles(is_active, expires_at);

-- Add triggers for updated_at
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_admin_roles_updated_at
  BEFORE UPDATE ON user_admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();