package com.mediatracker.friend;

import com.mediatracker.user.User;
import com.mediatracker.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendRepository friends;
    private final UserRepository users;

    public FriendController(FriendRepository friends, UserRepository users) {
        this.friends = friends;
        this.users = users;
    }

    public record FriendView(
            UUID userId,
            UUID friendId,
            String friendDisplayName,
            FriendStatus status,
            OffsetDateTime createdAt
    ) {}

    public record IncomingRequest(
            UUID requesterId,
            String requesterDisplayName,
            OffsetDateTime createdAt
    ) {}

    private UUID me(org.springframework.security.core.Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<FriendView> list(org.springframework.security.core.Authentication auth) {
        UUID myId = me(auth);
        List<Friend> rows = friends.findByIdUserId(myId);
        if (rows.isEmpty()) return List.of();

        Set<UUID> friendIds = rows.stream().map(r -> r.getId().getFriendId()).collect(Collectors.toSet());
        Map<UUID, String> nameById = new HashMap<>();
        for (User u : users.findAllById(friendIds)) {
            nameById.put(u.getId(), u.getDisplayName());
        }

        List<FriendView> out = new ArrayList<>(rows.size());
        for (Friend f : rows) {
            out.add(new FriendView(
                    f.getId().getUserId(),
                    f.getId().getFriendId(),
                    nameById.getOrDefault(f.getId().getFriendId(), "Unknown"),
                    f.getStatus(),
                    f.getCreatedAt()
            ));
        }
        return out;
    }

    @GetMapping("/requests")
    @Transactional(readOnly = true)
    public List<IncomingRequest> incoming(org.springframework.security.core.Authentication auth) {
        UUID myId = me(auth);
        List<Friend> rows = friends.findByIdFriendId(myId);
        if (rows.isEmpty()) return List.of();

        List<Friend> pending = rows.stream()
                .filter(r -> r.getStatus() == FriendStatus.PENDING)
                .toList();

        if (pending.isEmpty()) return List.of();

        Set<UUID> requesterIds = pending.stream()
                .map(r -> r.getId().getUserId())
                .collect(Collectors.toSet());

        Map<UUID, String> nameById = new HashMap<>();
        for (User u : users.findAllById(requesterIds)) {
            nameById.put(u.getId(), u.getDisplayName());
        }

        List<IncomingRequest> out = new ArrayList<>(pending.size());
        for (Friend f : pending) {
            out.add(new IncomingRequest(
                    f.getId().getUserId(),
                    nameById.getOrDefault(f.getId().getUserId(), "Unknown"),
                    f.getCreatedAt()
            ));
        }
        return out;
    }

    @PostMapping("/{friendId}")
    @Transactional
    public Friend send(@PathVariable UUID friendId, org.springframework.security.core.Authentication auth) {
        UUID myId = me(auth);
        if (myId.equals(friendId)) {
            throw new IllegalArgumentException("Cannot friend yourself");
        }
        var existing = friends.findByIdUserIdAndIdFriendId(myId, friendId).orElse(null);
        if (existing != null) return existing;

        Friend f = new Friend();
        f.setId(new FriendId(myId, friendId));
        f.setStatus(FriendStatus.PENDING);
        return friends.save(f);
    }

    @PostMapping("/{friendId}/accept")
    @Transactional
    public Friend accept(@PathVariable UUID friendId, org.springframework.security.core.Authentication auth) {
        UUID myId = me(auth);
        FriendId incomingKey = new FriendId(friendId, myId);
        Friend incoming = friends.findById(incomingKey)
                .orElseThrow(() -> new IllegalArgumentException("No request found"));
        if (incoming.getStatus() != FriendStatus.PENDING) return incoming;

        incoming.setStatus(FriendStatus.ACCEPTED);
        friends.save(incoming);

        var reciprocal = friends.findByIdUserIdAndIdFriendId(myId, friendId).orElse(null);
        if (reciprocal == null) {
            reciprocal = new Friend();
            reciprocal.setId(new FriendId(myId, friendId));
        }
        reciprocal.setStatus(FriendStatus.ACCEPTED);
        return friends.save(reciprocal);
    }

    @PostMapping("/{friendId}/decline")
    @Transactional
    public void decline(@PathVariable UUID friendId, org.springframework.security.core.Authentication auth) {
        UUID myId = me(auth);
        FriendId incomingKey = new FriendId(friendId, myId);
        friends.findById(incomingKey).ifPresent(friends::delete);
    }
}
