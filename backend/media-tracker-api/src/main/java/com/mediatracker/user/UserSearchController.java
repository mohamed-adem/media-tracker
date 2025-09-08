package com.mediatracker.user;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserSearchController {

    private final UserRepository users;

    public UserSearchController(UserRepository users) {
        this.users = users;
    }

    public record UserSummary(UUID id, String displayName, String email) {}

    @GetMapping("/search")
    public List<UserSummary> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank()) return List.of();

        return users.findTop20ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(q, q)
                .stream()
                .map(u -> new UserSummary(u.getId(), u.getDisplayName(), u.getEmail()))
                .toList();
    }
}