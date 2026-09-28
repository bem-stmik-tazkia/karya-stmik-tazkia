-- Migration: Add announcement settings to system_settings
-- Safe to run multiple times (idempotent)

-- Create system_settings table if not exists (in case it wasn't created yet)
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default announcement settings (won't overwrite existing)
INSERT INTO system_settings (key, value)
VALUES
  ('announcement_active', 'false'),
  ('announcement_message', '🚀 Update Baru! Kami telah menambahkan fitur-fitur baru setelah maintenance. Selamat menjelajahi Karya Tazkia!'),
  ('app_version', 'v1.0.0')
ON CONFLICT (key) DO NOTHING;
