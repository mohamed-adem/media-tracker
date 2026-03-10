"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useAuth";
import { useQuickAdd } from "@/app/components/QuickAddProvider";
import { StatCardSkeleton } from "@/app/components/LoadingSkeleton";
import CollectionGrid from "@/app/components/CollectionGrid";
import FriendActivity from "@/app/components/FriendActivity";
import type { Me, Review, FeedItem } from "@/types";

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth();
  const quickAdd = useQuickAdd();

  const [me, setMe] = useState<Me | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!quickAdd) return;
    return quickAdd.onReviewCreated((created) => {
      setReviews((prev) => [created, ...prev]);
    });
  }, [quickAdd]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const [u, mine, f] = await Promise.all([
          apiFetch<Me>("/api/users/me"),
          apiFetch<Review[]>("/api/reviews/me"),
          apiFetch<FeedItem[]>("/api/feed"),
        ]);
        setMe(u);
        setReviews(mine);
        setFeed(f);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading]);

  const stats = useMemo(() => {
    const counts = { MOVIE: 0, SHOW: 0, GAME: 0, BOOK: 0 };
    let totalRating = 0;

    for (const rv of reviews) {
      if (rv.kind && rv.kind in counts) {
        counts[rv.kind] += 1;
      }
      totalRating += rv.rating;
    }

    return {
      total: reviews.length,
      avg: reviews.length ? (totalRating / reviews.length).toFixed(1) : "0.0",
      movies: counts.MOVIE,
      shows: counts.SHOW,
      games: counts.GAME,
      books: counts.BOOK,
    };
  }, [reviews]);

  if (authLoading) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {me ? `Welcome, ${me.displayName}!` : "Welcome!"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your collection first. Friends activity below.
          </p>
        </div>
        <button className="btn" onClick={() => quickAdd?.openQuickAdd("MOVIE")}>
          + Add media
        </button>
      </div>

      {err && <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total.toString()} />
          <StatCard label="Avg" value={stats.avg} />
          <StatCard label="Movies" value={stats.movies.toString()} />
          <StatCard label="Shows" value={stats.shows.toString()} />
          <StatCard label="Games" value={stats.games.toString()} />
          <StatCard label="Books" value={stats.books.toString()} />
        </div>
      )}

      <section className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your collection</h2>
          <span className="text-xs text-text-tertiary">{reviews.length} items</span>
        </div>
        <CollectionGrid reviews={reviews} loading={loading} />
      </section>

      <section className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Friends activity</h2>
          <span className="text-xs text-text-tertiary">Latest 6</span>
        </div>
        <FriendActivity items={feed} loading={loading} maxItems={6} />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-glass">
      <div className="text-xs text-text-tertiary">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text-primary">{value}</div>
    </div>
  );
}
