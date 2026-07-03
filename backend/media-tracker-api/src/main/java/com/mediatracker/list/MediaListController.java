package com.mediatracker.list;

import com.mediatracker.list.dto.MediaListDtos;
import com.mediatracker.media.MediaItem;
import com.mediatracker.media.MediaItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/lists")
public class MediaListController {
    private final MediaListRepository lists;
    private final MediaListItemRepository items;
    private final MediaItemService mediaItems;

    public MediaListController(MediaListRepository lists, MediaListItemRepository items, MediaItemService mediaItems) {
        this.lists = lists;
        this.items = items;
        this.mediaItems = mediaItems;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<MediaListDtos.View> mine(Authentication auth) {
        UUID userId = me(auth);
        return lists.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(this::toView).toList();
    }

    @GetMapping("/users/{userId}")
    @Transactional(readOnly = true)
    public List<MediaListDtos.View> publicLists(@PathVariable UUID userId) {
        return lists.findByUserIdAndPrivateListFalseOrderByUpdatedAtDesc(userId).stream().map(this::toView).toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<MediaListDtos.View> create(@Valid @RequestBody MediaListDtos.Create request, Authentication auth) {
        UUID userId = me(auth);
        String name = request.name().trim();
        if (lists.existsByUserIdAndNameIgnoreCase(userId, name)) {
            throw new ResponseStatusException(CONFLICT, "You already have a list with this name");
        }
        MediaList list = new MediaList();
        list.setUserId(userId);
        list.setName(name);
        list.setDescription(blankToNull(request.description()));
        list.setPrivateList(request.privateList() == null || request.privateList());
        MediaList saved = lists.save(list);
        return ResponseEntity.created(URI.create("/api/lists/" + saved.getId())).body(toView(saved));
    }

    @PatchMapping("/{listId}")
    @Transactional
    public MediaListDtos.View update(
        @PathVariable UUID listId,
        @Valid @RequestBody MediaListDtos.Update request,
        Authentication auth
    ) {
        MediaList list = owned(listId, auth);
        if (request.name() != null) {
            String name = request.name().trim();
            if (lists.existsByUserIdAndNameIgnoreCaseAndIdNot(list.getUserId(), name, listId)) {
                throw new ResponseStatusException(CONFLICT, "You already have a list with this name");
            }
            list.setName(name);
        }
        if (request.description() != null) list.setDescription(blankToNull(request.description()));
        if (request.privateList() != null) list.setPrivateList(request.privateList());
        return toView(lists.save(list));
    }

    @DeleteMapping("/{listId}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID listId, Authentication auth) {
        lists.delete(owned(listId, auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/items")
    @Transactional
    public ResponseEntity<MediaListDtos.View> addItem(
        @PathVariable UUID listId,
        @Valid @RequestBody MediaListDtos.AddItem request,
        Authentication auth
    ) {
        MediaList list = owned(listId, auth);
        MediaItem media = mediaItems.resolve(
            request.kind(), request.externalId(), request.title(), request.year(), request.posterUrl()
        );
        if (items.existsByListIdAndMedia_Id(listId, media.getId())) {
            throw new ResponseStatusException(CONFLICT, "This media is already on the list");
        }
        MediaListItem item = new MediaListItem();
        item.setList(list);
        item.setMedia(media);
        item.setPosition(Math.toIntExact(items.countByListId(listId)));
        item.setNote(blankToNull(request.note()));
        items.save(item);
        return ResponseEntity.created(URI.create("/api/lists/" + listId + "/items/" + item.getId()))
            .body(toView(list));
    }

    @DeleteMapping("/{listId}/items/{itemId}")
    @Transactional
    public ResponseEntity<Void> removeItem(
        @PathVariable UUID listId,
        @PathVariable UUID itemId,
        Authentication auth
    ) {
        owned(listId, auth);
        MediaListItem item = items.findByIdAndListId(itemId, listId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "List item not found"));
        items.delete(item);
        compactPositions(listId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{listId}/items/{itemId}")
    @Transactional
    public MediaListDtos.View updateItem(
        @PathVariable UUID listId,
        @PathVariable UUID itemId,
        @Valid @RequestBody MediaListDtos.UpdateItem request,
        Authentication auth
    ) {
        MediaList list = owned(listId, auth);
        MediaListItem item = items.findByIdAndListId(itemId, listId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "List item not found"));
        item.setNote(blankToNull(request.note()));
        items.save(item);
        return toView(list);
    }

    @PutMapping("/{listId}/items/order")
    @Transactional
    public MediaListDtos.View reorderItems(
        @PathVariable UUID listId,
        @Valid @RequestBody MediaListDtos.ReorderItems request,
        Authentication auth
    ) {
        MediaList list = owned(listId, auth);
        List<MediaListItem> current = items.findByListIdOrderByPositionAscCreatedAtAsc(listId);
        List<UUID> requestedIds = request.itemIds();
        if (requestedIds.size() != current.size() || new HashSet<>(requestedIds).size() != requestedIds.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "Item order must include every list item exactly once");
        }

        Map<UUID, MediaListItem> byId = current.stream()
            .collect(Collectors.toMap(MediaListItem::getId, Function.identity()));
        if (!byId.keySet().equals(new HashSet<>(requestedIds))) {
            throw new ResponseStatusException(BAD_REQUEST, "Item order must include every list item exactly once");
        }
        for (int position = 0; position < requestedIds.size(); position++) {
            byId.get(requestedIds.get(position)).setPosition(position);
        }
        items.saveAll(current);
        return toView(list);
    }

    private MediaList owned(UUID listId, Authentication auth) {
        return lists.findByIdAndUserId(listId, me(auth))
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "List not found"));
    }

    private MediaListDtos.View toView(MediaList list) {
        List<MediaListDtos.ItemView> itemViews = items.findByListIdOrderByPositionAscCreatedAtAsc(list.getId()).stream()
            .map(item -> {
                MediaItem media = item.getMedia();
                return new MediaListDtos.ItemView(
                    item.getId(), media.getId(), media.getKind(), media.getExternalId(), media.getTitle(),
                    media.getYear(), media.getPosterUrl(), item.getPosition(), item.getNote(), item.getCreatedAt()
                );
            })
            .toList();
        return new MediaListDtos.View(
            list.getId(), list.getUserId(), list.getName(), list.getDescription(), list.isPrivateList(),
            list.getCreatedAt(), list.getUpdatedAt(), itemViews
        );
    }

    private UUID me(Authentication auth) { return UUID.fromString(auth.getName()); }

    private void compactPositions(UUID listId) {
        List<MediaListItem> remaining = items.findByListIdOrderByPositionAscCreatedAtAsc(listId);
        for (int position = 0; position < remaining.size(); position++) {
            remaining.get(position).setPosition(position);
        }
        items.saveAll(remaining);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
