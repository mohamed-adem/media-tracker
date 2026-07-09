"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useAuth";
import { useQuickAdd } from "@/app/components/QuickAddProvider";
import { StatCardSkeleton } from "@/app/components/LoadingSkeleton";
import CollectionGrid from "@/app/components/CollectionGrid";
import FriendActivity from "@/app/components/FriendActivity";
import type { Me, LibraryEntry, FeedItem } from "@/types";

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth();
  const quickAdd = useQuickAdd();

  const [me, setMe] = useState<Me | null>(null);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!quickAdd) return;
    return quickAdd.onEntrySaved((created) => {
      setEntries((previous) => [created, ...previous.filter((entry) => entry.id !== created.id)]);
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
          apiFetch<LibraryEntry[]>("/api/library"),
          apiFetch<FeedItem[]>("/api/feed"),
        ]);
        setMe(u);
        setEntries(mine);
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

    let ratedCount = 0;
    for (const entry of entries) {
      if (entry.kind in counts) {
        counts[entry.kind] += 1;
      }
      if (entry.rating != null) {
        totalRating += entry.rating;
        ratedCount += 1;
      }
    }

    return {
      total: entries.length,
      avg: ratedCount ? (totalRating / ratedCount).toFixed(1) : "-",
      movies: counts.MOVIE,
      shows: counts.SHOW,
      games: counts.GAME,
      books: counts.BOOK,
    };
  }, [entries]);

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="card-dark relative overflow-hidden">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/90" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f58b76]">Your library</p>
            <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              {me ? `Welcome back, ${me.displayName}.` : "Your library"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-paper/60">Track what you want to start, what you’re working through, and what you finished.</p>
          </div>
          <button className="btn !bg-paper !text-ink !shadow-none hover:!bg-accent hover:!text-white" onClick={() => quickAdd?.openQuickAdd("MOVIE")}>
            Add something new
          </button>
        </div>

        <div className="relative mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
          {loading ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />) : (
            <>
              <StatCard label="Total" value={stats.total.toString()} />
              <StatCard label="Average" value={stats.avg} />
              <StatCard label="Films" value={stats.movies.toString()} />
              <StatCard label="Shows" value={stats.shows.toString()} />
              <StatCard label="Games" value={stats.games.toString()} />
              <StatCard label="Books" value={stats.books.toString()} />
            </>
          )}
        </div>
      </section>

      {err && <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-5">
          <div className="rule-title">
            <div>
              <p className="eyebrow">Library</p>
              <h2 className="mt-1 font-serif text-3xl">Recently updated</h2>
            </div>
            <span className="text-sm text-text-tertiary">{entries.length} entries</span>
          </div>
          <CollectionGrid
            entries={entries}
            loading={loading}
            onEntryUpdated={(updated) => setEntries((previous) => previous.map((entry) => entry.id === updated.id ? updated : entry))}
            onEntryDeleted={(entryId) => setEntries((previous) => previous.filter((entry) => entry.id !== entryId))}
          />
        </section>

        <aside className="card space-y-4 xl:sticky xl:top-24">
          <div className="rule-title">
            <div>
              <p className="eyebrow">From friends</p>
              <h2 className="mt-1 font-serif text-2xl">Activity</h2>
            </div>
          </div>
          <FriendActivity items={feed} loading={loading} maxItems={6} />
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink/80 p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-paper/45">{label}</div>
      <div className="mt-1 font-serif text-3xl text-paper">{value}</div>
    </div>
  );
}
