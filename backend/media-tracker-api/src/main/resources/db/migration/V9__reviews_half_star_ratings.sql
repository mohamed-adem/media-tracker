ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS chk_reviews_rating_range;

ALTER TABLE reviews
  ALTER COLUMN rating TYPE numeric(2,1)
  USING rating::numeric(2,1);

ALTER TABLE reviews
  ADD CONSTRAINT chk_reviews_rating_range
  CHECK (rating BETWEEN 0.5 AND 5.0 AND mod(rating * 2, 1) = 0);
