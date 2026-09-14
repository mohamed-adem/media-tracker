package com.mediatracker.user;

import com.mediatracker.library.LibraryEntryRepository;
import com.mediatracker.media.Review;
import com.mediatracker.media.ReviewRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    private final UserRepository users;
    private final LibraryEntryRepository libraryEntries;
    private final ReviewRepository reviews;

    public UsersController(UserRepository users, LibraryEntryRepository libraryEntries, ReviewRepository reviews) {
        this.users = users;
        this.libraryEntries = libraryEntries;
        this.reviews = reviews;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        var u = users.findById(userId).orElseThrow();
        return userToMap(u);
    }

    public record UpdateProfileRequest(
        @Size(min = 1, max = 100) String displayName,
        @Size(max = 500) String bio
    ) {}

    public record PublicEntry(
        UUID mediaId,
        String title,
        String kind,
        Integer year,
        String posterUrl,
        String status,
        java.math.BigDecimal rating,
        String reviewBody,
        java.time.OffsetDateTime reviewedAt
    ) {}

    public record PublicProfile(
        UUID id,
        String displayName,
        String bio,
        java.time.OffsetDateTime createdAt,
        List<PublicEntry> entries
    ) {}

    @GetMapping("/{userId}/profile")
    @Transactional(readOnly = true)
    public PublicProfile publicProfile(@PathVariable UUID userId) {
        User user = users.findById(userId)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Profile not found"
            ));
        Map<UUID, Review> reviewByMediaId = reviews.findByUserIdOrderByUpdatedAtDesc(userId).stream()
            .collect(java.util.stream.Collectors.toMap(review -> review.getMedia().getId(), review -> review));
        List<PublicEntry> entries = libraryEntries
            .findByUserIdAndPrivateEntryFalseOrderByUpdatedAtDesc(userId)
            .stream()
            .map(entry -> {
                Review review = reviewByMediaId.get(entry.getMedia().getId());
                return new PublicEntry(
                    entry.getMedia().getId(),
                    entry.getMedia().getTitle(),
                    entry.getMedia().getKind().name(),
                    entry.getMedia().getYear(),
                    entry.getMedia().getPosterUrl(),
                    entry.getStatus().name(),
                    review == null ? null : review.getRating(),
                    review == null ? null : review.getBody(),
                    review == null ? null : review.getUpdatedAt()
                );
            })
            .toList();
        return new PublicProfile(user.getId(), user.getDisplayName(), user.getBio(), user.getCreatedAt(), entries);
    }

    @PatchMapping("/me")
    @Transactional
    public Map<String, Object> updateMe(@Valid @RequestBody UpdateProfileRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User u = users.findById(userId).orElseThrow();
        if (req.displayName() != null && !req.displayName().isBlank()) {
            u.setDisplayName(req.displayName());
        }
        if (req.bio() != null) {
            u.setBio(req.bio());
        }
        users.save(u);
        return userToMap(u);
    }

    private Map<String, Object> userToMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("displayName", u.getDisplayName());
        m.put("role", u.getRole().name());
        m.put("bio", u.getBio() != null ? u.getBio() : "");
        m.put("createdAt", u.getCreatedAt().toString());
        return m;
    }
}
