package com.mediatracker.friend;

import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class FriendService {
  private final FriendRepository repo;

  public FriendService(FriendRepository repo) { this.repo = repo; }

  public void linkBoth(UUID a, UUID b) {
    if (a.equals(b)) return;
    upsert(a, b);
    upsert(b, a);
  }

  private void upsert(UUID userId, UUID friendId) {
    var id = new FriendId(userId, friendId);
    repo.findById(id).orElseGet(() -> {
      Friend f = new Friend();
      f.setId(id);
      f.setCreatedAt(OffsetDateTime.now());
      return repo.save(f);
    });
  }
}