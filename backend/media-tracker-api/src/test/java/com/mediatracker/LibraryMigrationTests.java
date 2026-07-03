package com.mediatracker;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;
import java.util.Objects;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LibraryMigrationTests {

    @Test
    void v11BackfillsExistingReviewsAsCompletedLibraryEntries() throws Exception {
        String url = requiredEnvironment("SPRING_DATASOURCE_URL");
        String username = requiredEnvironment("SPRING_DATASOURCE_USERNAME");
        String password = Objects.requireNonNullElse(System.getenv("SPRING_DATASOURCE_PASSWORD"), "");
        String database = "migration_" + UUID.randomUUID().toString().replace("-", "");
        String adminUrl = databaseUrl(url, "postgres");
        String migrationUrl = databaseUrl(url, database);

        try {
            try (var connection = DriverManager.getConnection(adminUrl, username, password);
                 var statement = connection.createStatement()) {
                statement.execute("CREATE DATABASE " + database);
            }
            migrateTo(migrationUrl, username, password, "10");

            UUID userId = UUID.randomUUID();
            UUID mediaId = UUID.randomUUID();
            UUID reviewId = UUID.randomUUID();
            try (var connection = DriverManager.getConnection(migrationUrl, username, password);
                 var statement = connection.createStatement()) {
                statement.executeUpdate("""
                    INSERT INTO users (id, email, password_hash, display_name, role)
                    VALUES ('%s', 'migration@example.com', 'hash', 'Migration User', 'USER')
                    """.formatted(userId));
                statement.executeUpdate("""
                    INSERT INTO media_items (id, kind, external_id, title, year)
                    VALUES ('%s', 'BOOK', 'migration-book', 'Migration Book', 2025)
                    """.formatted(mediaId));
                statement.executeUpdate("""
                    INSERT INTO reviews (id, user_id, media_id, rating, body, created_at)
                    VALUES ('%s', '%s', '%s', 4.5, 'Existing review', '2025-08-12T12:00:00Z')
                    """.formatted(reviewId, userId, mediaId));
            }

            migrateTo(migrationUrl, username, password, "11");

            try (var connection = DriverManager.getConnection(migrationUrl, username, password);
                 var statement = connection.createStatement()) {
                try (var result = statement.executeQuery("""
                    SELECT status, completed_at, created_at, updated_at
                    FROM library_entries
                    WHERE user_id = '%s' AND media_id = '%s'
                    """.formatted(userId, mediaId))) {
                    result.next();
                    assertEquals("COMPLETED", result.getString("status"));
                    assertEquals("2025-08-12", result.getDate("completed_at").toString());
                    assertEquals(result.getObject("created_at"), result.getObject("updated_at"));
                }
            }
        } finally {
            try (var connection = DriverManager.getConnection(adminUrl, username, password);
                 var statement = connection.createStatement()) {
                statement.execute("DROP DATABASE IF EXISTS " + database + " WITH (FORCE)");
            }
        }
    }

    private void migrateTo(
        String url,
        String username,
        String password,
        String target
    ) {
        Flyway.configure()
            .dataSource(url, username, password)
            .locations("classpath:db/migration")
            .target(MigrationVersion.fromVersion(target))
            .load()
            .migrate();
    }

    private String databaseUrl(String url, String database) {
        int queryIndex = url.indexOf('?');
        String base = queryIndex >= 0 ? url.substring(0, queryIndex) : url;
        String query = queryIndex >= 0 ? url.substring(queryIndex) : "";
        int slashIndex = base.lastIndexOf('/');
        if (slashIndex < "jdbc:postgresql://".length()) {
            throw new IllegalArgumentException("Expected a PostgreSQL JDBC database URL");
        }
        return base.substring(0, slashIndex + 1) + database + query;
    }

    private String requiredEnvironment(String name) {
        return Objects.requireNonNull(System.getenv(name), name + " must be set for migration tests");
    }
}
