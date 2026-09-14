package com.mediatracker.library;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, UUID> {
    @EntityGraph(attributePaths = "media")
    List<LibraryEntry> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = "media")
    List<LibraryEntry> findByUserIdInAndPrivateEntryFalse(Collection<UUID> userIds);

    @EntityGraph(attributePaths = "media")
    List<LibraryEntry> findByMedia_IdInAndPrivateEntryFalse(Collection<UUID> mediaIds);

    @EntityGraph(attributePaths = "media")
    List<LibraryEntry> findByUserIdInAndMedia_IdAndPrivateEntryFalse(Collection<UUID> userIds, UUID mediaId);

    Optional<LibraryEntry> findByUserIdAndMedia_Id(UUID userId, UUID mediaId);

    @EntityGraph(attributePaths = "media")
    Optional<LibraryEntry> findByIdAndUserId(UUID id, UUID userId);
}
