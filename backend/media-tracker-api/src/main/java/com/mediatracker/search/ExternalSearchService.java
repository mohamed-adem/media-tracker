package com.mediatracker.search;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;


@Service
public class ExternalSearchService {

    private final WebClient tmdb;
    private final WebClient rawg;
    private final WebClient openLibrary;

    public ExternalSearchService(WebClient tmdbClient,
                                 WebClient rawgClient,
                                 WebClient openLibraryClient) {
        this.tmdb = tmdbClient;
        this.rawg = rawgClient;
        this.openLibrary = openLibraryClient;
    }


    public List<SearchItem> searchMovies(String q, int limit) {
        if (q == null || q.isBlank()) return List.of();
        Map<?, ?> body = tmdb.get()
                .uri(uri -> uri.path("/search/movie")
                        .queryParam("query", q)
                        .queryParam("include_adult", "false")
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return mapTmdbMovieResults(body, limit);
    }


    public List<SearchItem> searchShows(String q, int limit) {
        if (q == null || q.isBlank()) return List.of();
        Map<?, ?> body = tmdb.get()
                .uri(uri -> uri.path("/search/tv")
                        .queryParam("query", q)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return mapTmdbTvResults(body, limit);
    }


    public List<SearchItem> searchGames(String q, int limit, String apiKey) {
        if (q == null || q.isBlank()) return List.of();
        Map<?, ?> body = rawg.get()
                .uri(uri -> uri.path("/games")
                        .queryParam("key", apiKey)
                        .queryParam("search", q)
                        .queryParam("page_size", clamp(limit, 1, 20))
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return mapRawgGameResults(body, limit);
    }


    public List<SearchItem> searchBooks(String q, int limit) {
        if (q == null || q.isBlank()) return List.of();
        Map<?, ?> body = openLibrary.get()
                .uri(uri -> uri.path("/search.json")
                        .queryParam("q", q)
                        .queryParam("limit", clamp(limit, 1, 20))
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return mapOpenLibraryResults(body, limit);
    }


    private List<SearchItem> mapTmdbMovieResults(Map<?, ?> body, int limit) {
        List<SearchItem> out = new ArrayList<>();
        List<Map<String, Object>> results = safeList(body, "results");
        for (Map<String, Object> r : results) {
            String id = String.valueOf(r.get("id"));
            String title = getString(r, "title");
            Integer year = parseYear(getString(r, "release_date"));
            String posterPath = getString(r, "poster_path");
            String posterUrl = (posterPath != null && !posterPath.isBlank())
                    ? "https://image.tmdb.org/t/p/w500" + posterPath
                    : null;

            out.add(new SearchItem("MOVIE", id, title, year, posterUrl));
            if (out.size() >= limit) break;
        }
        return out;
    }

    private List<SearchItem> mapTmdbTvResults(Map<?, ?> body, int limit) {
        List<SearchItem> out = new ArrayList<>();
        List<Map<String, Object>> results = safeList(body, "results");
        for (Map<String, Object> r : results) {
            String id = String.valueOf(r.get("id"));
            String name = getString(r, "name");
            Integer year = parseYear(getString(r, "first_air_date"));
            String posterPath = getString(r, "poster_path");
            String posterUrl = (posterPath != null && !posterPath.isBlank())
                    ? "https://image.tmdb.org/t/p/w500" + posterPath
                    : null;

            out.add(new SearchItem("SHOW", id, name, year, posterUrl));
            if (out.size() >= limit) break;
        }
        return out;
    }

    private List<SearchItem> mapRawgGameResults(Map<?, ?> body, int limit) {
        List<SearchItem> out = new ArrayList<>();
        List<Map<String, Object>> results = safeList(body, "results");
        for (Map<String, Object> r : results) {
            String id = String.valueOf(r.get("id"));
            String name = getString(r, "name");
            Integer year = parseYear(getString(r, "released"));
            String posterUrl = getString(r, "background_image");

            out.add(new SearchItem("GAME", id, name, year, posterUrl));
            if (out.size() >= limit) break;
        }
        return out;
    }

    private List<SearchItem> mapOpenLibraryResults(Map<?, ?> body, int limit) {
        List<SearchItem> out = new ArrayList<>();
        List<Map<String, Object>> docs = safeList(body, "docs");
        for (Map<String, Object> d : docs) {
            String key = getString(d, "key");
            if (key == null || key.isBlank()) continue;

            String title = getString(d, "title");
            Integer year = null;
            Object fp = d.get("first_publish_year");
            if (fp instanceof Number n) year = n.intValue();

            String posterUrl = null;
            Object cover = d.get("cover_i");
            if (cover instanceof Number n) {
                posterUrl = "https://covers.openlibrary.org/b/id/" + n.longValue() + "-M.jpg";
            }

            out.add(new SearchItem("BOOK", key, title, year, posterUrl));
            if (out.size() >= limit) break;
        }
        return out;
    }


    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeList(Map<?, ?> body, String key) {
        if (body == null) return List.of();
        Object raw = body.get(key);
        if (raw instanceof List<?>) {
            return (List<Map<String, Object>>) raw;
        }
        return List.of();
    }

    private String getString(Map<String, Object> map, String k) {
        Object val = map.get(k);
        return (val == null) ? null : String.valueOf(val);
    }

    private Integer parseYear(String yyyyMmDd) {
        try {
            if (yyyyMmDd == null || yyyyMmDd.isBlank()) return null;
            return LocalDate.parse(yyyyMmDd).getYear();
        } catch (Exception ignore) {
            return null;
        }
    }

    private int clamp(int n, int min, int max) {
        return Math.max(min, Math.min(max, n));
    }
}