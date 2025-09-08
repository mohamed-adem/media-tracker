package com.mediatracker.auth;

import com.mediatracker.user.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expirationSeconds}")
    private long accessTtlSeconds;

    @Value("${app.jwt.refreshExpirationSeconds}")
    private long refreshTtlSeconds;

    private Key key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User u) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(u.getId().toString())
                .addClaims(Map.of(
                        "email", u.getEmail(),
                        "role",  u.getRole().name(),
                        "typ",   "access"
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User u) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(u.getId().toString())
                .addClaims(Map.of("typ", "refresh"))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshTtlSeconds)))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseAccessToken(String token) {
        Claims c = parse(token);
        String typ = c.get("typ", String.class);
        if (!"access".equals(typ)) throw new JwtException("Not an access token");
        return c;
    }

    public Claims parseRefreshToken(String token) {
        Claims c = parse(token);
        String typ = c.get("typ", String.class);
        if (!"refresh".equals(typ)) throw new JwtException("Not a refresh token");
        return c;
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}