package com.mediatracker.recommendation;

import com.mediatracker.friend.FriendRepository;
import com.mediatracker.friend.FriendStatus;
import com.mediatracker.library.LibraryEntryRepository;
import com.mediatracker.media.MediaItem;
import com.mediatracker.media.MediaKind;
import com.mediatracker.media.Review;
import com.mediatracker.media.ReviewRepository;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final FriendRepository friends;
    private final LibraryEntryRepository entries;
    private final ReviewRepository reviews;
    private final UserRepository users;

    public RecommendationController(
        FriendRepository friends,
        LibraryEntryRepository entries,
        ReviewRepository reviews,
        UserRepository users
    ) {
        this.friends = friends;
        this.entries = entries;
        this.reviews = reviews;
        this.users = users;
    }

    public record View(
        UUID mediaId,
        MediaKind kind,
        String externalId,
        String title,
        Integer year,
        String posterUrl,
        double score,
        String reason
    ) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<View> recommendations(
        @RequestParam(defaultValue = "8") int limit,
        Authentication auth
    ) {
        UUID userId = UUID.fromString(auth.getName());
        int safeLimit = Math.max(1, Math.min(20, limit));
        Set<UUID> friendIds = friends.findByIdUserIdAndStatus(userId, FriendStatus.ACCEPTED).stream()
            .map(friend -> friend.getId().getFriendId())
            .collect(Collectors.toSet());
        if (friendIds.isEmpty()) return List.of();

        Set<UUID> ownedMediaIds = entries.findByUserIdOrderByUpdatedAtDesc(userId).stream()
            .map(entry -> entry.getMedia().getId())
            .collect(Collectors.toSet());
        Set<MediaKind> preferredKinds = reviews.findByUserIdOrderByUpdatedAtDesc(userId).stream()
            .filter(review -> review.getRating().compareTo(new BigDecimal("4.0")) >= 0)
            .map(review -> review.getMedia().getKind())
            .collect(Collectors.toSet());
        Set<UUID> publicFriendMedia = entries.findByUserIdInAndPrivateEntryFalse(friendIds).stream()
            .map(entry -> entry.getMedia().getId())
            .collect(Collectors.toSet());

        Map<UUID, String> names = users.findAllById(friendIds).stream()
            .collect(Collectors.toMap(User::getId, User::getDisplayName));
        Map<UUID, Candidate> candidates = new HashMap<>();
        for (Review review : reviews.findTop50ByUserIdInOrderByUpdatedAtDesc(friendIds)) {
            MediaItem media = review.getMedia();
            if (review.getRating().compareTo(new BigDecimal("4.0")) < 0
                || ownedMediaIds.contains(media.getId())
                || !publicFriendMedia.contains(media.getId())) {
                continue;
            }
            Candidate candidate = candidates.computeIfAbsent(media.getId(), ignored -> new Candidate(media));
            candidate.ratings.add(review.getRating().doubleValue());
            candidate.friendNames.add(names.getOrDefault(review.getUserId(), "A friend"));
        }

        return candidates.values().stream()
            .map(candidate -> candidate.toView(preferredKinds.contains(candidate.media.getKind())))
            .sorted(Comparator.comparingDouble(View::score).reversed().thenComparing(View::title))
            .limit(safeLimit)
            .toList();
    }

    private static final class Candidate {
        private final MediaItem media;
        private final List<Double> ratings = new ArrayList<>();
        private final Set<String> friendNames = new LinkedHashSet<>();

        private Candidate(MediaItem media) { this.media = media; }

        private View toView(boolean preferredKind) {
            double average = ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double score = average + Math.min(2, ratings.size() - 1) * 0.4 + (preferredKind ? 0.6 : 0);
            String people = friendNames.stream().limit(2).collect(Collectors.joining(" and "));
            String reason = people + (ratings.size() == 1 ? " rated it " : " rated it an average of ")
                + String.format(Locale.US, "%.1f", average);
            if (preferredKind) reason += " and it matches a category you rate highly";
            return new View(
                media.getId(), media.getKind(), media.getExternalId(), media.getTitle(), media.getYear(),
                media.getPosterUrl(), Math.round(score * 10.0) / 10.0, reason
            );
        }
    }
}
