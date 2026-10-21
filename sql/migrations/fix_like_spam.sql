-- ============================================================
-- Migration: Fix Like Spam & Atomic Views — Menggunakan karya_likes_log
-- Deskripsi:
--   1. Bersihkan duplikat likes lama jika ada
--   2. Pasang UNIQUE constraint di karya_likes_log (mencegah spam like)
--   3. Buat RPC increment_likes & increment_karya_view (atomic & fast)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ─── 1. Bersihkan duplikat log lama jika ada (agar UNIQUE tidak error) ───────
DELETE FROM public.karya_likes_log a
USING public.karya_likes_log b
WHERE a.id < b.id 
  AND a.karya_id = b.karya_id 
  AND (
    (a.user_id IS NOT NULL AND a.user_id = b.user_id)
    OR (a.device_id IS NOT NULL AND a.device_id = b.device_id)
  );

-- ─── 2. Tambah UNIQUE constraint di karya_likes_log ──────────────────────────
-- Cegah satu user_id menyukai karya yang sama lebih dari 1 kali
ALTER TABLE public.karya_likes_log
  DROP CONSTRAINT IF EXISTS karya_likes_log_karya_user_unique;
ALTER TABLE public.karya_likes_log
  ADD CONSTRAINT karya_likes_log_karya_user_unique
  UNIQUE (karya_id, user_id);

-- Cegah satu device_id menyukai karya yang sama lebih dari 1 kali (tamu/anonymous)
ALTER TABLE public.karya_likes_log
  DROP CONSTRAINT IF EXISTS karya_likes_log_karya_device_unique;
ALTER TABLE public.karya_likes_log
  ADD CONSTRAINT karya_likes_log_karya_device_unique
  UNIQUE (karya_id, device_id);

-- Index untuk mempercepat query cek like
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_karya_id ON public.karya_likes_log(karya_id);
CREATE INDEX IF NOT EXISTS idx_karya_likes_log_device_id ON public.karya_likes_log(device_id);

-- ─── 3. RLS policies untuk karya_likes_log ────────────────────────────────────
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

-- ─── 4. RPC increment_likes (atomic, anti race condition) ─────────────────────
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

GRANT EXECUTE ON FUNCTION public.increment_likes(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_likes(uuid, integer) TO anon;

-- ─── 5. RPC increment_karya_view (atomic views counter) ──────────────────────
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
