-- Add pending_edits column to karya table
ALTER TABLE public.karya ADD COLUMN pending_edits JSONB DEFAULT NULL;

-- Comment for the column
COMMENT ON COLUMN public.karya.pending_edits IS 'Stores pending edits for a karya before they are approved';
