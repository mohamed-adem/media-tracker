package com.mediatracker.list;

import com.mediatracker.media.MediaItem;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "media_list_items",
    uniqueConstraints = @UniqueConstraint(name = "uq_media_list_items_list_media", columnNames = {"list_id", "media_id"})
)
public class MediaListItem {
    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private MediaList list;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private MediaItem media;

    @Column(nullable = false)
    private int position;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void createTimestamp() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public MediaList getList() { return list; }
    public void setList(MediaList list) { this.list = list; }
    public MediaItem getMedia() { return media; }
    public void setMedia(MediaItem media) { this.media = media; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
