package com.mediatracker.user;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    private final UserRepository users;
    public UsersController(UserRepository users) { this.users = users; }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        var u = users.findById(userId).orElseThrow();
        return Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "displayName", u.getDisplayName(),
                "role", u.getRole().name()
        );
    }
}