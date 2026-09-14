package com.mediatracker.user;

import com.mediatracker.friend.Friend;
import com.mediatracker.friend.FriendRepository;
import com.mediatracker.friend.FriendStatus;
import com.mediatracker.library.LibraryEntry;
import com.mediatracker.library.LibraryEntryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserSearchController {

    private final UserRepository users;
    private final FriendRepository friends;
    private final LibraryEntryRepository library;

    public UserSearchController(UserRepository users, FriendRepository friends, LibraryEntryRepository library) {
        this.users = users;
        this.friends = friends;
        this.library = library;
    }

    public record UserSummary(UUID id, String displayName, String email) {}

    public record SuggestedUser(UUID id, String displayName, String bio, int sharedMediaCount, String reason) {}

    @GetMapping("/search")
    public List<UserSummary> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank()) return List.of();

        return users.findTop20ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(q, q)
                .stream()
                .map(u -> new UserSummary(u.getId(), u.getDisplayName(), u.getEmail()))
                .toList();
    }

    @GetMapping("/suggestions")
    public List<SuggestedUser> suggestions(
            @RequestParam(defaultValue = "6") int limit,
            Authentication auth
    ) {
        UUID me = UUID.fromString(auth.getName());
        int safeLimit = Math.max(1, Math.min(12, limit));
        Set<UUID> excluded = new HashSet<>();
        excluded.add(me);
        excluded.addAll(friends.findByIdUserId(me).stream()
                .map(friend -> friend.getId().getFriendId())
                .collect(Collectors.toSet()));
        excluded.addAll(friends.findByIdFriendIdAndStatus(me, FriendStatus.PENDING).stream()
                .map(friend -> friend.getId().getUserId())
                .collect(Collectors.toSet()));

        Set<UUID> myMedia = library.findByUserIdOrderByUpdatedAtDesc(me).stream()
                .map(entry -> entry.getMedia().getId())
                .collect(Collectors.toSet());
        if (myMedia.isEmpty()) return List.of();

        Map<UUID, Integer> overlap = new HashMap<>();
        for (LibraryEntry entry : library.findByMedia_IdInAndPrivateEntryFalse(myMedia)) {
            UUID candidate = entry.getUserId();
            if (!excluded.contains(candidate)) {
                overlap.merge(candidate, 1, Integer::sum);
            }
        }

        Map<UUID, User> usersById = users.findAllById(overlap.keySet()).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
        return overlap.entrySet().stream()
                .filter(entry -> usersById.containsKey(entry.getKey()))
                .sorted(Map.Entry.<UUID, Integer>comparingByValue().reversed())
                .limit(safeLimit)
                .map(entry -> {
                    User user = usersById.get(entry.getKey());
                    int count = entry.getValue();
                    return new SuggestedUser(user.getId(), user.getDisplayName(), user.getBio(), count,
                            count == 1 ? "Shares a title in your library" : "Shares " + count + " titles in your library");
                })
                .toList();
    }
}
