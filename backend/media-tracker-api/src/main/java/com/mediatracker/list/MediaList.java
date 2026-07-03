package com.mediatracker.list;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "media_lists",
    uniqueConstraints = @UniqueConstraint(name = "uq_media_lists_user_name", columnNames = {"user_id", "name"})
)
public class MediaList {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "is_private", nullable = false)
    private boolean privateList = true;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void createTimestamps() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() { updatedAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isPrivateList() { return privateList; }
    public void setPrivateList(boolean privateList) { this.privateList = privateList; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
