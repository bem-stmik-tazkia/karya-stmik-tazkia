-- 1. Create user_keys table for Cloud-Synced E2EE
CREATE TABLE user_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modify messages table to add nonce for decryption
ALTER TABLE messages ADD COLUMN nonce TEXT;

-- 3. Enable RLS on user_keys
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

-- 4. Policies for user_keys

-- Anyone authenticated can view public_key of other users
CREATE POLICY "Anyone can view public keys" ON user_keys
FOR SELECT TO authenticated
USING (true);

-- Users can only insert their own keys
CREATE POLICY "Users can insert their own keys" ON user_keys
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own keys
CREATE POLICY "Users can update their own keys" ON user_keys
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Note: In a real-world scenario where public_key is public but private_key is strictly private,
-- it is better to have separate tables or column-level security. 
-- Supabase doesn't easily support column-level SELECT policies by default in the UI.
-- As a workaround for this "Cloud-Synced" approach, we let them fetch the whole row, 
-- but only if they are the owner? Wait. If we restrict SELECT to owner, how do others get the public key?
-- We must allow others to get the public key. So they will get the private key too if they select?
-- Yes, if they do `SELECT * FROM user_keys`. This is a security flaw.
-- 
-- BETTER APPROACH: Split into two tables OR use a secure function to fetch private keys.
-- Let's drop user_keys and use two tables: `user_public_keys` and `user_private_keys`.

DROP TABLE IF EXISTS user_keys;

CREATE TABLE user_public_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_private_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  private_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_public_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_private_keys ENABLE ROW LEVEL SECURITY;

-- Policies for public keys (everyone can read, owner can write)
CREATE POLICY "Anyone can view public keys" ON user_public_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert public keys" ON user_public_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update public keys" ON user_public_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies for private keys (STRICTLY OWNER ONLY)
CREATE POLICY "Users can view own private key" ON user_private_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own private key" ON user_private_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own private key" ON user_private_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own private key" ON user_private_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);
