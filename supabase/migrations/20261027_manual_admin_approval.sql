BEGIN;

-- 1. Helper function: public.is_admin()
--    SECURITY DEFINER dengan search_path = public untuk mencegah recursive policy
--    dan bypass RLS saat memeriksa keanggotaan admin di public.admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. Trigger function: tr_protect_karya_status()
--    - session_user IN ('postgres','supabase_admin') ATAU auth.role() = 'service_role' ATAU public.is_admin()
--      diberikan akses penuh (tidak diubah-ubah oleh trigger)
--    - INSERT oleh user biasa: selalu dipaksa status = 'pending', user_id = auth.uid(), ai_review_* = NULL
--    - UPDATE oleh user biasa: user_id & ai_review_* dikembalikan ke OLD; jika ada kolom di luar v_ignore
--      (seperti title, description, category, tech_stack, gallery, dll) yang berubah,
--      status otomatis kembali ke 'pending' (wajib kurasi ulang).
--    - Kolom counter 'views', 'likes', serta 'pending_edits' dimasukkan ke v_ignore agar pembaruan data tersebut tidak mereset status.
CREATE OR REPLACE FUNCTION public.tr_protect_karya_status()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ignore text[] := ARRAY[
    'status',
    'reject_reason',
    'views',
    'likes',
    'pending_edits',
    'ai_review_status',
    'ai_review_score',
    'ai_review_reason',
    'ai_reviewed_at',
    'ai_processing_started_at',
    'user_id'
  ];
BEGIN
  IF session_user IN ('postgres','supabase_admin')
     OR auth.role() = 'service_role'
     OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.reject_reason := NULL;
    NEW.ai_review_status := NULL;
    NEW.ai_review_score := NULL;
    NEW.ai_review_reason := NULL;
    NEW.ai_reviewed_at := NULL;
    NEW.ai_processing_started_at := NULL;
    NEW.user_id := auth.uid();
    RETURN NEW;
  END IF;

  NEW.user_id := OLD.user_id;
  NEW.ai_review_status := OLD.ai_review_status;
  NEW.ai_review_score := OLD.ai_review_score;
  NEW.ai_review_reason := OLD.ai_review_reason;
  NEW.ai_reviewed_at := OLD.ai_reviewed_at;
  NEW.ai_processing_started_at := OLD.ai_processing_started_at;

  IF (to_jsonb(NEW) - v_ignore) IS DISTINCT FROM (to_jsonb(OLD) - v_ignore) THEN
    NEW.status := 'pending';
    NEW.reject_reason := NULL;
  ELSE
    NEW.status := OLD.status;
    NEW.reject_reason := OLD.reject_reason;
  END IF;
  RETURN NEW;
END;
$$;

-- Pasang trigger pada tabel karya
DROP TRIGGER IF EXISTS tr_karya_status_protection ON public.karya;
CREATE TRIGGER tr_karya_status_protection
BEFORE INSERT OR UPDATE ON public.karya
FOR EACH ROW EXECUTE FUNCTION public.tr_protect_karya_status();

-- 3. Hapus dinamis SEMUA policy lama di tabel karya & admin_users via pg_policies
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('karya','admin_users')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 4. Aktifkan RLS di kedua tabel
ALTER TABLE public.karya ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies Baru untuk tabel karya
CREATE POLICY karya_select ON public.karya FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY karya_insert ON public.karya FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY karya_update ON public.karya FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY karya_delete ON public.karya FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 6. RLS Policies Baru untuk tabel admin_users
CREATE POLICY admin_users_select ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY admin_users_insert ON public.admin_users FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY admin_users_update ON public.admin_users FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY admin_users_delete ON public.admin_users FOR DELETE TO authenticated
  USING (public.is_admin());

COMMIT;
