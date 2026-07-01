package com.mediatracker.search;

import com.mediatracker.config.ExternalApiProps;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ExternalSearchService svc;
    private final ExternalApiProps props;
    private final Executor providerSearchExecutor;

    public SearchController(
        ExternalSearchService svc,
        ExternalApiProps props,
        @Qualifier("providerSearchExecutor") Executor providerSearchExecutor
    ) {
        this.svc = svc;
        this.props = props;
        this.providerSearchExecutor = providerSearchExecutor;
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
                int each = Math.max(1, (lim + 3) / 4);
                List<CompletableFuture<List<SearchItem>>> searches = List.of(
                    CompletableFuture.supplyAsync(() -> svc.searchMovies(q, each), providerSearchExecutor),
                    CompletableFuture.supplyAsync(() -> svc.searchShows(q, each), providerSearchExecutor),
                    CompletableFuture.supplyAsync(() -> svc.searchGames(q, each, props.getRawg().getApiKey()), providerSearchExecutor),
                    CompletableFuture.supplyAsync(() -> svc.searchBooks(q, each), providerSearchExecutor)
                );
                List<SearchItem> out = new ArrayList<>();
                searches.forEach(search -> out.addAll(search.join()));
                yield out.stream().limit(lim).toList();
            }
            default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported media kind");
        };
    }
}
