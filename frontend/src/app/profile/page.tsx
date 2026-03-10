"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, patchJSON } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { ProfileHeaderSkeleton } from "@/app/components/LoadingSkeleton";
import CollectionGrid from "@/app/components/CollectionGrid";
import type { Me, Review } from "@/types";

export default function ProfilePage() {
  const r = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const [u, mine] = await Promise.all([
          apiFetch<Me>("/api/users/me"),
          apiFetch<Review[]>("/api/reviews/me"),
        ]);
        setMe(u);
        setDisplayName(u.displayName);
        setBio(u.bio ?? "");
        setReviews(mine);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading]);

  const stats = useMemo(() => {
    const counts = { MOVIE: 0, SHOW: 0, GAME: 0, BOOK: 0 };
    let ratingSum = 0;
    for (const rv of reviews) {
      if (rv.kind && rv.kind in counts) counts[rv.kind] += 1;
      ratingSum += rv.rating;
    }
    return {
      total: reviews.length,
      avg: reviews.length ? (ratingSum / reviews.length).toFixed(1) : "0.0",
      movies: counts.MOVIE,
      shows: counts.SHOW,
      games: counts.GAME,
      since: me?.createdAt ? new Date(me.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "-",
    };
  }, [reviews, me?.createdAt]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const updated = await patchJSON<Me>("/api/users/me", {
        displayName: displayName.trim(),
        bio,
      });
      setMe(updated);
      setDisplayName(updated.displayName);
      setBio(updated.bio ?? "");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function doLogout() {
    logout();
    r.replace("/login");
  }

  if (authLoading) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {err && <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>}

      {loading || !me ? (
        <ProfileHeaderSkeleton />
      ) : (
        <form onSubmit={saveProfile} className="card-glass space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-bg-base text-2xl font-bold flex-none">
              {me.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                required
              />
              <div className="text-sm text-text-secondary">{me.email}</div>
              <textarea
                className="input min-h-[88px]"
                placeholder="Add a short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
            </div>
            <button className="btn" type="submit" disabled={saving || !displayName.trim()}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats.total.toString()} />
        <StatCard label="Avg" value={stats.avg} />
        <StatCard label="Movies" value={stats.movies.toString()} />
        <StatCard label="Shows" value={stats.shows.toString()} />
        <StatCard label="Games" value={stats.games.toString()} />
        <StatCard label="Since" value={stats.since} />
      </section>

      <section className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All your reviews</h2>
          <span className="text-xs text-text-tertiary">{reviews.length} items</span>
        </div>
        <CollectionGrid reviews={reviews} loading={loading} />
      </section>

      <div className="flex justify-center">
        <button className="btn-danger" onClick={doLogout}>
          Log out
        </button>
      </div>
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
