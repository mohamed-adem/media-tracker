package com.mediatracker.media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; import java.util.UUID;
public interface MediaItemRepository extends JpaRepository<MediaItem, UUID> {
  Optional<MediaItem> findByKindAndExternalId(MediaKind kind, String externalId);
}