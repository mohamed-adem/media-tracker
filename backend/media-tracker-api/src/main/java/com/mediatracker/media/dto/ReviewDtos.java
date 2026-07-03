package com.mediatracker.media.dto;

import com.mediatracker.media.MediaKind;
import jakarta.validation.constraints.*;

import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.UUID;

public class ReviewDtos {

  public record Upsert(
      @NotNull MediaKind kind,
      String externalId,
      @NotBlank String title,
      Integer year,
      @NotNull @DecimalMin("0.5") @DecimalMax("5.0") @Digits(integer = 1, fraction = 1) BigDecimal rating,
      @Size(max = 4000) String body,
      String posterUrl
  ) {}

  public record View(
      UUID id,
      UUID mediaId,
      String title,
      BigDecimal rating,
      String body,
      MediaKind kind,
      Integer year,
      String posterUrl,
      OffsetDateTime createdAt
  ) {}
}
