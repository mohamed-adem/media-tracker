package com.mediatracker.library;

import com.mediatracker.media.MediaItem;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "library_entries",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_library_entry_user_media",
        columnNames = {"user_id", "media_id"}
    )
)
public class LibraryEntry {
    @Id
    @UuidGenerator
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false, columnDefinition = "uuid")
    private MediaItem media;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LibraryStatus status = LibraryStatus.PLANNED;

    @Column(name = "progress_current", precision = 10, scale = 1)
    private BigDecimal progressCurrent;

    @Column(name = "progress_total", precision = 10, scale = 1)
    private BigDecimal progressTotal;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "is_private", nullable = false)
    private boolean privateEntry;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public MediaItem getMedia() { return media; }
    public void setMedia(MediaItem media) { this.media = media; }
    public LibraryStatus getStatus() { return status; }
    public void setStatus(LibraryStatus status) { this.status = status; }
    public BigDecimal getProgressCurrent() { return progressCurrent; }
    public void setProgressCurrent(BigDecimal progressCurrent) { this.progressCurrent = progressCurrent; }
    public BigDecimal getProgressTotal() { return progressTotal; }
    public void setProgressTotal(BigDecimal progressTotal) { this.progressTotal = progressTotal; }
    public LocalDate getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDate startedAt) { this.startedAt = startedAt; }
    public LocalDate getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDate completedAt) { this.completedAt = completedAt; }
    public boolean isPrivateEntry() { return privateEntry; }
    public void setPrivateEntry(boolean privateEntry) { this.privateEntry = privateEntry; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
