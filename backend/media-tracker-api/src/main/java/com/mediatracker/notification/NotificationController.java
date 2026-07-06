package com.mediatracker.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notifications;

    public NotificationController(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    public record View(
        UUID id,
        UUID actorId,
        NotificationType type,
        String message,
        String targetPath,
        OffsetDateTime readAt,
        OffsetDateTime createdAt
    ) {}

    public record Summary(long unreadCount, List<View> notifications) {}

    @GetMapping
    @Transactional(readOnly = true)
    public Summary list(Authentication auth) {
        UUID userId = me(auth);
        List<View> views = notifications.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::toView)
            .toList();
        return new Summary(notifications.countByUserIdAndReadAtIsNull(userId), views);
    }

    @PatchMapping("/{notificationId}/read")
    @Transactional
    public View markRead(@PathVariable UUID notificationId, Authentication auth) {
        Notification notification = notifications.findByIdAndUserId(notificationId, me(auth))
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));
        if (notification.getReadAt() == null) notification.setReadAt(OffsetDateTime.now());
        return toView(notifications.save(notification));
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        List<Notification> unread = notifications.findByUserIdAndReadAtIsNull(me(auth));
        OffsetDateTime now = OffsetDateTime.now();
        unread.forEach(notification -> notification.setReadAt(now));
        notifications.saveAll(unread);
        return ResponseEntity.noContent().build();
    }

    private View toView(Notification notification) {
        return new View(
            notification.getId(), notification.getActorId(), notification.getType(), notification.getMessage(),
            notification.getTargetPath(), notification.getReadAt(), notification.getCreatedAt()
        );
    }

    private UUID me(Authentication auth) { return UUID.fromString(auth.getName()); }
}
