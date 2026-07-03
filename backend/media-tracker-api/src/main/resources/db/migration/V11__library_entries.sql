CREATE TABLE library_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  progress_current NUMERIC(10,1),
  progress_total NUMERIC(10,1),
  started_at DATE,
  completed_at DATE,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_library_entry_user_media UNIQUE (user_id, media_id),
  CONSTRAINT ck_library_entry_status CHECK (
    status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'DROPPED')
  ),
  CONSTRAINT ck_library_entry_progress_current CHECK (
    progress_current IS NULL OR progress_current >= 0
  ),
  CONSTRAINT ck_library_entry_progress_total CHECK (
    progress_total IS NULL OR progress_total > 0
  ),
  CONSTRAINT ck_library_entry_progress_range CHECK (
    progress_current IS NULL OR progress_total IS NULL OR progress_current <= progress_total
  )
);

CREATE INDEX idx_library_entries_user_updated
  ON library_entries(user_id, updated_at DESC);

CREATE INDEX idx_library_entries_media
  ON library_entries(media_id);

INSERT INTO library_entries (
  user_id,
  media_id,
  status,
  completed_at,
  is_private,
  created_at,
  updated_at
)
SELECT
  user_id,
  media_id,
  'COMPLETED',
  created_at::date,
  FALSE,
  created_at,
  created_at
FROM reviews
ON CONFLICT (user_id, media_id) DO NOTHING;
