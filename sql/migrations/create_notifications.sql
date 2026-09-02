-- ============================================================
-- STEP 1: Buat tabel notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL, -- 'karya_approved' | 'karya_rejected' | 'karya_pending' | 'info'
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  karya_id    UUID        REFERENCES public.karya(id) ON DELETE SET NULL,
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 2: Row Level Security — user hanya bisa lihat miliknya
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_notifications" ON public.notifications;
CREATE POLICY "users_own_notifications" ON public.notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (AI worker, server actions) bisa insert ke semua
DROP POLICY IF EXISTS "service_role_all_notifications" ON public.notifications;
CREATE POLICY "service_role_all_notifications" ON public.notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- STEP 3: Fungsi trigger — otomatis kirim notifikasi
--         saat status karya berubah
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_on_karya_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_title   TEXT;
  v_message TEXT;
  v_type    TEXT;
BEGIN
  -- Hanya jalankan jika kolom status benar-benar berubah
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Ambil user_id pemilik karya
  SELECT user_id INTO v_user_id FROM public.karya WHERE id = NEW.id;
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Tentukan isi notifikasi berdasarkan status baru
  IF NEW.status = 'approved' THEN
    v_type    := 'karya_approved';
    v_title   := '🎉 Karya Kamu Disetujui!';
    v_message := 'Karya "' || NEW.title || '" telah disetujui dan sekarang sudah tayang di galeri publik!';

  ELSIF NEW.status = 'rejected' THEN
    v_type    := 'karya_rejected';
    v_title   := '❌ Karya Kamu Ditolak';
    v_message := 'Karya "' || NEW.title || '" ditolak. Kamu bisa edit dan kirim ulang karyamu.';

  ELSIF NEW.status = 'pending' THEN
    -- Hanya notifikasi jika sebelumnya bukan pending (yaitu diubah dari rejected/approved)
    IF OLD.status != 'pending' THEN
      v_type    := 'karya_pending';
      v_title   := '🔄 Karya Dalam Review Ulang';
      v_message := 'Karya "' || NEW.title || '" sedang dalam proses review kembali.';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Insert notifikasi
  INSERT INTO public.notifications (user_id, type, title, message, karya_id)
  VALUES (v_user_id, v_type, v_title, v_message, NEW.id);

  RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 4: Pasang trigger ke tabel karya
-- ============================================================
DROP TRIGGER IF EXISTS trg_karya_status_change ON public.karya;
CREATE TRIGGER trg_karya_status_change
  AFTER UPDATE OF status ON public.karya
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_karya_status_change();

-- ============================================================
-- STEP 5: Index untuk query cepat
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications (user_id, is_read) WHERE is_read = false;
