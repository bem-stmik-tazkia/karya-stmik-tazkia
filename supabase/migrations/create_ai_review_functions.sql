-- ============================================================
-- STEP 1: Buat fungsi RPC "Mutex" - SELECT FOR UPDATE SKIP LOCKED
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION claim_pending_karya_for_review(batch_size INT DEFAULT 10)
RETURNS SETOF karya
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    UPDATE public.karya
    SET
      ai_review_status = 'processing',
      ai_processing_started_at = NOW()
    WHERE id IN (
      SELECT id
      FROM public.karya
      WHERE ai_review_status = 'pending_review'
        AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED  -- MUTEX: Skip yang sedang diproses worker lain
    )
    RETURNING *;
END;
$$;

-- ============================================================
-- STEP 2: Auto-reset karya yang stuck di "processing" > 10 menit
-- (safety net kalau worker crash di tengah jalan)
-- ============================================================

CREATE OR REPLACE FUNCTION reset_stuck_processing_karya()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE public.karya
  SET
    ai_review_status = 'pending_review',
    ai_processing_started_at = NULL
  WHERE ai_review_status = 'processing'
    AND ai_processing_started_at < NOW() - INTERVAL '10 minutes';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- ============================================================
-- STEP 3: Grant akses ke fungsi-fungsi ini (untuk anon key)
-- ============================================================
GRANT EXECUTE ON FUNCTION claim_pending_karya_for_review(INT) TO anon;
GRANT EXECUTE ON FUNCTION claim_pending_karya_for_review(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_stuck_processing_karya() TO anon;
GRANT EXECUTE ON FUNCTION reset_stuck_processing_karya() TO authenticated;

-- ============================================================
-- STEP 4 (Opsional): Setup Supabase Cron
-- Aktifkan extension pg_cron dulu di Supabase Dashboard > Extensions
-- lalu jalankan ini:
-- ============================================================

-- SELECT cron.schedule(
--   'ai-review-worker',       -- nama job
--   '* * * * *',              -- setiap 1 menit
--   $$
--   SELECT net.http_post(
--     url := 'https://DOMAIN_KAMU/api/ai-review',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer karya-tazkia-cron-2025"}',
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- STEP 5 (Opsional): Reset semua karya yang stuck (jalankan manual kalau perlu)
-- SELECT reset_stuck_processing_karya();
