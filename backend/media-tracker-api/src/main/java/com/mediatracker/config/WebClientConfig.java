package com.mediatracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import io.netty.channel.ChannelOption;

import java.time.Duration;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient tmdbClient(@Value("${mediatracker.tmdb.apiKey}") String bearer) {
        return baseBuilder()
                .baseUrl("https://api.themoviedb.org/3")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + bearer)
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                        .build())
                .build();
    }

    @Bean
    public WebClient rawgClient() {
        return baseBuilder()
                .baseUrl("https://api.rawg.io/api")
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                        .build())
                .build();
    }

    @Bean
    public WebClient openLibraryClient() {
        return baseBuilder()
                .baseUrl("https://openlibrary.org")
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                        .build())
                .build();
    }

    private WebClient.Builder baseBuilder() {
        HttpClient client = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 1_500)
            .responseTimeout(Duration.ofMillis(3_500));
        return WebClient.builder().clientConnector(new ReactorClientHttpConnector(client));
    }
}
