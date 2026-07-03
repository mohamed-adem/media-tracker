CREATE TABLE media_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(500),
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_media_lists_user_name UNIQUE (user_id, name)
);

CREATE TABLE media_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES media_lists(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_media_list_items_list_media UNIQUE (list_id, media_id),
  CONSTRAINT ck_media_list_items_position CHECK (position >= 0)
);

CREATE INDEX idx_media_lists_user_updated ON media_lists(user_id, updated_at DESC);
CREATE INDEX idx_media_list_items_list_position ON media_list_items(list_id, position, created_at);
CREATE INDEX idx_media_list_items_media ON media_list_items(media_id);
