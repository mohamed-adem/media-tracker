package com.mediatracker.media;

import com.mediatracker.library.LibraryEntryService;
import com.mediatracker.media.dto.ReviewDtos;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
  private final ReviewRepository reviewRepo;
  private final MediaItemService mediaItems;
  private final LibraryEntryService library;
  private final ReviewService reviewService;

  public ReviewController(
      ReviewRepository reviewRepo,
      MediaItemService mediaItems,
      LibraryEntryService library,
      ReviewService reviewService
  ) {
    this.reviewRepo = reviewRepo;
    this.mediaItems = mediaItems;
    this.library = library;
    this.reviewService = reviewService;
  }

  @PostMapping
  @Transactional
  public ReviewDtos.View upsert(@Valid @RequestBody ReviewDtos.Upsert req, Authentication auth) {
    UUID userId = UUID.fromString(auth.getName());
    MediaItem media = mediaItems.resolve(
        req.kind(), req.externalId(), req.title(), req.year(), req.posterUrl()
    );
    Review saved = reviewService.upsert(userId, media, req.rating(), req.body());
    library.ensureCompleted(userId, media);

    return new ReviewDtos.View(
        saved.getId(),
        media.getId(),
        media.getTitle(),
        saved.getRating(),
        saved.getBody(),
        media.getKind(),
        media.getYear(),
        media.getPosterUrl(),
        saved.getCreatedAt()
    );
  }

  @GetMapping("/me")
  @Transactional(readOnly = true)
  public List<ReviewDtos.View> myReviews(Authentication auth) {
    UUID userId = UUID.fromString(auth.getName());
    return reviewRepo.findByUserIdOrderByUpdatedAtDesc(userId).stream()
        .map(rv -> new ReviewDtos.View(
            rv.getId(),
            rv.getMedia().getId(),
            rv.getMedia().getTitle(),
            rv.getRating(),
            rv.getBody(),
            rv.getMedia().getKind(),
            rv.getMedia().getYear(),
            rv.getMedia().getPosterUrl(),
            rv.getUpdatedAt()))
        .toList();
  }

}
