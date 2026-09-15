-- ============================================================
-- Tabel rate limiting untuk endpoint moderasi feed post
-- Jalankan di Supabase Dashboard > SQL Editor
-- Diakses via service role key saja (bypasses RLS)
-- ============================================================

create table if not exists post_rate_limits (
  user_id        uuid         primary key references auth.users(id) on delete cascade,
  call_count     int          not null default 0,
  fail_count     int          not null default 0,
  window_start   timestamptz  not null default now(),
  cooldown_until timestamptz,
  updated_at     timestamptz  not null default now()
);

-- Aktifkan RLS (tidak ada policy → hanya service role yang bisa akses)
alter table post_rate_limits enable row level security;

comment on table post_rate_limits is
  'Rate limiting untuk endpoint /api/moderate-post. Satu baris per user.';
comment on column post_rate_limits.call_count is
  'Jumlah total request moderasi dalam window saat ini (maks 10 per 5 menit)';
comment on column post_rate_limits.fail_count is
  'Jumlah konten yang DITOLAK AI dalam window saat ini (maks 3 sebelum cooldown)';
comment on column post_rate_limits.window_start is
  'Kapan window rate limit saat ini dimulai (di-reset setiap 5 menit)';
comment on column post_rate_limits.cooldown_until is
  'Jika tidak null, user terkena cooldown hingga timestamp ini (5 menit)';
