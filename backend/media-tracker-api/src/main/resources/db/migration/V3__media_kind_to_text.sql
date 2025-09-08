ALTER TABLE media_items
  ALTER COLUMN kind TYPE text USING kind::text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_kind') THEN
    DROP TYPE media_kind;
  END IF;
END$$;
