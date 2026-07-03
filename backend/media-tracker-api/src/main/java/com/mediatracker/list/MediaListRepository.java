package com.mediatracker.list;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaListRepository extends JpaRepository<MediaList, UUID> {
    List<MediaList> findByUserIdOrderByUpdatedAtDesc(UUID userId);
    List<MediaList> findByUserIdAndPrivateListFalseOrderByUpdatedAtDesc(UUID userId);
    Optional<MediaList> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(UUID userId, String name, UUID id);
}
