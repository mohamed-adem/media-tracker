package com.mediatracker.list;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaListItemRepository extends JpaRepository<MediaListItem, UUID> {
    @EntityGraph(attributePaths = "media")
    List<MediaListItem> findByListIdOrderByPositionAscCreatedAtAsc(UUID listId);

    Optional<MediaListItem> findByIdAndListId(UUID id, UUID listId);
    boolean existsByListIdAndMedia_Id(UUID listId, UUID mediaId);
    long countByListId(UUID listId);
}
