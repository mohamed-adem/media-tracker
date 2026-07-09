"use client";

import { useMemo, useState } from "react";
import { CollectionCardSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import MediaCard from "./MediaCard";
import type { LibraryEntry, LibraryStatus, MediaKind } from "@/types";

const FILTERS: { label: string; value: MediaKind | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "🎬 Movies", value: "MOVIE" },
  { label: "📺 Shows", value: "SHOW" },
  { label: "🎮 Games", value: "GAME" },
  { label: "📚 Books", value: "BOOK" },
];

const STATUS_FILTERS: { label: string; value: LibraryStatus | "ALL" }[] = [
  { label: "Any status", value: "ALL" },
  { label: "Want to start", value: "PLANNED" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Paused", value: "PAUSED" },
  { label: "Dropped", value: "DROPPED" },
];

type Props = {
  entries: LibraryEntry[];
  loading: boolean;
  showFilters?: boolean;
  onEntryUpdated?: (entry: LibraryEntry) => void;
  onEntryDeleted?: (entryId: string) => void;
};

export default function CollectionGrid({ entries, loading, showFilters = true, onEntryUpdated, onEntryDeleted }: Props) {
  const [kindFilter, setKindFilter] = useState<MediaKind | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<LibraryStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const [sort, setSort] = useState<"RECENT" | "TITLE" | "RATING">("RECENT");

  const filtered = useMemo(() => {
    const matching = entries.filter((entry) => {
      const matchKind = kindFilter === "ALL" || entry.kind === kindFilter;
      const matchStatus = statusFilter === "ALL" || entry.status === statusFilter;
      const matchSearch = !search || entry.title.toLowerCase().includes(search.toLowerCase());
      const matchVisibility = visibility === "ALL" || (visibility === "PRIVATE" ? entry.privateEntry : !entry.privateEntry);
      return matchKind && matchStatus && matchSearch && matchVisibility;
    });
    return matching.toSorted((a, b) => {
      if (sort === "TITLE") return a.title.localeCompare(b.title);
      if (sort === "RATING") return (b.rating ?? -1) - (a.rating ?? -1);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [entries, kindFilter, statusFilter, search, visibility, sort]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setKindFilter(f.value)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                kindFilter === f.value
                  ? "bg-ink text-paper"
                  : "border border-ink/15 bg-bg-surface text-text-secondary hover:border-ink hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
          <select
            className="input !w-auto"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LibraryStatus | "ALL")}
            aria-label="Filter by library status"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
          <select className="input !w-auto" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} aria-label="Filter by privacy">
            <option value="ALL">Any privacy</option>
            <option value="PUBLIC">Shared</option>
            <option value="PRIVATE">Private</option>
          </select>
          <select className="input !w-auto" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort library">
            <option value="RECENT">Recently updated</option>
            <option value="TITLE">Title</option>
            <option value="RATING">Highest rated</option>
          </select>
          <input
            className="input ml-auto min-w-[160px] flex-1 sm:!w-56 sm:flex-none"
            placeholder="Filter your library"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No media found"
          description={entries.length === 0 ? "Start tracking by adding your first media." : "Try a different filter."}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((entry) => (
            <MediaCard
              key={entry.id}
              entry={entry}
              onEntryUpdated={onEntryUpdated}
              onEntryDeleted={onEntryDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
