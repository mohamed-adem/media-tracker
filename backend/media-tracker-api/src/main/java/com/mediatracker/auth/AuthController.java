package com.mediatracker.auth;

import com.mediatracker.auth.dto.AuthResponse;
import com.mediatracker.auth.dto.LoginRequest;
import com.mediatracker.auth.dto.RegisterRequest;
import com.mediatracker.friend.FriendService;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final UserRepository userRepository;
    private final FriendService friendService;

    @Value("${app.seed.mohamedEmail}")
    private String moEmail;

    public AuthController(AuthService auth,
                          UserRepository userRepository,
                          FriendService friendService) {
        this.auth = auth;
        this.userRepository = userRepository;
        this.friendService = friendService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = auth.register(req);

        // Auto-friend with seed user — skip gracefully if seed user doesn't exist
        userRepository.findByEmailIgnoreCase(moEmail).ifPresent(mo -> {
            userRepository.findByEmailIgnoreCase(req.email()).ifPresent(newUser -> {
                friendService.linkBothAccepted(newUser.getId(), mo.getId());
            });
        });

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(auth.login(req));
    }
}
