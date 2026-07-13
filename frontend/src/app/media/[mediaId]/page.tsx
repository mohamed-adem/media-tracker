"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import MediaCard from "@/app/components/MediaCard";
import MediaListMembership from "@/app/components/MediaListMembership";
import { StarsDisplay } from "@/app/components/StarRating";
import { useQuickAdd } from "@/app/components/QuickAddProvider";
import { useRequireAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { LibraryEntry, MediaDetail } from "@/types";

const KIND_LABELS = {
  MOVIE: "Movie",
  SHOW: "TV show",
  GAME: "Game",
  BOOK: "Book",
} as const;

export default function MediaDetailPage() {
  const params = useParams<{ mediaId: string }>();
  const { loading: authLoading } = useRequireAuth();
  const quickAdd = useQuickAdd();
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !params.mediaId) return;
    setLoading(true);
    apiFetch<MediaDetail>(`/api/media/${params.mediaId}`)
      .then(setDetail)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load this title"))
      .finally(() => setLoading(false));
  }, [authLoading, params.mediaId]);

  useEffect(() => {
    if (!quickAdd) return;
    return quickAdd.onEntrySaved((entry) => {
      if (entry.mediaId === params.mediaId) {
        setDetail((current) => current ? { ...current, libraryEntry: entry } : current);
      }
    });
  }, [params.mediaId, quickAdd]);

  if (authLoading || loading) {
    return <div className="card h-80 animate-pulse bg-bg-hover" aria-label="Loading title" />;
  }

  if (error || !detail) {
    return (
      <EmptyState
        icon="?"
        title="This title could not be loaded"
        description={error ?? "It may have been removed."}
        action={<Link href="/dashboard" className="btn">Back to library</Link>}
      />
    );
  }

  function updateEntry(entry: LibraryEntry) {
    setDetail((current) => current ? { ...current, libraryEntry: entry } : current);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Link href="/dashboard" className="inline-flex text-sm font-semibold text-text-secondary hover:text-accent">← Back to library</Link>

      <section className="overflow-hidden rounded-[1.6rem] border border-ink/15 bg-ink text-paper shadow-[0_18px_50px_rgba(29,28,25,0.2)]">
        <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="relative aspect-[16/9] bg-white/5 md:aspect-auto md:min-h-[22rem]">
            {detail.posterUrl ? (
              <Image src={detail.posterUrl} alt={`${detail.title} poster`} fill priority sizes="(max-width: 768px) 100vw, 240px" className="object-contain md:object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl" aria-hidden="true">
                {detail.kind === "BOOK" ? "📚" : detail.kind === "GAME" ? "🎮" : detail.kind === "SHOW" ? "📺" : "🎬"}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-end p-6 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-paper/55">
              {KIND_LABELS[detail.kind]}{detail.year ? ` · ${detail.year}` : ""}
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">{detail.title}</h1>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {detail.libraryEntry ? (
                <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">In your library</span>
              ) : (
                <button className="btn !bg-paper !text-ink !shadow-none hover:!bg-accent hover:!text-white" onClick={() => quickAdd?.openQuickAdd(detail.kind, detail)}>
                  Add to library
                </button>
              )}
              {detail.friendReviews.length > 0 ? (
                <span className="text-sm text-paper/60">{detail.friendReviews.length} friend {detail.friendReviews.length === 1 ? "review" : "reviews"}</span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className={`grid items-start gap-8 ${detail.libraryEntry ? "lg:grid-cols-[18rem_minmax(0,1fr)]" : ""}`}>
        {detail.libraryEntry ? (
          <section>
            <div className="mb-4 border-b border-ink/15 pb-3">
              <p className="eyebrow">Your library</p>
              <h2 className="mt-1 font-serif text-2xl">Your entry</h2>
            </div>
            <MediaCard
              entry={detail.libraryEntry}
              showArtwork={false}
              onEntryUpdated={updateEntry}
              onEntryDeleted={() => setDetail((current) => current ? { ...current, libraryEntry: null } : current)}
            />
          </section>
        ) : null}

        <div className="space-y-8">
          <MediaListMembership media={detail} />
          <section className="space-y-4">
            <div className="rule-title">
              <div>
                <p className="eyebrow">Friends</p>
                <h2 className="mt-1 font-serif text-3xl">What they thought</h2>
              </div>
            </div>
            {detail.friendReviews.length === 0 ? (
              <EmptyState icon="👥" title="No friend reviews yet" description="When a friend shares a rating for this title, it will appear here." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {detail.friendReviews.map((review) => (
                  <article key={review.reviewId} className="card">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{review.author}</h3>
                      <StarsDisplay value={review.rating} small />
                    </div>
                    {review.body ? <p className="mt-4 text-sm leading-6 text-text-secondary">{review.body}</p> : <p className="mt-4 text-sm text-text-tertiary">Left a rating without a written review.</p>}
                    <p className="mt-4 text-xs text-text-tertiary">Updated {new Date(review.updatedAt).toLocaleDateString()}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
