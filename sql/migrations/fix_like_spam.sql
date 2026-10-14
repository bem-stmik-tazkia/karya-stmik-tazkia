-- ============================================================
-- Migration: Fix Like Spam — Gunakan karya_likes_log (sudah ada)
-- Deskripsi:
--   1. Hapus tabel karya_likes yang baru dibuat (duplikat)
--   2. Tambah unique constraint di karya_likes_log untuk mencegah spam
--   3. Buat RPC increment_likes untuk atomic update likes
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ─── 1. Hapus tabel karya_likes yang baru (duplikat) ─────────────────────────
DROP TABLE IF EXISTS public.karya_likes;

-- ─── 2. Tambah unique constraint di karya_likes_log ──────────────────────────
-- Cegah satu user_id like karya yang sama dua kali
ALTER TABLE public.karya_likes_log
  DROP CONSTRAINT IF EXISTS karya_likes_log_karya_user_unique;
ALTER TABLE public.karya_likes_log
  ADD CONSTRAINT karya_likes_log_karya_user_unique
  UNIQUE (karya_id, user_id);

-- Cegah satu device_id like karya yang sama dua kali (untuk anonymous)
ALTER TABLE public.karya_likes_log
  DROP CONSTRAINT IF EXISTS karya_likes_log_karya_device_unique;
ALTER TABLE public.karya_likes_log
  ADD CONSTRAINT karya_likes_log_karya_device_unique
  UNIQUE (karya_id, device_id);

-- Index untuk performa query cek like status
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_karya_id ON public.karya_likes_log(karya_id);
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_user_id  ON public.karya_likes_log(user_id);
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_device_id ON public.karya_likes_log(device_id);

-- ─── 3. RPC increment_likes (atomic, mencegah race condition) ────────────────
CREATE OR REPLACE FUNCTION public.increment_likes(karya_id uuid, delta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.karya
  SET likes = GREATEST(0, COALESCE(likes, 0) + delta)
  WHERE id = karya_id;
END;
$$;

-- Berikan akses RPC ke authenticated user dan anon
GRANT EXECUTE ON FUNCTION public.increment_likes(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_likes(uuid, integer) TO anon;
