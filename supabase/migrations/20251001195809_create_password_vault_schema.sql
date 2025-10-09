/*
  # SecureVault Password Manager Database Schema

  ## Overview
  This migration creates the complete database schema for SecureVault, a password manager with dual storage modes (cloud and local).

  ## New Tables Created
  
  ### 1. `categories`
  Stores user-defined categories for organizing password entries
  - `id` (uuid, primary key) - Unique category identifier
  - `user_id` (uuid, nullable) - Links to auth.users, NULL for guest/default categories
  - `name` (text) - Category name (e.g., "Social Media", "Banking", "Work")
  - `icon` (text) - Lucide icon name for visual representation
  - `color` (text) - Hex color code for category badge
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `password_entries`
  Core table storing all password vault entries
  - `id` (uuid, primary key) - Unique entry identifier
  - `user_id` (uuid, nullable) - Links to auth.users, NULL for guest mode
  - `title` (text) - Entry title/name (e.g., "Gmail Account")
  - `username` (text, nullable) - Username or email for the account
  - `password` (text) - Encrypted password (client-side encryption)
  - `url` (text, nullable) - Website URL
  - `category_id` (uuid, nullable) - Links to categories table
  - `tags` (text[], default empty array) - Array of searchable tags
  - `notes` (text, nullable) - Additional secure notes
  - `strength_score` (integer, default 0) - Password strength rating (0-100)
  - `last_used` (timestamptz, nullable) - Last accessed timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. `user_preferences`
  Stores user settings and preferences
  - `id` (uuid, primary key) - Unique preference record identifier
  - `user_id` (uuid, unique) - Links to auth.users
  - `storage_mode` (text, default 'cloud') - Storage preference: 'cloud' or 'local'
  - `auto_lock_timeout` (integer, default 15) - Minutes of inactivity before auto-lock
  - `clipboard_clear_timeout` (integer, default 30) - Seconds before clipboard auto-clear
  - `default_password_length` (integer, default 16) - Default generated password length
  - `default_password_options` (jsonb) - Default character set options for generator
  - `theme` (text, default 'light') - UI theme preference
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 4. `password_history`
  Tracks password changes for audit trail
  - `id` (uuid, primary key) - Unique history record identifier
  - `entry_id` (uuid) - Links to password_entries
  - `old_password` (text) - Previous encrypted password
  - `changed_at` (timestamptz) - Timestamp of password change

  ## Security Measures

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data (where user_id = auth.uid())
  - Guest mode entries (user_id IS NULL) are not accessible via Supabase queries
  - Default categories are readable by all authenticated users

  ### Policies Created
  Each table has specific policies for SELECT, INSERT, UPDATE, and DELETE operations:
  - SELECT: Users can view only their own records
  - INSERT: Users can create records with their own user_id
  - UPDATE: Users can modify only their own records
  - DELETE: Users can remove only their own records

  ## Indexes
  Created for optimal query performance on:
  - user_id columns (for filtering user data)
  - category_id (for category-based filtering)
  - created_at and updated_at (for sorting)
  - tags (using GIN index for array searching)

  ## Default Data
  Inserts default categories available to all users:
  - Social Media (blue)
  - Banking (green)
  - Work (gray)
  - Personal (purple)
  - Shopping (orange)
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'folder',
  color text NOT NULL DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

-- Create password_entries table
CREATE TABLE IF NOT EXISTS password_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  username text,
  password text NOT NULL,
  url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  notes text,
  strength_score integer DEFAULT 0,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_mode text DEFAULT 'cloud',
  auto_lock_timeout integer DEFAULT 15,
  clipboard_clear_timeout integer DEFAULT 30,
  default_password_length integer DEFAULT 16,
  default_password_options jsonb DEFAULT '{"uppercase": true, "lowercase": true, "numbers": true, "special": true}'::jsonb,
  theme text DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id uuid REFERENCES password_entries(id) ON DELETE CASCADE NOT NULL,
  old_password text NOT NULL,
  changed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_password_entries_user_id ON password_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_password_entries_category_id ON password_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_password_entries_created_at ON password_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_entries_updated_at ON password_entries(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_entries_tags ON password_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_password_history_entry_id ON password_history(entry_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own categories and default categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Password entries policies
CREATE POLICY "Users can view own password entries"
  ON password_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own password entries"
  ON password_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own password entries"
  ON password_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own password entries"
  ON password_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Password history policies
CREATE POLICY "Users can view own password history"
  ON password_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM password_entries
      WHERE password_entries.id = password_history.entry_id
      AND password_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own password history"
  ON password_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM password_entries
      WHERE password_entries.id = password_history.entry_id
      AND password_entries.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_password_entries_updated_at
  BEFORE UPDATE ON password_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories (available to all users)
INSERT INTO categories (user_id, name, icon, color) VALUES
  (NULL, 'Social Media', 'share-2', '#3B82F6'),
  (NULL, 'Banking', 'landmark', '#059669'),
  (NULL, 'Work', 'briefcase', '#6B7280'),
  (NULL, 'Personal', 'user', '#8B5CF6'),
  (NULL, 'Shopping', 'shopping-cart', '#F97316')
ON CONFLICT DO NOTHING;
