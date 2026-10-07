-- Migration: Create Base Tables (karya & mahasiswa_profiles)
-- Description: Skema awal untuk proyek Karya Tazkia yang di-reconstruct dari src/types/karya.ts

-- 1. Table: mahasiswa_profiles
CREATE TABLE IF NOT EXISTS public.mahasiswa_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    angkatan INTEGER NOT NULL,
    prodi TEXT NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    status_badge TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    website_url TEXT,
    skills TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table: karya
CREATE TABLE IF NOT EXISTS public.karya (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    github_url TEXT,
    live_url TEXT,
    video_url TEXT,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    gallery JSONB DEFAULT '[]'::jsonb,
    team JSONB DEFAULT '[]'::jsonb,
    tech_stack TEXT[] DEFAULT '{}',
    features JSONB DEFAULT '[]'::jsonb,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    reject_reason TEXT,
    ai_review_status TEXT DEFAULT 'pending_review',
    ai_review_score INTEGER,
    ai_review_reason TEXT,
    ai_reviewed_at TIMESTAMPTZ,
    ai_processing_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Functions for Views and Likes
CREATE OR REPLACE FUNCTION increment_karya_view(karya_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.karya
  SET views = views + 1
  WHERE id = karya_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_karya_like(karya_id UUID)
RETURNS boolean AS $$
DECLARE
  -- (Contoh sederhana, pada praktiknya butuh tabel karya_likes untuk tracking per user)
  current_likes INTEGER;
BEGIN
  UPDATE public.karya
  SET likes = likes + 1
  WHERE id = karya_id
  RETURNING likes INTO current_likes;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Optional) RLS Policies dasar jika dibutuhkan
-- ALTER TABLE public.karya ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.mahasiswa_profiles ENABLE ROW LEVEL SECURITY;
