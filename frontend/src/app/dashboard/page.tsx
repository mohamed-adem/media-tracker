"use client";

import { useEffect, useMemo, useState, useId } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import MediaSearchBox from "@/app/components/MediaSearchBox";

/* ---------- Types ---------- */

type Me = { id: string; email: string; displayName: string; role: string };

type Review = {
  id: string;
  mediaId: string;
  title: string;
  rating: number;
  body: string | null;
  kind?: "MOVIE" | "SHOW" | "GAME" | "BOOK";
  year?: number | null;
  posterUrl?: string | null;
};

type FeedItem = {
  reviewId: string;
  authorId: string;
  author: string;
  title: string;
  rating: number | null;
  body: string | null;
  createdAt: string;
  posterUrl?: string | null;
};

type QuickKind = "BOOK" | "MOVIE" | "SHOW" | "GAME";

/* ---------- Page ---------- */

export default function DashboardPage() {
  const r = useRouter();

  // redirect if not authed
  useEffect(() => {
    if (!isLoggedIn()) r.replace("/login");
  }, [r]);

  const [me, setMe] = useState<Me | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // quick-add modal state
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
    (async () => {
      try {
        const u = await apiFetch<Me>("/api/users/me");
        setMe(u);
        const mine = await apiFetch<Review[]>("/api/reviews/me");
        setReviews(mine);
        const f = await apiFetch<FeedItem[]>("/api/feed");
        setFeed(f);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load dashboard");
      }
    })();
  }, []);

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
      const payload: any = {
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

      // reset
      setShowAdd(false);
      setQaSelection(null);
      setQaRating(5);
      setQaBody("");
    } catch (e: any) {
      alert(e?.message ?? "Create failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Greeting / CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {me ? `Welcome back, ${me.displayName}!` : "Welcome back!"}
          </h1>
          <p className="text-sm text-neutral-500">
            Track your entertainment and connect with friends.
          </p>
        </div>
        <button
          className="px-3 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
          onClick={() => { setShowAdd(true); setQaKind("MOVIE"); setQaSelection(null); }}
        >
          + Add media
        </button>
      </div>

      {err && <p className="text-red-600">{err}</p>}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Books Read" value={counts.books} />
        <StatCard label="Movies Watched" value={counts.movies} />
        <StatCard label="TV Shows" value={counts.shows} />
        <StatCard label="Games" value={counts.games} />
      </div>

      {/* MAIN GRID — Friends first (wide), Recent second (narrow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Friends Activity (emphasized) */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Friends Activity">
            {feed.length === 0 ? (
              <Empty state="No friends activity yet. Add some friends to see their activity." />
            ) : (
              <div className="space-y-3">
                {feed.slice(0, 10).map((f) => (
                  <div key={f.reviewId} className="rounded-lg border bg-white p-3 flex gap-3">
                    {f.posterUrl ? (
                      <img
                        src={f.posterUrl}
                        alt=""
                        width={40}
                        height={60}
                        className="rounded object-cover flex-none"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-neutral-200 rounded flex-none" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{f.author}</div>
                        <span className="text-xs text-neutral-500">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1 truncate">
                        <span className="font-medium">{f.title}</span>
                        {typeof f.rating === "number" && (
                          <span className="ml-2 text-neutral-600">{f.rating}/5</span>
                        )}
                      </div>
                      {f.body && <p className="text-sm mt-1 line-clamp-3">{f.body}</p>}
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
            {reviews.length === 0 ? (
              <Empty state="No reviews yet. Use Add media to start!" />
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 10).map((rv) => (
                  <div key={rv.id} className="rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-3">
                      {rv.posterUrl ? (
                        <img
                          src={rv.posterUrl}
                          alt=""
                          width={48}
                          height={72}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-[72px] bg-neutral-200 rounded" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{rv.title}</div>
                          <span className="text-xs text-neutral-600 inline-flex items-center gap-1">
                            <StarsDisplay value={rv.rating} small />
                            <span>{rv.rating}/5</span>
                          </span>
                        </div>
                        {rv.body && <p className="text-sm mt-2">{rv.body}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Quick Add">
            <div className="flex flex-wrap gap-2 mb-3">
              {(["BOOK","MOVIE","SHOW","GAME"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => { setQaKind(k); setShowAdd(true); setQaSelection(null); }}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    qaKind === k ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                  }`}
                >
                  {k === "BOOK" ? "Book" : k === "MOVIE" ? "Movie" : k === "SHOW" ? "TV Show" : "Game"}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500">Pick a type to start adding.</p>
          </Section>
        </div>
      </div>

      {/* Quick-Add Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add media">
          {/* Step 1: search & pick */}
          {!qaSelection ? (
            <div className="space-y-3">
              <select
                className="input w-full"
                value={qaKind}
                onChange={(e) => setQaKind(e.target.value as QuickKind)}
              >
                <option value="BOOK">Book</option>
                <option value="MOVIE">Movie</option>
                <option value="SHOW">TV Show</option>
                <option value="GAME">Game</option>
              </select>

              <MediaSearchBox
                kind={qaKind}
                placeholder="Search and pick…"
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
            <form onSubmit={quickAddSubmit} className="space-y-3">
              <div className="flex items-center gap-3">
                {qaSelection.posterUrl ? (
                  <img
                    src={qaSelection.posterUrl}
                    alt=""
                    width={56}
                    height={84}
                    className="rounded object-cover"
                  />
                ) : <div className="w-14 h-20 rounded bg-neutral-200" />}
                <div className="flex-1">
                  <div className="font-medium">
                    {qaSelection.title}{qaSelection.year ? ` (${qaSelection.year})` : ""}
                  </div>
                  <div className="text-xs text-neutral-500">{qaSelection.kind}</div>
                </div>
                <button type="button" className="text-xs underline" onClick={() => setQaSelection(null)}>
                  change
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-600">Your rating</label>
                <StarRating value={qaRating} onChange={setQaRating} />
              </div>

              <textarea
                className="input"
                placeholder="Your thoughts…"
                value={qaBody}
                onChange={(e) => setQaBody(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- Presentational helpers ---------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white px-4 py-3">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ state }: { state: string }) {
  return <p className="text-sm text-neutral-500">{state}</p>;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg border bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="text-sm underline" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Stars (half steps, safe gradient IDs) ---------- */

// read-only display (feed/lists)
function StarsDisplay({ value, small = false }: { value: number; small?: boolean }) {
  const uid = useId(); // unique per render tree
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className={`inline-flex ${small ? "scale-90" : ""}`} aria-label={`${value} stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const showHalf = i === full && half;
        return (
          <span key={i} className="relative inline-block w-4 h-4 mr-0.5">
            <StarOutline />
            {filled && <StarFill />}
            {showHalf && <StarHalf idSuffix={`${uid}-${i}`} />}
          </span>
        );
      })}
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0.5, Math.min(5, Math.round(pct * 10) / 2)); // 0.5 steps
    onChange(v);
  }

  return (
    <div
      className="inline-flex items-center cursor-pointer select-none"
      onClick={handleClick}
      role="slider"
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value}
    >
      <StarsDisplay value={value} />
      <span className="ml-2 text-sm text-neutral-600">{value.toFixed(1)}</span>
    </div>
  );
}

function StarOutline() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
    </svg>
  );
}
function StarFill() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 text-yellow-400" fill="currentColor">
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
    </svg>
  );
}
function StarHalf({ idSuffix }: { idSuffix: string }) {
  const gradId = `half-grad-${idSuffix}`;
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"
        fill={`url(#${gradId})`}
        stroke="#facc15"
      />
    </svg>
  );
}