package com.mediatracker.list.dto;

import com.mediatracker.media.MediaKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class MediaListDtos {
    private MediaListDtos() {}

    public record Create(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 500) String description,
        Boolean privateList
    ) {}

    public record Update(
        @Size(min = 1, max = 80) String name,
        @Size(max = 500) String description,
        Boolean privateList
    ) {}

    public record AddItem(
        @NotNull MediaKind kind,
        String externalId,
        @NotBlank String title,
        Integer year,
        String posterUrl,
        @Size(max = 500) String note
    ) {}

    public record UpdateItem(
        @Size(max = 500) String note
    ) {}

    public record ReorderItems(
        @NotNull @Size(max = 200) List<@NotNull UUID> itemIds
    ) {}

    public record ItemView(
        UUID id,
        UUID mediaId,
        MediaKind kind,
        String externalId,
        String title,
        Integer year,
        String posterUrl,
        int position,
        String note,
        OffsetDateTime createdAt
    ) {}

    public record View(
        UUID id,
        UUID ownerId,
        String name,
        String description,
        boolean privateList,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<ItemView> items
    ) {}
}
