-- ============================================================
-- KEAMANAN ADMIN: Proteksi via Supabase Row Level Security (RLS)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- Email admin TIDAK pernah disimpan di kode aplikasi!
-- ============================================================

-- 1. Buat tabel admin_users (terpisah dari tabel publik)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan RLS di tabel admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Hanya admin yang sudah terdaftar yang bisa melihat tabelnya sendiri
CREATE POLICY "Admin can view own record"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Buat fungsi helper: cek apakah user saat ini adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 5. RLS Policy untuk tabel karya:
--    Admin bisa approve/reject karya apapun
CREATE POLICY "Admin can update any karya status"
  ON public.karya FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can view all karya"
  ON public.karya FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR status = 'approved'
  );

-- ============================================================
-- CARA DAFTARKAN AKUN ADMIN (Jalankan SEKALI di SQL Editor):
-- Ganti 'EMAIL_ADMIN' dengan email asli admin kamu
-- ============================================================

-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users
-- WHERE email = 'EMAIL_ADMIN'  -- Ganti dengan email admin
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFIKASI
-- ============================================================
-- SELECT u.email, a.role, a.created_at
-- FROM public.admin_users a
-- JOIN auth.users u ON u.id = a.user_id;
