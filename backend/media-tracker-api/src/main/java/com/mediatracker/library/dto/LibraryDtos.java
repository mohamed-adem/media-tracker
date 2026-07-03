package com.mediatracker.library.dto;

import com.mediatracker.library.LibraryStatus;
import com.mediatracker.media.MediaKind;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class LibraryDtos {
    private LibraryDtos() {}

    public record Create(
        @NotNull MediaKind kind,
        String externalId,
        @NotBlank String title,
        Integer year,
        String posterUrl,
        LibraryStatus status,
        @DecimalMin("0.0") @Digits(integer = 9, fraction = 1) BigDecimal progressCurrent,
        @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 9, fraction = 1) BigDecimal progressTotal,
        LocalDate startedAt,
        LocalDate completedAt,
        Boolean privateEntry,
        @DecimalMin("0.5") @DecimalMax("5.0") @Digits(integer = 1, fraction = 1) BigDecimal rating,
        @Size(max = 4000) String reviewBody
    ) {}

    public record Update(
        LibraryStatus status,
        @DecimalMin("0.0") @Digits(integer = 9, fraction = 1) BigDecimal progressCurrent,
        @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 9, fraction = 1) BigDecimal progressTotal,
        LocalDate startedAt,
        LocalDate completedAt,
        Boolean privateEntry
    ) {}

    public record ReviewUpdate(
        @NotNull @DecimalMin("0.5") @DecimalMax("5.0") @Digits(integer = 1, fraction = 1) BigDecimal rating,
        @Size(max = 4000) String body
    ) {}

    public record View(
        UUID id,
        UUID mediaId,
        String title,
        MediaKind kind,
        Integer year,
        String posterUrl,
        LibraryStatus status,
        BigDecimal progressCurrent,
        BigDecimal progressTotal,
        LocalDate startedAt,
        LocalDate completedAt,
        boolean privateEntry,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        BigDecimal rating,
        String reviewBody,
        OffsetDateTime reviewedAt
    ) {}
}
