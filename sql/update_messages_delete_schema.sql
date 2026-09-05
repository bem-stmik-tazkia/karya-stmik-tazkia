-- 1. Tambahkan kolom untuk melacak pesan yang ditarik secara global (Hapus untuk Semua Orang)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted_for_everyone BOOLEAN DEFAULT false;

-- 2. Tambahkan kolom untuk melacak pengguna yang menghapus pesan untuk diri sendiri (Hapus untuk Saya)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_for UUID[] DEFAULT '{}';
