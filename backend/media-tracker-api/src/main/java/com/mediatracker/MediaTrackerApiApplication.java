package com.mediatracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan("com.mediatracker.config")
public class MediaTrackerApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediaTrackerApiApplication.class, args);
    }
}