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
    Claims claims = jwtService.parseAccessToken(token);

    String sub  = claims.getSubject();                
    String role = claims.get("role", String.class);    
    if (sub == null || role == null) { chain.doFilter(req, res); return; }

    UUID userId;
    try { userId = UUID.fromString(sub); } catch (Exception e) { chain.doFilter(req, res); return; }

    User u = userRepo.findById(userId).orElse(null);
    if (u == null) { chain.doFilter(req, res); return; }

    var auth = new UsernamePasswordAuthenticationToken(
        userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)) 
    );
    SecurityContextHolder.getContext().setAuthentication(auth);

    chain.doFilter(req, res);
  }
}