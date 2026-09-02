-- LANGKAH 1: Tambah kolom AI Review ke tabel karya
ALTER TABLE public.karya
  ADD COLUMN IF NOT EXISTS ai_review_status TEXT DEFAULT 'pending_review'
    CHECK (ai_review_status IN ('pending_review', 'processing', 'reviewed')),
  ADD COLUMN IF NOT EXISTS ai_review_score INTEGER,
  ADD COLUMN IF NOT EXISTS ai_review_reason TEXT,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_processing_started_at TIMESTAMPTZ;

-- LANGKAH 2: Buat index supaya query lebih cepat
CREATE INDEX IF NOT EXISTS idx_karya_ai_review_status
  ON public.karya(ai_review_status)
  WHERE ai_review_status = 'pending_review';

-- LANGKAH 3: Buat fungsi Mutex (untuk anti race-condition)
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
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
END;
$$;

-- LANGKAH 4: Buat fungsi reset karya yang stuck lebih dari 10 menit
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

-- LANGKAH 5: Izinkan fungsi dipanggil dari aplikasi
GRANT EXECUTE ON FUNCTION claim_pending_karya_for_review(INT) TO anon;
GRANT EXECUTE ON FUNCTION claim_pending_karya_for_review(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_stuck_processing_karya() TO anon;
GRANT EXECUTE ON FUNCTION reset_stuck_processing_karya() TO authenticated;
