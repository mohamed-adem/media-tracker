package com.mediatracker.auth;

import com.mediatracker.auth.dto.AuthResponse;
import com.mediatracker.auth.dto.LoginRequest;
import com.mediatracker.auth.dto.RegisterRequest;
import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

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
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        users.findByEmailIgnoreCase(email).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });
        User u = new User();
        u.setEmail(email);
        u.setDisplayName(req.displayName().trim());
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);

        var access = jwt.generateAccessToken(u);
        var refresh = jwt.generateRefreshToken(u);
        return new AuthResponse(access, refresh);
    }

    public AuthResponse login(LoginRequest req) {
        var u = users.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        var access = jwt.generateAccessToken(u);
        var refresh = jwt.generateRefreshToken(u);
        return new AuthResponse(access, refresh);
    }

    public AuthResponse refresh(String refreshToken) {
        var claims = jwt.parseRefreshToken(refreshToken);
        UUID userId;
        try {
            userId = UUID.fromString(claims.getSubject());
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        var user = users.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        return new AuthResponse(jwt.generateAccessToken(user), jwt.generateRefreshToken(user));
    }
}
