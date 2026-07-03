package com.mediatracker.library;

import com.mediatracker.library.dto.LibraryDtos;
import com.mediatracker.media.MediaItem;
import com.mediatracker.media.Review;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LibraryEntryService {
    private final LibraryEntryRepository entries;

    public LibraryEntryService(LibraryEntryRepository entries) {
        this.entries = entries;
    }

    public LibraryEntry create(UUID userId, MediaItem media, LibraryDtos.Create request) {
        if (entries.findByUserIdAndMedia_Id(userId, media.getId()).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "This media is already in your library");
        }

        LibraryEntry entry = new LibraryEntry();
        entry.setUserId(userId);
        entry.setMedia(media);
        entry.setStatus(request.rating() != null
            ? LibraryStatus.COMPLETED
            : request.status() == null ? LibraryStatus.PLANNED : request.status());
        entry.setProgressCurrent(request.progressCurrent());
        entry.setProgressTotal(request.progressTotal());
        entry.setStartedAt(request.startedAt());
        entry.setCompletedAt(request.completedAt());
        entry.setPrivateEntry(Boolean.TRUE.equals(request.privateEntry()));
        applyLifecycleDates(entry);
        validateProgress(entry.getProgressCurrent(), entry.getProgressTotal());
        return entries.save(entry);
    }

    public LibraryEntry update(UUID userId, UUID entryId, LibraryDtos.Update request) {
        LibraryEntry entry = entries.findByIdAndUserId(entryId, userId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Library entry not found"));

        if (request.status() != null) entry.setStatus(request.status());
        if (request.progressCurrent() != null) entry.setProgressCurrent(request.progressCurrent());
        if (request.progressTotal() != null) entry.setProgressTotal(request.progressTotal());
        if (request.startedAt() != null) entry.setStartedAt(request.startedAt());
        if (request.completedAt() != null) entry.setCompletedAt(request.completedAt());
        if (request.privateEntry() != null) entry.setPrivateEntry(request.privateEntry());
        applyLifecycleDates(entry);
        validateProgress(entry.getProgressCurrent(), entry.getProgressTotal());
        return entries.save(entry);
    }

    public LibraryEntry ensureCompleted(UUID userId, MediaItem media) {
        LibraryEntry entry = entries.findByUserIdAndMedia_Id(userId, media.getId()).orElseGet(() -> {
            LibraryEntry created = new LibraryEntry();
            created.setUserId(userId);
            created.setMedia(media);
            return created;
        });
        return complete(entry);
    }

    public LibraryEntry complete(LibraryEntry entry) {
        entry.setStatus(LibraryStatus.COMPLETED);
        applyLifecycleDates(entry);
        return entries.save(entry);
    }

    public LibraryDtos.View toView(LibraryEntry entry, Review review) {
        MediaItem media = entry.getMedia();
        return new LibraryDtos.View(
            entry.getId(),
            media.getId(),
            media.getTitle(),
            media.getKind(),
            media.getYear(),
            media.getPosterUrl(),
            entry.getStatus(),
            entry.getProgressCurrent(),
            entry.getProgressTotal(),
            entry.getStartedAt(),
            entry.getCompletedAt(),
            entry.isPrivateEntry(),
            entry.getCreatedAt(),
            entry.getUpdatedAt(),
            review == null ? null : review.getRating(),
            review == null ? null : review.getBody(),
            review == null ? null : review.getUpdatedAt()
        );
    }

    private void applyLifecycleDates(LibraryEntry entry) {
        LocalDate today = LocalDate.now();
        if (entry.getStatus() == LibraryStatus.PLANNED) {
            entry.setStartedAt(null);
            entry.setCompletedAt(null);
            entry.setProgressCurrent(null);
            entry.setProgressTotal(null);
            return;
        }
        if ((entry.getStatus() == LibraryStatus.IN_PROGRESS
            || entry.getStatus() == LibraryStatus.COMPLETED)
            && entry.getStartedAt() == null) {
            entry.setStartedAt(today);
        }
        if (entry.getStatus() == LibraryStatus.COMPLETED && entry.getCompletedAt() == null) {
            entry.setCompletedAt(today);
            if (entry.getProgressTotal() != null) {
                entry.setProgressCurrent(entry.getProgressTotal());
            }
        } else if (entry.getStatus() != LibraryStatus.COMPLETED) {
            entry.setCompletedAt(null);
        }
    }

    private void validateProgress(BigDecimal current, BigDecimal total) {
        if (current != null && total != null && current.compareTo(total) > 0) {
            throw new IllegalArgumentException("Current progress cannot exceed total progress");
        }
    }
}
