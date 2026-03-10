package com.mediatracker.user;

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
    public UsersController(UserRepository users) { this.users = users; }

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

    @GetMapping("/search")
    public List<Map<String, Object>> search(@RequestParam("q") String q, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return users.findAll().stream()
            .filter(u -> !u.getId().equals(userId))
            .filter(u ->
                u.getDisplayName().toLowerCase().contains(q.toLowerCase()) ||
                u.getEmail().toLowerCase().contains(q.toLowerCase()))
            .limit(20)
            .map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "displayName", u.getDisplayName(),
                "email", u.getEmail()))
            .toList();
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
