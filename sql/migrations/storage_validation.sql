-- Apply these policies in your Supabase SQL Editor to enforce server-side validation for Storage
-- (Catatan: Hapus atau lewati ALTER TABLE jika error 'must be owner' karena RLS biasanya sudah aktif secara bawaan)

-- Pastikan bucket 'public_images' memiliki konfigurasi batasan dasar (hanya jika memungkinkan/didukung, jika tidak abaikan)
UPDATE storage.buckets 
SET file_size_limit = 2097152, 
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
WHERE id = 'public_images';

-- Allow authenticated users to upload ONLY into their own folder (auth.uid())
-- and limit the file size (e.g., max 2MB = 2097152 bytes)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'public_images' 
    AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
    AND (COALESCE(metadata->>'size', '0')::bigint) <= 2097152
    AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Allow authenticated users to update/delete ONLY their own files
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'public_images' 
    AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'public_images' 
    AND (auth.uid()::text = (string_to_array(name, '/'))[1])
);

-- Allow anyone to view images
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'public_images' );
