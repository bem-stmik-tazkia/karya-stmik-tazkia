-- 1. Create table for conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for conversation participants
CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, student_id)
);

-- 3. Create table for messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies for conversations
-- Users can view conversations they are part of
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.student_id = auth.uid()
  )
);

-- Users can insert new conversations
CREATE POLICY "Authenticated users can create conversations" ON conversations
FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update their conversations
CREATE POLICY "Users can update their conversations" ON conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.student_id = auth.uid()
  )
);

-- 6. Policies for conversation_participants
-- Users can view participants of their conversations
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.student_id = auth.uid()
  )
);

-- Users can insert participants (e.g., when creating a new chat)
CREATE POLICY "Authenticated users can add participants" ON conversation_participants
FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Policies for messages
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.student_id = auth.uid()
  )
);

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations" ON messages
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.student_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Users can update messages (specifically to set is_read = true)
CREATE POLICY "Users can update messages in their conversations" ON messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.student_id = auth.uid()
  )
);

-- 8. Triggers to update conversation updated_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp() RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- 9. Enable Realtime for these tables
-- Assuming publication 'supabase_realtime' exists (default in Supabase)
-- You may need to run this on the Supabase SQL Editor if it fails here
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
