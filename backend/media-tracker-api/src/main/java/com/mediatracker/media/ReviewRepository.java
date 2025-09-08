package com.mediatracker.media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; 
import java.util.Optional; 
import java.util.UUID;
import java.util.Collection;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
  List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);
  List<Review> findTop50ByUserIdInOrderByCreatedAtDesc(Collection<UUID> userIds);
  Optional<Review> findByUserIdAndMedia_Id(UUID userId, UUID mediaId);
}