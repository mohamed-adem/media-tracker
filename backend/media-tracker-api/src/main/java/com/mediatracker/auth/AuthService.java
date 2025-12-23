package com.mediatracker.auth;

import com.mediatracker.auth.dto.AuthResponse;
import com.mediatracker.auth.dto.LoginRequest;
import com.mediatracker.auth.dto.RegisterRequest;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, BCryptPasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest req) {
        users.findByEmail(req.email()).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });
        User u = new User();
        u.setEmail(req.email());
        u.setDisplayName(req.displayName());
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);

        var access = jwt.generateAccessToken(u);
        var refresh = jwt.generateRefreshToken(u);
        return new AuthResponse(access, refresh);
    }

    public AuthResponse login(LoginRequest req) {
        var u = users.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        var access = jwt.generateAccessToken(u);
        var refresh = jwt.generateRefreshToken(u);
        return new AuthResponse(access, refresh);
    }
}