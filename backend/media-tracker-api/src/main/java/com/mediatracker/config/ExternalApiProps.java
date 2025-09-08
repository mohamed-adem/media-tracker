package com.mediatracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mediatracker")
public class ExternalApiProps {

    private final Tmdb tmdb = new Tmdb();
    private final Rawg rawg = new Rawg();
    private final GoogleBooks googleBooks = new GoogleBooks();

    public Tmdb getTmdb() { return tmdb; }
    public Rawg getRawg() { return rawg; }
    public GoogleBooks getGoogleBooks() { return googleBooks; }

    public static class Tmdb {
        private String apiKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }

    public static class Rawg {
        private String apiKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }

    public static class GoogleBooks {
        private String apiKey;
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    }
}