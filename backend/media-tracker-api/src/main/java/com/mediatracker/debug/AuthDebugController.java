package com.mediatracker.debug;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
public class AuthDebugController {
  record View(Object principal, List<String> authorities, boolean authenticated) {}

  @GetMapping("/auth")
  public View auth(Authentication auth) {
    if (auth == null) return new View(null, List.of(), false);
    var roles = auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
    return new View(auth.getPrincipal(), roles, auth.isAuthenticated());
  }
}