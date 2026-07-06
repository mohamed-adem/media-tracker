package com.mediatracker.feed;

import com.mediatracker.friend.Friend;
import com.mediatracker.friend.FriendRepository;
import com.mediatracker.library.LibraryEntryRepository;
import com.mediatracker.media.Review;
import com.mediatracker.media.ReviewRepository;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FriendRepository friends;
    private final LibraryEntryRepository libraryEntries;
    private final ReviewRepository reviews;
    private final UserRepository users;

    public FeedController(
        FriendRepository friends,
        ReviewRepository reviews,
        UserRepository users,
        LibraryEntryRepository libraryEntries
    ) {
        this.friends = friends;
        this.reviews = reviews;
        this.users = users;
        this.libraryEntries = libraryEntries;
    }

    public record FeedItem(
        UUID reviewId,
        UUID mediaId,
        UUID authorId,
        String author,
        String title,
        BigDecimal rating,
        String body,
        OffsetDateTime createdAt,
        String posterUrl        
    ) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<FeedItem> feed(org.springframework.security.core.Authentication auth) {
        UUID me = UUID.fromString(auth.getName());

        List<Friend> rows = friends.findByIdUserIdAndStatusOrderByCreatedAtDesc(
            me,
            com.mediatracker.friend.FriendStatus.ACCEPTED
        );
        if (rows.isEmpty()) return List.of();

        List<UUID> friendIds = rows.stream()
            .map(f -> f.getId().getFriendId())
            .toList();

        Set<String> visibleReviewKeys = libraryEntries
            .findByUserIdInAndPrivateEntryFalse(friendIds)
            .stream()
            .map(entry -> entry.getUserId() + ":" + entry.getMedia().getId())
            .collect(Collectors.toSet());

        List<Review> latest = reviews.findTop50ByUserIdInOrderByUpdatedAtDesc(friendIds).stream()
            .filter(review -> visibleReviewKeys.contains(
                review.getUserId() + ":" + review.getMedia().getId()
            ))
            .toList();
        if (latest.isEmpty()) return List.of();

        Set<UUID> authorIds = latest.stream()
            .map(Review::getUserId)
            .collect(Collectors.toSet());

        Map<UUID, String> nameById = new HashMap<>();
        if (!authorIds.isEmpty()) {
            for (User u : users.findAllById(authorIds)) {
                nameById.put(u.getId(), u.getDisplayName());
            }
        }

        List<FeedItem> out = new ArrayList<>(latest.size());
        for (Review r : latest) {
            out.add(new FeedItem(
                r.getId(),
                r.getMedia().getId(),
                r.getUserId(),
                nameById.getOrDefault(r.getUserId(), "Unknown"),
                r.getMedia().getTitle(),
                r.getRating(),
                r.getBody(),
                r.getUpdatedAt(),
                r.getMedia().getPosterUrl()   
            ));
        }
        return out;
    }
}
