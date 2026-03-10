"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useAuth";
import MediaSearchBox from "@/app/components/MediaSearchBox";
import Modal from "@/app/components/Modal";
import { StarRating, StarsDisplay } from "@/app/components/StarRating";
import { StatCardSkeleton, FeedItemSkeleton, ReviewCardSkeleton } from "@/app/components/LoadingSkeleton";
import EmptyState from "@/app/components/EmptyState";
import type { Me, Review, FeedItem, MediaKind } from "@/types";

type QuickKind = MediaKind;

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick-add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [qaKind, setQaKind] = useState<QuickKind>("MOVIE");
  const [qaSelection, setQaSelection] = useState<{
    kind: QuickKind;
    externalId: string | null;
    title: string;
    year: number | null;
    posterUrl: string | null;
  } | null>(null);
  const [qaRating, setQaRating] = useState(5);
  const [qaBody, setQaBody] = useState("");

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const u = await apiFetch<Me>("/api/users/me");
        setMe(u);
        const mine = await apiFetch<Review[]>("/api/reviews/me");
        setReviews(mine);
        const f = await apiFetch<FeedItem[]>("/api/feed");
        setFeed(f);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading]);

  const counts = useMemo(() => {
    const c = { books: 0, movies: 0, shows: 0, games: 0 };
    for (const rv of reviews) {
      switch (rv.kind) {
        case "BOOK": c.books++; break;
        case "MOVIE": c.movies++; break;
        case "SHOW": c.shows++; break;
        case "GAME": c.games++; break;
      }
    }
    return c;
  }, [reviews]);

  async function quickAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!qaSelection) return;
    try {
      const payload: Record<string, unknown> = {
        kind: qaSelection.kind,
        title: qaSelection.title,
        year: qaSelection.year,
        rating: Number(qaRating),
        body: qaBody || null,
        posterUrl: qaSelection.posterUrl ?? null,
      };
      if (qaSelection.externalId) payload.externalId = qaSelection.externalId;

      const created = await apiFetch<Review>("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReviews((prev) => [created, ...prev]);

      setShowAdd(false);
      setQaSelection(null);
      setQaRating(5);
      setQaBody("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    }
  }

  if (authLoading) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting / CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {me ? `Welcome back, ${me.displayName}!` : "Welcome back!"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track your entertainment and connect with friends.
          </p>
        </div>
        <button
          className="btn"
          onClick={() => { setShowAdd(true); setQaKind("MOVIE"); setQaSelection(null); }}
        >
          + Add media
        </button>
      </div>

      {err && (
        <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>
      )}

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📚" label="Books Read" value={counts.books} />
          <StatCard icon="🎬" label="Movies Watched" value={counts.movies} />
          <StatCard icon="📺" label="TV Shows" value={counts.shows} />
          <StatCard icon="🎮" label="Games Played" value={counts.games} />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Friends Activity */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Friends Activity">
            {loading ? (
              <div className="space-y-3">
                <FeedItemSkeleton />
                <FeedItemSkeleton />
                <FeedItemSkeleton />
              </div>
            ) : feed.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No activity yet"
                description="Add some friends to see their activity."
              />
            ) : (
              <div className="space-y-3">
                {feed.slice(0, 10).map((f) => (
                  <div key={f.reviewId} className="rounded-xl bg-bg-hover/30 p-3 flex gap-3 hover:bg-bg-hover/50 transition-colors">
                    {f.posterUrl ? (
                      <img src={f.posterUrl} alt="" width={40} height={60} className="w-10 h-14 rounded-lg object-cover flex-none" />
                    ) : (
                      <div className="w-10 h-14 bg-bg-hover rounded-lg flex-none flex items-center justify-center text-text-tertiary">🎬</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary truncate">{f.author}</span>
                        <span className="text-xs text-text-tertiary">{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-medium truncate">{f.title}</span>
                        {typeof f.rating === "number" && <span className="flex-none"><StarsDisplay value={f.rating} small /></span>}
                      </div>
                      {f.body && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{f.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT: Recent Activity + Quick Add */}
        <div className="space-y-4">
          <Section title="Recent Activity">
            {loading ? (
              <div className="space-y-3">
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState icon="✨" title="No reviews yet" description="Use Add media to start!" />
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 10).map((rv) => (
                  <div key={rv.id} className="rounded-xl bg-bg-hover/30 p-3 hover:bg-bg-hover/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {rv.posterUrl ? (
                        <img src={rv.posterUrl} alt="" width={48} height={72} className="w-12 h-[72px] rounded-lg object-cover flex-none" />
                      ) : (
                        <div className="w-12 h-[72px] bg-bg-hover rounded-lg flex-none flex items-center justify-center text-text-tertiary">🎬</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary truncate">{rv.title}</span>
                          <span className="text-xs inline-flex items-center gap-1"><StarsDisplay value={rv.rating} small /></span>
                        </div>
                        {rv.body && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{rv.body}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Quick Add">
            <div className="flex flex-wrap gap-2 mb-3">
              {(["BOOK", "MOVIE", "SHOW", "GAME"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => { setQaKind(k); setShowAdd(true); setQaSelection(null); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    qaKind === k
                      ? "bg-accent text-bg-base"
                      : "bg-bg-hover text-text-secondary border border-border hover:text-text-primary"
                  }`}
                >
                  {k === "BOOK" ? "📚 Book" : k === "MOVIE" ? "🎬 Movie" : k === "SHOW" ? "📺 TV Show" : "🎮 Game"}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-tertiary">Pick a type to start adding.</p>
          </Section>
        </div>
      </div>

      {/* Quick-Add Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add media">
          {!qaSelection ? (
            <div className="space-y-3">
              <select className="input" value={qaKind} onChange={(e) => setQaKind(e.target.value as QuickKind)}>
                <option value="BOOK">Book</option>
                <option value="MOVIE">Movie</option>
                <option value="SHOW">TV Show</option>
                <option value="GAME">Game</option>
              </select>
              <MediaSearchBox
                kind={qaKind}
                placeholder="Search and pick..."
                onPick={(it) => {
                  setQaSelection({
                    kind: (it.kind ?? qaKind) as QuickKind,
                    externalId: it.externalId,
                    title: it.title,
                    year: it.year ?? null,
                    posterUrl: it.posterUrl ?? null,
                  });
                }}
              />
            </div>
          ) : (
            <form onSubmit={quickAddSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                {qaSelection.posterUrl ? (
                  <img src={qaSelection.posterUrl} alt="" width={56} height={84} className="w-14 h-20 rounded-lg object-cover flex-none" />
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-bg-hover flex-none flex items-center justify-center text-text-tertiary text-xl">🎬</div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {qaSelection.title}{qaSelection.year ? ` (${qaSelection.year})` : ""}
                  </div>
                  <div className="text-xs text-text-tertiary">{qaSelection.kind}</div>
                </div>
                <button type="button" className="btn-ghost text-xs" onClick={() => setQaSelection(null)}>Change</button>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Your rating</label>
                <StarRating value={qaRating} onChange={setQaRating} />
              </div>
              <textarea className="input min-h-[80px]" placeholder="Your thoughts..." value={qaBody} onChange={(e) => setQaBody(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- Helper components ---------- */

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="card-glass hover:border-accent/30 transition-colors">
      <div className="flex items-center gap-2 text-text-secondary">
        <span>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-bold text-accent">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-glass">
      <h2 className="text-lg font-semibold mb-3 text-text-primary">{title}</h2>
      {children}
    </section>
  );
}
