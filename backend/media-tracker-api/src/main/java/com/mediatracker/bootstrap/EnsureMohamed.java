package com.mediatracker.bootstrap;

import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import com.mediatracker.user.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EnsureMohamed {
  private final UserRepository users;
  private final PasswordEncoder encoder;

  @Value("${app.seed.mohamedEmail}")
  private String email;
  @Value("${app.seed.mohamedDisplayName}")
  private String displayName;
  @Value("${app.seed.mohamedPassword}")
  private String password;

  @Value("${app.seed.resetOnStart:true}")
  private boolean resetOnStart;

  public EnsureMohamed(UserRepository users, PasswordEncoder encoder) {
    this.users = users;
    this.encoder = encoder;
  }

  @PostConstruct
  @Transactional
  public void init() {
    System.out.println("EnsureMohamed: Starting seeder...");
    System.out.println("EnsureMohamed: Configured Email = " + email);
    System.out.println("EnsureMohamed: Configured DisplayName = " + displayName);
    System.out.println("EnsureMohamed: ResetOnStart = " + resetOnStart);

    users.findByEmailIgnoreCase(email).ifPresentOrElse(u -> {
      System.out.println("EnsureMohamed: User found. Updating...");
      if (resetOnStart) {
        System.out.println("EnsureMohamed: Resetting password.");
        u.setPasswordHash(encoder.encode(password));
      }
      if (!displayName.equals(u.getDisplayName())) {
        u.setDisplayName(displayName);
      }
      if (u.getRole() != Role.ADMIN) {
        u.setRole(Role.ADMIN);
      }
      users.save(u);
      System.out.println("EnsureMohamed: User updated successfully.");
    }, () -> {
      System.out.println("EnsureMohamed: User NOT found. Creating new...");
      User u = new User();
      u.setEmail(email);
      u.setDisplayName(displayName);
      u.setPasswordHash(encoder.encode(password));
      u.setRole(Role.ADMIN);
      users.save(u);
      System.out.println("EnsureMohamed: New user created successfully.");
    });
  }
}