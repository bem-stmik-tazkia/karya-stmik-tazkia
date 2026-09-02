-- 1. Create table for posts
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('project', 'update', 'collab')),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for post likes
CREATE TABLE feed_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, student_id)
);

-- 3. Create table for post comments
CREATE TABLE feed_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_post_comments ENABLE ROW LEVEL SECURITY;

-- 5. Policies for posts
CREATE POLICY "Anyone can view posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON feed_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own posts" ON feed_posts FOR UPDATE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Users can delete their own posts" ON feed_posts FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- 6. Policies for likes
CREATE POLICY "Anyone can view likes" ON feed_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like/unlike" ON feed_post_likes FOR ALL TO authenticated USING (auth.uid() = student_id);

-- 7. Policies for comments
CREATE POLICY "Anyone can view comments" ON feed_post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON feed_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can delete own comments" ON feed_post_comments FOR DELETE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Users can update own comments" ON feed_post_comments FOR UPDATE TO authenticated USING (auth.uid() = student_id);

-- 8. Functions & Triggers for counting
CREATE OR REPLACE FUNCTION increment_feed_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_increment_feed_likes
AFTER INSERT ON feed_post_likes
FOR EACH ROW EXECUTE FUNCTION increment_feed_likes();

CREATE OR REPLACE FUNCTION decrement_feed_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_decrement_feed_likes
AFTER DELETE ON feed_post_likes
FOR EACH ROW EXECUTE FUNCTION decrement_feed_likes();

-- comments count trigger
CREATE OR REPLACE FUNCTION increment_feed_comments() RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_increment_feed_comments
AFTER INSERT ON feed_post_comments
FOR EACH ROW EXECUTE FUNCTION increment_feed_comments();

CREATE OR REPLACE FUNCTION decrement_feed_comments() RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_decrement_feed_comments
AFTER DELETE ON feed_post_comments
FOR EACH ROW EXECUTE FUNCTION decrement_feed_comments();
