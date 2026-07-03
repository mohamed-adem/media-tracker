package com.mediatracker.library;

import com.mediatracker.library.dto.LibraryDtos;
import com.mediatracker.media.MediaItemService;
import com.mediatracker.media.Review;
import com.mediatracker.media.ReviewRepository;
import com.mediatracker.media.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/library")
public class LibraryController {
    private final LibraryEntryRepository entries;
    private final ReviewRepository reviews;
    private final MediaItemService mediaItems;
    private final LibraryEntryService library;
    private final ReviewService reviewService;

    public LibraryController(
        LibraryEntryRepository entries,
        ReviewRepository reviews,
        MediaItemService mediaItems,
        LibraryEntryService library,
        ReviewService reviewService
    ) {
        this.entries = entries;
        this.reviews = reviews;
        this.mediaItems = mediaItems;
        this.library = library;
        this.reviewService = reviewService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public java.util.List<LibraryDtos.View> mine(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Map<UUID, Review> reviewByMediaId = reviews.findByUserIdOrderByUpdatedAtDesc(userId).stream()
            .collect(Collectors.toMap(rv -> rv.getMedia().getId(), Function.identity()));
        return entries.findByUserIdOrderByUpdatedAtDesc(userId).stream()
            .map(entry -> library.toView(entry, reviewByMediaId.get(entry.getMedia().getId())))
            .toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<LibraryDtos.View> create(
        @Valid @RequestBody LibraryDtos.Create request,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        var media = mediaItems.resolve(
            request.kind(), request.externalId(), request.title(), request.year(), request.posterUrl()
        );
        var entry = library.create(userId, media, request);
        Review review = request.rating() == null
            ? null
            : reviewService.upsert(userId, media, request.rating(), request.reviewBody());
        return ResponseEntity
            .created(URI.create("/api/library/" + entry.getId()))
            .body(library.toView(entry, review));
    }

    @PatchMapping("/{entryId}")
    @Transactional
    public LibraryDtos.View update(
        @PathVariable UUID entryId,
        @Valid @RequestBody LibraryDtos.Update request,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        LibraryEntry updated = library.update(userId, entryId, request);
        Review review = reviews.findByUserIdAndMedia_Id(userId, updated.getMedia().getId()).orElse(null);
        return library.toView(updated, review);
    }

    @PutMapping("/{entryId}/review")
    @Transactional
    public LibraryDtos.View updateReview(
        @PathVariable UUID entryId,
        @Valid @RequestBody LibraryDtos.ReviewUpdate request,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        LibraryEntry entry = entries.findByIdAndUserId(entryId, userId)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Library entry not found"
            ));
        Review review = reviewService.upsert(userId, entry.getMedia(), request.rating(), request.body());
        LibraryEntry completed = library.complete(entry);
        return library.toView(completed, review);
    }

    @DeleteMapping("/{entryId}")
    @Transactional
    public ResponseEntity<Void> delete(
        @PathVariable UUID entryId,
        Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        LibraryEntry entry = entries.findByIdAndUserId(entryId, userId)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Library entry not found"
            ));
        reviews.deleteByUserIdAndMedia_Id(userId, entry.getMedia().getId());
        entries.delete(entry);
        return ResponseEntity.noContent().build();
    }
}
