package com.mediatracker.media;

import com.mediatracker.friend.FriendRepository;
import com.mediatracker.friend.FriendStatus;
import com.mediatracker.library.LibraryEntry;
import com.mediatracker.library.LibraryEntryRepository;
import com.mediatracker.library.LibraryEntryService;
import com.mediatracker.library.dto.LibraryDtos;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class MediaDetailController {
    private final MediaItemRepository mediaItems;
    private final LibraryEntryRepository entries;
    private final LibraryEntryService library;
    private final ReviewRepository reviews;
    private final FriendRepository friends;
    private final UserRepository users;

    public MediaDetailController(
        MediaItemRepository mediaItems,
        LibraryEntryRepository entries,
        LibraryEntryService library,
        ReviewRepository reviews,
        FriendRepository friends,
        UserRepository users
    ) {
        this.mediaItems = mediaItems;
        this.entries = entries;
        this.library = library;
        this.reviews = reviews;
        this.friends = friends;
        this.users = users;
    }

    public record FriendReview(
        UUID reviewId,
        UUID authorId,
        String author,
        BigDecimal rating,
        String body,
        OffsetDateTime updatedAt
    ) {}

    public record View(
        UUID mediaId,
        MediaKind kind,
        String externalId,
        String title,
        Integer year,
        String posterUrl,
        LibraryDtos.View libraryEntry,
        List<FriendReview> friendReviews
    ) {}

    @GetMapping("/{mediaId}")
    @Transactional(readOnly = true)
    public View detail(@PathVariable UUID mediaId, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        MediaItem media = mediaItems.findById(mediaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        LibraryEntry ownEntry = entries.findByUserIdAndMedia_Id(userId, mediaId).orElse(null);
        Review ownReview = ownEntry == null
            ? null
            : reviews.findByUserIdAndMedia_Id(userId, mediaId).orElse(null);

        List<UUID> friendIds = friends
            .findByIdUserIdAndStatusOrderByCreatedAtDesc(userId, FriendStatus.ACCEPTED)
            .stream()
            .map(friend -> friend.getId().getFriendId())
            .toList();

        List<FriendReview> visibleReviews = friendIds.isEmpty()
            ? List.of()
            : friendReviews(mediaId, friendIds);

        return new View(
            media.getId(),
            media.getKind(),
            media.getExternalId(),
            media.getTitle(),
            media.getYear(),
            media.getPosterUrl(),
            ownEntry == null ? null : library.toView(ownEntry, ownReview),
            visibleReviews
        );
    }

    private List<FriendReview> friendReviews(UUID mediaId, List<UUID> friendIds) {
        Set<UUID> visibleUserIds = entries
            .findByUserIdInAndMedia_IdAndPrivateEntryFalse(friendIds, mediaId)
            .stream()
            .map(LibraryEntry::getUserId)
            .collect(Collectors.toSet());
        if (visibleUserIds.isEmpty()) return List.of();

        Map<UUID, String> names = new HashMap<>();
        for (User user : users.findAllById(visibleUserIds)) {
            names.put(user.getId(), user.getDisplayName());
        }

        return reviews.findByUserIdInAndMedia_IdOrderByUpdatedAtDesc(visibleUserIds, mediaId)
            .stream()
            .map(review -> new FriendReview(
                review.getId(),
                review.getUserId(),
                names.getOrDefault(review.getUserId(), "Unknown"),
                review.getRating(),
                review.getBody(),
                review.getUpdatedAt()
            ))
            .toList();
    }
}
