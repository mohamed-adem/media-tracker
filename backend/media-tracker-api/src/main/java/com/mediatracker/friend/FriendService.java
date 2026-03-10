package com.mediatracker.friend;

import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class FriendService {
  private final FriendRepository repo;

  public FriendService(FriendRepository repo) { this.repo = repo; }

  public void linkBothAccepted(UUID a, UUID b) {
    if (a.equals(b)) return;
    upsert(a, b, FriendStatus.ACCEPTED);
    upsert(b, a, FriendStatus.ACCEPTED);
  }

  private void upsert(UUID userId, UUID friendId, FriendStatus status) {
    var id = new FriendId(userId, friendId);
    repo.findById(id).ifPresentOrElse(existing -> {
      if (existing.getStatus() != status) {
        existing.setStatus(status);
        repo.save(existing);
      }
    }, () -> {
      Friend f = new Friend();
      f.setId(id);
      f.setStatus(status);
      f.setCreatedAt(OffsetDateTime.now());
      repo.save(f);
    });
  }
}
