package com.mediatracker.friend;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "friends")
public class Friend {
    @EmbeddedId
    private FriendId id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendStatus status = FriendStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public FriendId getId() { return id; }
    public void setId(FriendId id) { this.id = id; }

    public FriendStatus getStatus() { return status; }
    public void setStatus(FriendStatus status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}