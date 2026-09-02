-- 1. Tambah kolom followers_count dan following_count di tabel mahasiswa_profiles
ALTER TABLE mahasiswa_profiles 
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;

-- 2. Buat tabel student_followers
CREATE TABLE IF NOT EXISTS student_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 3. Aktifkan RLS di student_followers
ALTER TABLE student_followers ENABLE ROW LEVEL SECURITY;

-- 4. Policies untuk student_followers
CREATE POLICY "Anyone can view followers" ON student_followers FOR SELECT USING (true);

-- User yang login hanya bisa mem-follow menggunakan user ID mereka sendiri
CREATE POLICY "Authenticated users can follow" ON student_followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

-- User yang login hanya bisa unfollow (delete) menggunakan user ID mereka sendiri
CREATE POLICY "Users can unfollow" ON student_followers FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- 5. Buat function & trigger untuk auto-update jumlah follower/following

-- Trigger saat bertambah (Follow)
CREATE OR REPLACE FUNCTION increment_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  -- Tambah following_count untuk follower
  UPDATE mahasiswa_profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
  -- Tambah followers_count untuk yang di-follow
  UPDATE mahasiswa_profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_follow_counts ON student_followers;
CREATE TRIGGER tr_increment_follow_counts
AFTER INSERT ON student_followers
FOR EACH ROW EXECUTE FUNCTION increment_follow_counts();

-- Trigger saat berkurang (Unfollow)
CREATE OR REPLACE FUNCTION decrement_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  -- Kurangi following_count untuk follower
  UPDATE mahasiswa_profiles SET following_count = following_count - 1 WHERE user_id = OLD.follower_id;
  -- Kurangi followers_count untuk yang di-unfollow
  UPDATE mahasiswa_profiles SET followers_count = followers_count - 1 WHERE user_id = OLD.following_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_decrement_follow_counts ON student_followers;
CREATE TRIGGER tr_decrement_follow_counts
AFTER DELETE ON student_followers
FOR EACH ROW EXECUTE FUNCTION decrement_follow_counts();
