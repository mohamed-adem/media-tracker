"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import { StarsDisplay } from "@/app/components/StarRating";
import { useRequireAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { PublicProfile } from "@/types";

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const { loading: authLoading } = useRequireAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !params.userId) return;
    apiFetch<PublicProfile>(`/api/users/${params.userId}/profile`)
      .then(setProfile)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load this profile"));
  }, [authLoading, params.userId]);

  const ratedEntries = useMemo(
    () => profile?.entries.filter((entry) => entry.rating != null) ?? [],
    [profile]
  );

  if (authLoading || (!profile && !error)) {
    return <div className="card h-72 animate-pulse bg-bg-hover" aria-label="Loading profile" />;
  }

  if (error || !profile) {
    return <EmptyState icon="?" title="Profile unavailable" description={error ?? "This person could not be found."} action={<Link href="/friends" className="btn">Back to friends</Link>} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in-up">
      <Link href="/friends" className="inline-flex text-sm font-semibold text-text-secondary hover:text-accent">← Back to friends</Link>
      <section className="card-dark">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f58b76]">Public profile</p>
            <h1 className="mt-2 font-serif text-4xl text-paper sm:text-5xl">{profile.displayName}</h1>
            {profile.bio ? <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/65">{profile.bio}</p> : null}
            <p className="mt-3 text-xs text-paper/45">Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rule-title">
          <div><p className="eyebrow">Reviews</p><h2 className="mt-1 font-serif text-3xl">What {profile.displayName} thought</h2></div>
          <span className="text-sm text-text-tertiary">{ratedEntries.length}</span>
        </div>
        {ratedEntries.length === 0 ? (
          <EmptyState icon="☆" title="No public reviews yet" description="Public ratings and reviews will appear here." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ratedEntries.map((entry) => (
              <article key={entry.mediaId} className="card flex gap-4">
                <Link href={`/media/${entry.mediaId}`} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-bg-hover">
                  {entry.posterUrl ? <Image src={entry.posterUrl} alt={`${entry.title} poster`} fill sizes="80px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-2xl">{entry.kind === "BOOK" ? "📚" : entry.kind === "GAME" ? "🎮" : entry.kind === "SHOW" ? "📺" : "🎬"}</span>}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/media/${entry.mediaId}`} className="font-serif text-xl hover:text-accent">{entry.title}</Link>
                  <div className="mt-1"><StarsDisplay value={entry.rating!} /></div>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-text-secondary">{entry.reviewBody || "Left a rating without a written review."}</p>
                  {entry.reviewedAt ? <p className="mt-2 text-xs text-text-tertiary">{new Date(entry.reviewedAt).toLocaleDateString()}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
