ALTER TABLE reviews
  ALTER COLUMN rating TYPE numeric(2,1)
  USING (rating::numeric);
