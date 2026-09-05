-- Tambahkan policy agar pengguna bisa menghapus percakapan yang mereka ikuti
CREATE POLICY "Users can delete their conversations" ON conversations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.student_id = auth.uid()
  )
);
