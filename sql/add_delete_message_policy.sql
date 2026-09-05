-- Tambahkan policy agar pengguna bisa menghapus pesan mereka sendiri
CREATE POLICY "Users can delete their own messages" ON messages
FOR DELETE USING (
  sender_id = auth.uid()
);
