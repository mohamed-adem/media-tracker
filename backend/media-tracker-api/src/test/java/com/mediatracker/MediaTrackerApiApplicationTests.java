package com.mediatracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediatracker.friend.FriendRepository;
import com.mediatracker.library.LibraryEntryRepository;
import com.mediatracker.list.MediaListItemRepository;
import com.mediatracker.list.MediaListRepository;
import com.mediatracker.media.MediaItemRepository;
import com.mediatracker.media.ReviewRepository;
import com.mediatracker.notification.NotificationRepository;
import com.mediatracker.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MediaTrackerApiApplicationTests {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired FriendRepository friends;
    @Autowired ReviewRepository reviews;
    @Autowired LibraryEntryRepository entries;
    @Autowired MediaItemRepository mediaItems;
    @Autowired MediaListRepository mediaLists;
    @Autowired MediaListItemRepository mediaListItems;
    @Autowired NotificationRepository notifications;

    @BeforeEach
    void cleanDatabase() {
        notifications.deleteAll();
        mediaListItems.deleteAll();
        mediaLists.deleteAll();
        friends.deleteAll();
        reviews.deleteAll();
        entries.deleteAll();
        mediaItems.deleteAll();
        users.deleteAll();
    }

    @Test
    void customListsEnforceOwnershipAndPublicVisibility() throws Exception {
        Session owner = register("list-owner");
        Session stranger = register("list-stranger");

        String createdResponse = mvc.perform(post("/api/lists")
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"Weekend picks","description":"Short things to finish","privateList":false}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Weekend picks"))
            .andExpect(jsonPath("$.privateList").value(false))
            .andReturn().getResponse().getContentAsString();
        String listId = json.readTree(createdResponse).get("id").asText();

        mvc.perform(post("/api/lists")
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"WEEKEND PICKS\"}"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("You already have a list with this name"));

        mvc.perform(patch("/api/lists/{listId}", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Weekend queue\",\"description\":\"Watch these next\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Weekend queue"))
            .andExpect(jsonPath("$.description").value("Watch these next"));

        String updatedResponse = mvc.perform(post("/api/lists/{listId}/items", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"kind":"MOVIE","externalId":"list-movie","title":"List Movie","year":2026}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.items[0].title").value("List Movie"))
            .andReturn().getResponse().getContentAsString();
        String itemId = json.readTree(updatedResponse).get("items").get(0).get("id").asText();

        String twoItemResponse = mvc.perform(post("/api/lists/{listId}/items", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"kind":"BOOK","externalId":"list-book","title":"List Book","year":2025}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.items.length()").value(2))
            .andReturn().getResponse().getContentAsString();
        String secondItemId = json.readTree(twoItemResponse).get("items").get(1).get("id").asText();

        mvc.perform(patch("/api/lists/{listId}/items/{itemId}", listId, itemId)
                .header("Authorization", "Bearer " + stranger.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"Stolen note\"}"))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/lists/{listId}/items/{itemId}", listId, itemId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"Watch before Sunday\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].note").value("Watch before Sunday"));

        mvc.perform(put("/api/lists/{listId}/items/order", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(java.util.Map.of("itemIds", java.util.List.of(secondItemId, itemId)))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("List Book"))
            .andExpect(jsonPath("$.items[0].position").value(0))
            .andExpect(jsonPath("$.items[1].title").value("List Movie"))
            .andExpect(jsonPath("$.items[1].position").value(1));

        mvc.perform(put("/api/lists/{listId}/items/order", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(java.util.Map.of("itemIds", java.util.List.of(itemId)))))
            .andExpect(status().isBadRequest());

        mvc.perform(get("/api/lists/users/{userId}", owner.userId())
                .header("Authorization", "Bearer " + stranger.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Weekend queue"))
            .andExpect(jsonPath("$[0].items[0].title").value("List Book"))
            .andExpect(jsonPath("$[0].items[1].note").value("Watch before Sunday"));

        mvc.perform(patch("/api/lists/{listId}", listId)
                .header("Authorization", "Bearer " + stranger.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Stolen\"}"))
            .andExpect(status().isNotFound());
        mvc.perform(delete("/api/lists/{listId}/items/{itemId}", listId, itemId)
                .header("Authorization", "Bearer " + stranger.accessToken()))
            .andExpect(status().isNotFound());

        mvc.perform(delete("/api/lists/{listId}/items/{itemId}", listId, secondItemId)
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isNoContent());
        mvc.perform(get("/api/lists")
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].items[0].position").value(0));

        mvc.perform(patch("/api/lists/{listId}", listId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"privateList\":true}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.privateList").value(true));
        mvc.perform(get("/api/lists/users/{userId}", owner.userId())
                .header("Authorization", "Bearer " + stranger.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void friendNotificationsAndExplainableRecommendationsWorkTogether() throws Exception {
        Session reader = register("recommend-reader");
        Session curator = register("recommend-curator");
        Session stranger = register("recommend-stranger");

        mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + curator.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"BOOK","externalId":"recommend-book","title":"A Recommended Book",
                      "status":"COMPLETED","privateEntry":false,"rating":4.5
                    }
                    """))
            .andExpect(status().isCreated());

        mvc.perform(post("/api/friends/{friendId}", curator.userId())
                .header("Authorization", "Bearer " + reader.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        String curatorNotifications = mvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer " + curator.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.unreadCount").value(1))
            .andExpect(jsonPath("$.notifications[0].type").value("FRIEND_REQUEST"))
            .andReturn().getResponse().getContentAsString();
        String notificationId = json.readTree(curatorNotifications).get("notifications").get(0).get("id").asText();

        mvc.perform(patch("/api/notifications/{notificationId}/read", notificationId)
                .header("Authorization", "Bearer " + curator.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.readAt").isNotEmpty());

        mvc.perform(post("/api/friends/{friendId}/accept", reader.userId())
                .header("Authorization", "Bearer " + curator.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.notifications[0].type").value("FRIEND_ACCEPTED"));

        mvc.perform(get("/api/recommendations")
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("A Recommended Book"))
            .andExpect(jsonPath("$[0].reason").value(org.hamcrest.Matchers.containsString("4.5")));

        mvc.perform(get("/api/recommendations")
                .header("Authorization", "Bearer " + stranger.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void accessTokenForDeletedUserIsRejected() throws Exception {
        Session session = register("deleted");
        users.deleteById(session.userId());
        users.flush();

        mvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + session.accessToken()))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void registerRefreshAndHalfStarReviewWorkTogether() throws Exception {
        Session session = register("reader");

        mvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new RefreshBody(session.refreshToken()))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty());

        mvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + session.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind": "BOOK",
                      "externalId": "/works/OL45804W",
                      "title": "Dune",
                      "year": 1965,
                      "rating": 4.5,
                      "body": "Still thinking about it."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Dune"))
            .andExpect(jsonPath("$.rating").value(4.5));

        mvc.perform(get("/api/library")
                .header("Authorization", "Bearer " + session.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Dune"))
            .andExpect(jsonPath("$[0].status").value("COMPLETED"))
            .andExpect(jsonPath("$[0].rating").value(4.5));
    }

    @Test
    void libraryEntrySupportsLifecycleOwnershipAndDuplicateProtection() throws Exception {
        Session owner = register("owner");
        Session stranger = register("stranger");
        String createBody = """
            {
              "kind":"BOOK",
              "externalId":"/works/OL-library-test",
              "title":"A Long Book",
              "year":2026,
              "status":"PLANNED",
              "privateEntry":true
            }
            """;

        String createdResponse = mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(createBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PLANNED"))
            .andExpect(jsonPath("$.rating").doesNotExist())
            .andExpect(jsonPath("$.privateEntry").value(true))
            .andReturn().getResponse().getContentAsString();

        String entryId = json.readTree(createdResponse).get("id").asText();

        mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(createBody))
            .andExpect(status().isConflict());

        mvc.perform(patch("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + stranger.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_PROGRESS\",\"progressCurrent\":2,\"progressTotal\":10}"))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_PROGRESS\",\"progressCurrent\":2,\"progressTotal\":10}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.progressCurrent").value(2.0))
            .andExpect(jsonPath("$.progressTotal").value(10.0))
            .andExpect(jsonPath("$.startedAt").isNotEmpty());

        mvc.perform(patch("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMPLETED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"))
            .andExpect(jsonPath("$.progressCurrent").value(10.0))
            .andExpect(jsonPath("$.completedAt").isNotEmpty());

        mvc.perform(put("/api/library/{entryId}/review", entryId)
                .header("Authorization", "Bearer " + stranger.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"rating\":4.5,\"body\":\"Not mine to edit\"}"))
            .andExpect(status().isNotFound());

        mvc.perform(put("/api/library/{entryId}/review", entryId)
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"rating\":4.5,\"body\":\"Finished and reviewed\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"))
            .andExpect(jsonPath("$.rating").value(4.5))
            .andExpect(jsonPath("$.reviewBody").value("Finished and reviewed"))
            .andExpect(jsonPath("$.reviewedAt").isNotEmpty());

        mvc.perform(delete("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + stranger.accessToken()))
            .andExpect(status().isNotFound());

        mvc.perform(delete("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isNoContent());

        mvc.perform(get("/api/library")
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
        mvc.perform(get("/api/reviews/me")
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void invalidReviewRollsBackAtomicLibraryCreate() throws Exception {
        Session owner = register("atomic");

        mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + owner.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"GAME",
                      "externalId":"invalid-rating-game",
                      "title":"Invalid Rating",
                      "status":"COMPLETED",
                      "rating":4.7
                    }
                    """))
            .andExpect(status().isBadRequest());

        mvc.perform(get("/api/library")
                .header("Authorization", "Bearer " + owner.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void pendingFriendCannotSeeReviewsUntilAccepted() throws Exception {
        Session requester = register("requester");
        Session reviewer = register("reviewer");

        mvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + reviewer.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"kind":"MOVIE","externalId":"550","title":"Fight Club","year":1999,"rating":4.0}
                    """))
            .andExpect(status().isOk());

        mvc.perform(post("/api/friends/{friendId}", reviewer.userId())
                .header("Authorization", "Bearer " + requester.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/feed")
                .header("Authorization", "Bearer " + requester.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());

        mvc.perform(post("/api/friends/{friendId}/accept", requester.userId())
                .header("Authorization", "Bearer " + reviewer.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/feed")
                .header("Authorization", "Bearer " + requester.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Fight Club"));
    }

    @Test
    void privateLibraryEntryStaysOutOfAcceptedFriendFeed() throws Exception {
        Session reader = register("private-reader");
        Session reviewer = register("private-reviewer");

        String createdResponse = mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + reviewer.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"MOVIE",
                      "externalId":"private-movie-1",
                      "title":"Private Movie",
                      "status":"COMPLETED",
                      "privateEntry":true,
                      "rating":4.5,
                      "reviewBody":"For my eyes only"
                    }
                    """))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String entryId = json.readTree(createdResponse).get("id").asText();

        mvc.perform(post("/api/friends/{friendId}", reviewer.userId())
                .header("Authorization", "Bearer " + reader.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());
        mvc.perform(post("/api/friends/{friendId}/accept", reader.userId())
                .header("Authorization", "Bearer " + reviewer.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/feed")
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());

        mvc.perform(patch("/api/library/{entryId}", entryId)
                .header("Authorization", "Bearer " + reviewer.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"privateEntry\":false}"))
            .andExpect(status().isOk());

        mvc.perform(get("/api/feed")
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Private Movie"));
    }

    @Test
    void mediaDetailShowsOwnEntryAndOnlyPublicFriendReviews() throws Exception {
        Session reader = register("detail-reader");
        Session publicFriend = register("detail-public");
        Session privateFriend = register("detail-private");

        String publicEntry = mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + publicFriend.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"BOOK","externalId":"detail-book","title":"Detail Book",
                      "status":"COMPLETED","privateEntry":false,"rating":4.5,
                      "reviewBody":"Worth sharing"
                    }
                    """))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String mediaId = json.readTree(publicEntry).get("mediaId").asText();

        mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + privateFriend.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"BOOK","externalId":"detail-book","title":"Detail Book",
                      "status":"COMPLETED","privateEntry":true,"rating":5.0,
                      "reviewBody":"Do not show this"
                    }
                    """))
            .andExpect(status().isCreated());

        befriend(reader, publicFriend);
        befriend(reader, privateFriend);

        mvc.perform(get("/api/media/{mediaId}", mediaId)
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Detail Book"))
            .andExpect(jsonPath("$.libraryEntry").doesNotExist())
            .andExpect(jsonPath("$.friendReviews.length()").value(1))
            .andExpect(jsonPath("$.friendReviews[0].author").value("detail-public"))
            .andExpect(jsonPath("$.friendReviews[0].body").value("Worth sharing"));

        mvc.perform(post("/api/library")
                .header("Authorization", "Bearer " + reader.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind":"BOOK","externalId":"detail-book","title":"Detail Book",
                      "status":"IN_PROGRESS","privateEntry":false
                    }
                    """))
            .andExpect(status().isCreated());

        mvc.perform(get("/api/media/{mediaId}", mediaId)
                .header("Authorization", "Bearer " + reader.accessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.libraryEntry.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.friendReviews.length()").value(1));
    }

    private void befriend(Session requester, Session accepter) throws Exception {
        mvc.perform(post("/api/friends/{friendId}", accepter.userId())
                .header("Authorization", "Bearer " + requester.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());
        mvc.perform(post("/api/friends/{friendId}/accept", requester.userId())
                .header("Authorization", "Bearer " + accepter.accessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());
    }

    private Session register(String prefix) throws Exception {
        String email = prefix + "+" + UUID.randomUUID() + "@example.com";
        String response = mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(new RegisterBody(email, "password-123", prefix))))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        JsonNode tokens = json.readTree(response);
        String accessToken = tokens.get("accessToken").asText();
        String refreshToken = tokens.get("refreshToken").asText();

        String meResponse = mvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        UUID userId = UUID.fromString(json.readTree(meResponse).get("id").asText());

        return new Session(userId, accessToken, refreshToken);
    }

    private record RegisterBody(String email, String password, String displayName) {}
    private record RefreshBody(String refreshToken) {}
    private record Session(UUID userId, String accessToken, String refreshToken) {}
}
