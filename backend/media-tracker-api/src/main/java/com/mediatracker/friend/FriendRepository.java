// src/main/java/com/mediatracker/friend/FriendRepository.java
package com.mediatracker.friend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRepository extends JpaRepository<Friend, FriendId> {

    List<Friend> findByIdUserId(UUID userId);

    List<Friend> findByIdUserIdOrderByCreatedAtDesc(UUID userId);

    List<Friend> findByIdFriendId(UUID friendId);

    List<Friend> findByIdUserIdAndStatus(UUID userId, FriendStatus status);

    List<Friend> findByIdFriendIdAndStatus(UUID friendId, FriendStatus status);

    Optional<Friend> findByIdUserIdAndIdFriendId(UUID userId, UUID friendId);
}