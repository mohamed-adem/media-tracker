package com.mediatracker.media;

import org.springframework.stereotype.Service;

@Service
public class MediaItemService {
    private final MediaItemRepository mediaItems;

    public MediaItemService(MediaItemRepository mediaItems) {
        this.mediaItems = mediaItems;
    }

    public MediaItem resolve(
        MediaKind kind,
        String externalId,
        String title,
        Integer year,
        String posterUrl
    ) {
        MediaItem media = externalId != null && !externalId.isBlank()
            ? mediaItems.findByKindAndExternalId(kind, externalId)
                .orElseGet(() -> create(kind, externalId, title, year, posterUrl))
            : create(kind, null, title, year, posterUrl);

        boolean changed = false;
        if (posterUrl != null && !posterUrl.isBlank()
            && !posterUrl.equals(media.getPosterUrl())) {
            media.setPosterUrl(posterUrl);
            changed = true;
        }
        if (media.getYear() == null && year != null) {
            media.setYear(year);
            changed = true;
        }
        return changed ? mediaItems.save(media) : media;
    }

    private MediaItem create(
        MediaKind kind,
        String externalId,
        String title,
        Integer year,
        String posterUrl
    ) {
        MediaItem media = new MediaItem();
        media.setKind(kind);
        media.setExternalId(externalId);
        media.setTitle(title.trim());
        media.setYear(year);
        media.setPosterUrl(posterUrl);
        return mediaItems.save(media);
    }
}
