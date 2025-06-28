/*
  # Blog System Database Schema

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text)
      - `author_id` (uuid, references auth.users)
      - `category_id` (uuid, references blog_categories)
      - `featured_image` (text)
      - `published_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `read_time` (integer)
      - `is_published` (boolean)
      - `is_featured` (boolean)
      - `views` (integer)
      - `likes` (integer)
      - `seo_title` (text)
      - `seo_description` (text)
      - `created_at` (timestamptz)

    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `color` (text)
      - `icon` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `blog_post_tags`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references blog_posts)
      - `tag_id` (uuid, references blog_tags)

    - `blog_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references blog_posts)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `is_approved` (boolean)
      - `parent_id` (uuid, references blog_comments, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin users to manage blog content
    - Add policies for authenticated users to view published content and manage their own comments
    - Add policies for anonymous users to view published content

  3. Indexes
    - Add indexes for efficient querying
*/

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'blue',
  icon text NOT NULL DEFAULT 'FileText',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  category_id uuid REFERENCES blog_categories(id) NOT NULL,
  featured_image text,
  published_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  read_time integer DEFAULT 5,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, tag_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  parent_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_blog_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for blog_categories
CREATE POLICY "Anyone can view blog categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage blog categories"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- Create policies for blog_tags
CREATE POLICY "Anyone can view blog tags"
  ON blog_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage blog tags"
  ON blog_tags
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- Create policies for blog_posts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admins can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (is_blog_admin());

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- Create policies for blog_post_tags
CREATE POLICY "Anyone can view blog post tags"
  ON blog_post_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage blog post tags"
  ON blog_post_tags
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- Create policies for blog_comments
CREATE POLICY "Anyone can view approved blog comments"
  ON blog_comments
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can view their own comments"
  ON blog_comments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all blog comments"
  ON blog_comments
  FOR SELECT
  TO authenticated
  USING (is_blog_admin());

CREATE POLICY "Users can create their own comments"
  ON blog_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON blog_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON blog_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all blog comments"
  ON blog_comments
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id 
  ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id 
  ON blog_posts(category_id);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published 
  ON blog_posts(is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_featured 
  ON blog_posts(is_featured, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id 
  ON blog_post_tags(post_id);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id 
  ON blog_post_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id 
  ON blog_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id 
  ON blog_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id 
  ON blog_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_comments_approved 
  ON blog_comments(is_approved, created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON blog_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color, icon)
VALUES 
  ('Blood Pressure', 'blood-pressure', 'Managing hypertension and cardiovascular health', 'red', 'Heart'),
  ('Diabetes', 'diabetes', 'Blood sugar management and diabetes care', 'blue', 'Droplets'),
  ('Nutrition', 'nutrition', 'Healthy eating and dietary guidance', 'green', 'Utensils'),
  ('Exercise', 'exercise', 'Physical activity and fitness tips', 'purple', 'Dumbbell'),
  ('Mental Health', 'mental-health', 'Stress management and mental wellness', 'indigo', 'Brain'),
  ('General Health', 'general-health', 'Overall wellness and health tips', 'orange', 'Activity')
ON CONFLICT (slug) DO NOTHING;