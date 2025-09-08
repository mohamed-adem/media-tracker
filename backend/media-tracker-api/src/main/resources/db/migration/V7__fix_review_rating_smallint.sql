ALTER TABLE reviews
  ALTER COLUMN rating TYPE SMALLINT USING rating::smallint;

ALTER TABLE reviews
  ALTER COLUMN rating SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'reviews' AND constraint_name = 'chk_reviews_rating_range'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT chk_reviews_rating_range;
  END IF;
END$$;

ALTER TABLE reviews
  ADD CONSTRAINT chk_reviews_rating_range CHECK (rating BETWEEN 1 AND 5);
