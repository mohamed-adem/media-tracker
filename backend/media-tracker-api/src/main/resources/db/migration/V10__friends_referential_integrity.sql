DELETE FROM friends f
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = f.user_id)
   OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id = f.friend_id)
   OR f.user_id = f.friend_id;

ALTER TABLE friends
  ADD CONSTRAINT fk_friends_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE friends
  ADD CONSTRAINT fk_friends_friend
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE friends
  ADD CONSTRAINT chk_friends_not_self CHECK (user_id <> friend_id);

CREATE INDEX idx_friends_friend_status
  ON friends(friend_id, status, created_at DESC);

CREATE INDEX idx_friends_user_status_created
  ON friends(user_id, status, created_at DESC);
