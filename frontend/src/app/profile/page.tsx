"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, patchJSON } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { ProfileHeaderSkeleton } from "@/app/components/LoadingSkeleton";
import CollectionGrid from "@/app/components/CollectionGrid";
import { StarsDisplay } from "@/app/components/StarRating";
import type { LibraryEntry, Me } from "@/types";

export default function ProfilePage() {
  const r = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
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
          apiFetch<LibraryEntry[]>("/api/library"),
        ]);
        setMe(u);
        setDisplayName(u.displayName);
        setBio(u.bio ?? "");
        setEntries(mine);
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
    let ratedCount = 0;
    for (const entry of entries) {
      if (entry.kind in counts) counts[entry.kind] += 1;
      if (entry.rating != null) {
        ratingSum += entry.rating;
        ratedCount += 1;
      }
    }
    return {
      total: entries.length,
      avg: ratedCount ? (ratingSum / ratedCount).toFixed(1) : "-",
      movies: counts.MOVIE,
      shows: counts.SHOW,
      games: counts.GAME,
      since: me?.createdAt ? new Date(me.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "-",
    };
  }, [entries, me?.createdAt]);

  const reviewedEntries = useMemo(
    () => entries.filter((entry) => entry.rating != null),
    [entries]
  );

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
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <div className="border-b border-ink/15 pb-6">
        <p className="eyebrow">Your corner</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Profile and taste.</h1>
        <p className="mt-2 text-sm text-text-secondary">Keep your identity simple; let the library do most of the talking.</p>
      </div>
      {err && <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>}

      {loading || !me ? (
        <ProfileHeaderSkeleton />
      ) : (
        <form onSubmit={saveProfile} className="card-dark space-y-5">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-accent text-3xl font-bold text-white">
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
              <div className="text-sm text-paper/50">{me.email}</div>
              <textarea
                className="input min-h-[88px] !border-white/15 !bg-white/10 !text-paper placeholder:!text-paper/40"
                placeholder="Add a short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
            </div>
            <button className="btn !bg-paper !text-ink !shadow-none hover:!bg-accent hover:!text-white" type="submit" disabled={saving || !displayName.trim()}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={stats.total.toString()} />
        <StatCard label="Avg" value={stats.avg} />
        <StatCard label="Movies" value={stats.movies.toString()} />
        <StatCard label="Shows" value={stats.shows.toString()} />
        <StatCard label="Games" value={stats.games.toString()} />
        <StatCard label="Since" value={stats.since} />
      </section>

      <section className="space-y-5">
        <div className="rule-title">
          <div>
            <p className="eyebrow">Written by you</p>
            <h2 className="mt-1 font-serif text-3xl">Your reviews</h2>
          </div>
          <span className="text-xs text-text-tertiary">{reviewedEntries.length} rated</span>
        </div>
        {reviewedEntries.length === 0 ? (
          <div className="card text-sm text-text-secondary">Your ratings and reviews will appear here after you finish a title.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviewedEntries.map((entry) => (
              <article key={entry.id} className="card !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/media/${entry.mediaId}`} className="font-serif text-xl text-text-primary hover:text-accent">{entry.title}</Link>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-text-tertiary">{entry.kind}{entry.year ? ` · ${entry.year}` : ""}</p>
                  </div>
                  <StarsDisplay value={entry.rating!} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">{entry.reviewBody || "You rated this without writing a review."}</p>
                <Link href={`/media/${entry.mediaId}`} className="mt-3 inline-flex text-xs font-semibold text-accent hover:underline">View or edit review →</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="rule-title">
          <div>
            <p className="eyebrow">Collected</p>
            <h2 className="mt-1 font-serif text-3xl">Your full library</h2>
          </div>
          <span className="text-xs text-text-tertiary">{entries.length} items</span>
        </div>
        <CollectionGrid
          entries={entries}
          loading={loading}
          onEntryUpdated={(updated) => setEntries((previous) => previous.map((entry) => entry.id === updated.id ? updated : entry))}
          onEntryDeleted={(entryId) => setEntries((previous) => previous.filter((entry) => entry.id !== entryId))}
        />
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
    <div className="card !p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="mt-1 font-serif text-3xl text-text-primary">{value}</div>
    </div>
  );
}
