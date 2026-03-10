"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { loadAccessToken } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { FeedItemSkeleton } from "@/app/components/LoadingSkeleton";
import { StarsDisplay } from "@/app/components/StarRating";
import EmptyState from "@/app/components/EmptyState";
import Link from "next/link";
import type { FeedItem } from "@/types";

export default function FeedPage() {
  const { loading: authLoading } = useRequireAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    const token = loadAccessToken();
    if (!token) return;
    try {
      const data = await apiFetch<FeedItem[]>("/api/feed", { token });
      setItems(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading]);

  if (authLoading) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Friends&apos; Feed</h1>
        <button className="btn-outline" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>
      )}

      {/* Loading skeletons */}
      {loading && items.length === 0 && (
        <div className="space-y-4">
          <FeedItemSkeleton />
          <FeedItemSkeleton />
          <FeedItemSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <EmptyState
          icon="📡"
          title="Your feed is empty"
          description="Add friends and they'll show up here when they post reviews."
          action={
            <Link href="/friends" className="btn">
              Find friends
            </Link>
          }
        />
      )}

      {/* Feed items */}
      <div className="space-y-4">
        {items.map((it) => (
          <div
            key={it.reviewId}
            className="card-glass hover:border-accent/30 transition-colors"
          >
            <div className="flex gap-3">
              {/* Poster */}
              {it.posterUrl ? (
                <img
                  src={it.posterUrl}
                  alt=""
                  width={48}
                  height={72}
                  className="w-12 h-[72px] rounded-lg object-cover flex-none"
                />
              ) : (
                <div className="w-12 h-[72px] rounded-lg bg-bg-hover flex-none flex items-center justify-center text-text-tertiary text-lg">
                  🎬
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{it.author}</span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title + rating */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-text-primary truncate">{it.title}</span>
                  {it.rating != null && (
                    <span className="flex-none">
                      <StarsDisplay value={it.rating} small />
                    </span>
                  )}
                </div>

                {/* Body */}
                {it.body && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-3">{it.body}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
