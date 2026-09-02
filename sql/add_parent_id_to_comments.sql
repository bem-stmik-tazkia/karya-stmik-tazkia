ALTER TABLE feed_post_comments
ADD COLUMN parent_id UUID REFERENCES feed_post_comments(id) ON DELETE CASCADE;
