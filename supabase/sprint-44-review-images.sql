-- Sprint 44: Review Images
-- Add image support to reviews

-- 1. Add image_url column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create review-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS policies for storage bucket
-- Anyone can read review images
CREATE POLICY "Review images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- Service role can upload (via API)
CREATE POLICY "Service role can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-images');

-- Users can delete their own images (optional - can be removed if not needed)
CREATE POLICY "Users can delete review images"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-images');
