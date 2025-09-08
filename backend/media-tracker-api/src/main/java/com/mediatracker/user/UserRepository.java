package com.mediatracker.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findTop20ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(
            String emailPart,
            String displayNamePart
    );
}