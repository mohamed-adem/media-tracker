package com.mediatracker.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class MeController {
    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication auth) {
        // principal is the UUID set in JwtAuthFilter
        return Map.of("userId", auth.getPrincipal());
    }
}
