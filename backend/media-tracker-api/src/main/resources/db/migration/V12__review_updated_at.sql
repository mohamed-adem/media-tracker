ALTER TABLE reviews
  ADD COLUMN updated_at TIMESTAMPTZ;

UPDATE reviews
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE reviews
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX idx_reviews_user_updated
  ON reviews(user_id, updated_at DESC);
