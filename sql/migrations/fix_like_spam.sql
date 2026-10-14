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
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_device_id ON public.karya_likes_log(device_id);

-- RLS policies untuk karya_likes_log agar select/insert/delete diizinkan
ALTER TABLE public.karya_likes_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "karya_likes_log_select_all" ON public.karya_likes_log;
CREATE POLICY "karya_likes_log_select_all"
  ON public.karya_likes_log FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "karya_likes_log_insert_all" ON public.karya_likes_log;
CREATE POLICY "karya_likes_log_insert_all"
  ON public.karya_likes_log FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "karya_likes_log_delete_all" ON public.karya_likes_log;
CREATE POLICY "karya_likes_log_delete_all"
  ON public.karya_likes_log FOR DELETE
  USING (true);

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

-- ─── 4. RPC increment_karya_view (atomic update views, aman untuk anon/HP) ──
CREATE OR REPLACE FUNCTION public.increment_karya_view(karya_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.karya
  SET views = COALESCE(views, 0) + 1
  WHERE id = karya_id;
END;
$$;

-- Handle juga signature alternatif p_karya_id
CREATE OR REPLACE FUNCTION public.increment_karya_view(
  p_karya_id uuid,
  p_device_id text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.karya
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_karya_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_karya_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_karya_view(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_karya_view(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_karya_view(uuid, text, uuid) TO anon;

