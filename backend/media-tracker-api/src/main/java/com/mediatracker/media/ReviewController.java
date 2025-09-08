package com.mediatracker.media;

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
  private final MediaItemRepository mediaRepo;
  private final ReviewRepository reviewRepo;

  public ReviewController(MediaItemRepository mediaRepo, ReviewRepository reviewRepo) {
    this.mediaRepo = mediaRepo;
    this.reviewRepo = reviewRepo;
  }

  @PostMapping
  @Transactional
  public ReviewDtos.View upsert(@Valid @RequestBody ReviewDtos.Upsert req, Authentication auth) {
    UUID userId = UUID.fromString(auth.getName());

    MediaItem media =
        (req.externalId() != null && !req.externalId().isBlank())
            ? mediaRepo.findByKindAndExternalId(req.kind(), req.externalId())
                .orElseGet(() -> {
                  MediaItem mi = new MediaItem();
                  mi.setKind(req.kind());
                  mi.setExternalId(req.externalId());
                  mi.setTitle(req.title());
                  mi.setYear(req.year());
                  mi.setPosterUrl(req.posterUrl()); // <— persist poster if supplied
                  return mediaRepo.save(mi);
                })
            : createBare(req);

    // If we previously created media without poster but we have one now, backfill
    if (media.getPosterUrl() == null && req.posterUrl() != null && !req.posterUrl().isBlank()) {
      media.setPosterUrl(req.posterUrl());
      mediaRepo.save(media);
    }

    var existing = reviewRepo.findByUserIdAndMedia_Id(userId, media.getId()).orElse(null);
    Review rv = (existing != null) ? existing : new Review();
    rv.setUserId(userId);
    rv.setMedia(media);
    rv.setRating((short) req.rating());
    rv.setBody(req.body());
    var saved = reviewRepo.save(rv);

    return new ReviewDtos.View(
        saved.getId(),
        media.getId(),
        media.getTitle(),
        saved.getRating(),
        saved.getBody(),
        media.getKind(),
        media.getYear(),
        media.getPosterUrl()
    );
  }

  @GetMapping("/me")
  public List<ReviewDtos.View> myReviews(Authentication auth) {
    UUID userId = UUID.fromString(auth.getName());
    return reviewRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
        .map(rv -> new ReviewDtos.View(
            rv.getId(),
            rv.getMedia().getId(),
            rv.getMedia().getTitle(),
            rv.getRating(),
            rv.getBody(),
            rv.getMedia().getKind(),
            rv.getMedia().getYear(),
            rv.getMedia().getPosterUrl()))
        .toList();
  }

  private MediaItem createBare(ReviewDtos.Upsert req) {
    MediaItem mi = new MediaItem();
    mi.setKind(req.kind());
    mi.setTitle(req.title());
    mi.setYear(req.year());
    mi.setPosterUrl(req.posterUrl()); // <— capture if provided
    return mediaRepo.save(mi);
  }

  @PostMapping("/_ping")
  public String ping(org.springframework.security.core.Authentication a) {
    return "ok " + a.getName();
  }
}
