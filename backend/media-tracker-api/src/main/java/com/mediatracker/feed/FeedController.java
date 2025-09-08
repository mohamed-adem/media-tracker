package com.mediatracker.feed;

import com.mediatracker.friend.Friend;
import com.mediatracker.friend.FriendRepository;
import com.mediatracker.media.Review;
import com.mediatracker.media.ReviewRepository;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FriendRepository friends;
    private final ReviewRepository reviews;
    private final UserRepository users;

    public FeedController(FriendRepository friends, ReviewRepository reviews, UserRepository users) {
        this.friends = friends;
        this.reviews = reviews;
        this.users = users;
    }

    public record FeedItem(
        UUID reviewId,
        UUID authorId,
        String author,
        String title,
        Integer rating,          
        String body,
        OffsetDateTime createdAt,
        String posterUrl        
    ) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<FeedItem> feed(org.springframework.security.core.Authentication auth) {
        UUID me = UUID.fromString(auth.getName());

        List<Friend> rows = friends.findByIdUserIdOrderByCreatedAtDesc(me);
        if (rows.isEmpty()) return List.of();

        List<UUID> friendIds = rows.stream()
            .map(f -> f.getId().getFriendId())
            .toList();

        List<Review> latest = reviews.findTop50ByUserIdInOrderByCreatedAtDesc(friendIds);
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
            Integer ratingInt = (r.getRating() == null) ? null : r.getRating().intValue();
            out.add(new FeedItem(
                r.getId(),
                r.getUserId(),
                nameById.getOrDefault(r.getUserId(), "Unknown"),
                r.getMedia().getTitle(),
                ratingInt,
                r.getBody(),
                r.getCreatedAt(),
                r.getMedia().getPosterUrl()   
            ));
        }
        return out;
    }
}