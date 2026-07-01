package com.mediatracker.auth;

import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final UserRepository userRepo;

  public JwtAuthFilter(JwtService jwtService, UserRepository userRepo) {
    this.jwtService = jwtService;
    this.userRepo = userRepo;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    String header = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (header == null || !header.startsWith("Bearer ")) {
      chain.doFilter(req, res);
      return;
    }

    String token = header.substring(7);
    Claims claims;
    try {
      claims = jwtService.parseAccessToken(token);
    } catch (RuntimeException ex) {
      res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired access token");
      return;
    }

    String sub = claims.getSubject();
    if (sub == null) {
      res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid access token subject");
      return;
    }

    UUID userId;
    try {
      userId = UUID.fromString(sub);
    } catch (IllegalArgumentException ex) {
      res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid access token subject");
      return;
    }

    User u = userRepo.findById(userId).orElse(null);
    if (u == null) {
      res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User no longer exists");
      return;
    }

    var auth = new UsernamePasswordAuthenticationToken(
        userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
    );
    SecurityContextHolder.getContext().setAuthentication(auth);

    chain.doFilter(req, res);
  }
}
