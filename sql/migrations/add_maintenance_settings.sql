-- Migration: Add maintenance mode settings to system_settings
-- Safe to run multiple times (idempotent)

-- Create system_settings table if not exists
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies first (CREATE POLICY doesn't support IF NOT EXISTS in PostgreSQL)
DROP POLICY IF EXISTS "Admin can manage system_settings" ON system_settings;
DROP POLICY IF EXISTS "Public read system_settings" ON system_settings;

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admin can manage system_settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can read system settings (needed for maintenance page)
CREATE POLICY "Public read system_settings"
  ON system_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert default maintenance settings (won't overwrite existing)
INSERT INTO system_settings (key, value)
VALUES
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'Kami sedang melakukan pemeliharaan sistem untuk meningkatkan performa.'),
  ('maintenance_end_time', '')
ON CONFLICT (key) DO NOTHING;

