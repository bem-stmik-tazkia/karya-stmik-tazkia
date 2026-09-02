-- ============================================================
-- SQL MIGRATION: Tambah kolom AI Review ke tabel karya
-- Jalankan ini di: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tambah kolom-kolom AI review
ALTER TABLE public.karya
  ADD COLUMN IF NOT EXISTS ai_review_status TEXT DEFAULT 'pending_review'
    CHECK (ai_review_status IN ('pending_review', 'processing', 'reviewed')),
  ADD COLUMN IF NOT EXISTS ai_review_score INTEGER,
  ADD COLUMN IF NOT EXISTS ai_review_reason TEXT,
  ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_processing_started_at TIMESTAMPTZ;

-- 2. Index supaya Worker bisa cepat cari karya yang belum diproses
CREATE INDEX IF NOT EXISTS idx_karya_ai_review_status
  ON public.karya(ai_review_status)
  WHERE ai_review_status = 'pending_review';

-- 3. Reset karya yang stuck di "processing" lebih dari 10 menit
--    (safety net kalau worker mati tengah jalan)
--    Jalankan ini sebagai scheduled function atau manual kalau perlu
-- UPDATE public.karya
--   SET ai_review_status = 'pending_review', ai_processing_started_at = NULL
--   WHERE ai_review_status = 'processing'
--   AND ai_processing_started_at < NOW() - INTERVAL '10 minutes';

-- 4. Cek hasilnya
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'karya'
  AND column_name LIKE 'ai_%'
ORDER BY column_name;
