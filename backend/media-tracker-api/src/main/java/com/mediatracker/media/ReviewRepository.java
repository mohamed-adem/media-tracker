package com.mediatracker.media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; 
import java.util.Optional; 
import java.util.UUID;
import java.util.Collection;
import org.springframework.data.jpa.repository.EntityGraph;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
  @EntityGraph(attributePaths = "media")
  List<Review> findByUserIdOrderByUpdatedAtDesc(UUID userId);

  @EntityGraph(attributePaths = "media")
  List<Review> findTop50ByUserIdInOrderByUpdatedAtDesc(Collection<UUID> userIds);

  Optional<Review> findByUserIdAndMedia_Id(UUID userId, UUID mediaId);
  List<Review> findByUserIdInAndMedia_IdOrderByUpdatedAtDesc(Collection<UUID> userIds, UUID mediaId);
  void deleteByUserIdAndMedia_Id(UUID userId, UUID mediaId);
}
