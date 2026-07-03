package com.mediatracker.media;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class ReviewService {
    private final ReviewRepository reviews;

    public ReviewService(ReviewRepository reviews) {
        this.reviews = reviews;
    }

    public Review upsert(UUID userId, MediaItem media, BigDecimal rating, String body) {
        if (rating.remainder(new BigDecimal("0.5")).compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("Rating must use half-star increments");
        }
        Review review = reviews.findByUserIdAndMedia_Id(userId, media.getId()).orElseGet(Review::new);
        review.setUserId(userId);
        review.setMedia(media);
        review.setRating(rating);
        review.setBody(body);
        return reviews.save(review);
    }
}
