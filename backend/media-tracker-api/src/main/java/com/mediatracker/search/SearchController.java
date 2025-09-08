package com.mediatracker.search;

import com.mediatracker.config.ExternalApiProps;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ExternalSearchService svc;
    private final ExternalApiProps props;

    public SearchController(ExternalSearchService svc, ExternalApiProps props) {
        this.svc = svc;
        this.props = props;
    }

    @GetMapping
    public List<SearchItem> search(
            @RequestParam String q,
            @RequestParam(required = false) String kind,
            @RequestParam(defaultValue = "10") int limit
    ) {
        int lim = Math.min(20, Math.max(1, limit));
        String k = (kind == null || kind.isBlank()) ? "ALL" : kind.toUpperCase();

        return switch (k) {
            case "MOVIE" -> svc.searchMovies(q, lim);
            case "SHOW"  -> svc.searchShows(q, lim);
            case "GAME"  -> svc.searchGames(q, lim, props.getRawg().getApiKey());
            case "BOOK"  -> svc.searchBooks(q, lim);
            case "ALL" -> {
                List<SearchItem> out = new ArrayList<>();
                int each = Math.max(1, lim / 4);
                out.addAll(svc.searchMovies(q, each));
                out.addAll(svc.searchShows(q, each));
                out.addAll(svc.searchGames(q, each, props.getRawg().getApiKey()));
                out.addAll(svc.searchBooks(q, each));
                if (out.size() > lim) {
                    out = out.subList(0, lim);
                }
                yield out;
            }
            default -> svc.searchMovies(q, lim);
        };
    }
}