package com.mediatracker.notification;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    public void friendRequest(UUID recipientId, UUID actorId, String actorName) {
        create(recipientId, actorId, NotificationType.FRIEND_REQUEST,
            actorName + " sent you a friend request", "/friends");
    }

    public void friendAccepted(UUID recipientId, UUID actorId, String actorName) {
        create(recipientId, actorId, NotificationType.FRIEND_ACCEPTED,
            actorName + " accepted your friend request", "/friends");
    }

    private void create(UUID userId, UUID actorId, NotificationType type, String message, String targetPath) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setActorId(actorId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setTargetPath(targetPath);
        notifications.save(notification);
    }
}
