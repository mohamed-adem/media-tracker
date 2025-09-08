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

        User mo = userRepository.findByEmailIgnoreCase(moEmail)
            .orElseThrow(() -> new IllegalStateException("Seed user not found: " + moEmail));

        User newUser = userRepository.findByEmailIgnoreCase(req.email())
            .orElseThrow(() -> new IllegalStateException("New user not found after register"));

        friendService.linkBoth(newUser.getId(), mo.getId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(auth.login(req));
    }
}