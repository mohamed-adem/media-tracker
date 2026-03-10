"use client";

import { useMemo, useState } from "react";
import { CollectionCardSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import MediaCard from "./MediaCard";
import type { Review, MediaKind } from "@/types";

const FILTERS: { label: string; value: MediaKind | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "🎬 Movies", value: "MOVIE" },
  { label: "📺 Shows", value: "SHOW" },
  { label: "🎮 Games", value: "GAME" },
  { label: "📚 Books", value: "BOOK" },
];

type Props = {
  reviews: Review[];
  loading: boolean;
  showFilters?: boolean;
};

export default function CollectionGrid({ reviews, loading, showFilters = true }: Props) {
  const [kindFilter, setKindFilter] = useState<MediaKind | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return reviews.filter((rv) => {
      const matchKind = kindFilter === "ALL" || rv.kind === kindFilter;
      const matchSearch = !search || rv.title.toLowerCase().includes(search.toLowerCase());
      return matchKind && matchSearch;
    });
  }, [reviews, kindFilter, search]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                kindFilter === f.value
                  ? "bg-accent text-bg-base"
                  : "bg-bg-hover text-text-secondary border border-border hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
          <input
            className="input !w-auto flex-1 min-w-[140px] ml-auto"
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No media found"
          description={reviews.length === 0 ? "Start tracking by adding your first media." : "Try a different filter."}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((rv) => (
            <MediaCard key={rv.id} review={rv} />
          ))}
        </div>
      )}
    </div>
  );
}
