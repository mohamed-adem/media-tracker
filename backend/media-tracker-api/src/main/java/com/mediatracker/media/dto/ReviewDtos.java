package com.mediatracker.media.dto;

import com.mediatracker.media.MediaKind;
import jakarta.validation.constraints.*;

import java.util.UUID;

public class ReviewDtos {

  public record Upsert(
      @NotNull MediaKind kind,
      String externalId,
      @NotBlank String title,
      Integer year,
      @Min(1) @Max(5) int rating,
      @Size(max = 4000) String body,
      String posterUrl 
  ) {}

  public record View(
      UUID id,
      UUID mediaId,
      String title,
      int rating,
      String body,
      MediaKind kind,
      Integer year,
      String posterUrl
  ) {}
}
