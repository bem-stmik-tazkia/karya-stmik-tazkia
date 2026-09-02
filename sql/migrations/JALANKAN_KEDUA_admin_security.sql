-- LANGKAH 1: Buat tabel daftar admin
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANGKAH 2: Aktifkan keamanan baris (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- LANGKAH 3: Buat kebijakan: admin hanya bisa lihat datanya sendiri
CREATE POLICY "Admin can view own record"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- LANGKAH 4: Buat fungsi helper pengecekan admin
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

-- LANGKAH 5: Izinkan admin update status karya
CREATE POLICY "Admin can update any karya status"
  ON public.karya FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LANGKAH 6: Daftarkan akun admin
-- GANTI bem@stmik.tazkia.ac.id dengan email admin yang benar
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users
WHERE email = 'bem@stmik.tazkia.ac.id'
ON CONFLICT DO NOTHING;
