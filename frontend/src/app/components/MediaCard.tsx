"use client";

import { useEffect, useState } from "react";
import { StarRating, StarsDisplay } from "./StarRating";
import type { LibraryEntry, LibraryStatus } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { apiFetch, patchJSON } from "@/lib/api";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const STATUS_LABELS: Record<LibraryStatus, string> = {
  PLANNED: "Want to start",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

export default function MediaCard({
  entry,
  onEntryUpdated,
  onEntryDeleted,
  showArtwork = true,
}: {
  entry: LibraryEntry;
  onEntryUpdated?: (entry: LibraryEntry) => void;
  onEntryDeleted?: (entryId: string) => void;
  showArtwork?: boolean;
}) {
  const [status, setStatus] = useState(entry.status);
  const [progressCurrent, setProgressCurrent] = useState(entry.progressCurrent?.toString() ?? "");
  const [progressTotal, setProgressTotal] = useState(entry.progressTotal?.toString() ?? "");
  const [privateEntry, setPrivateEntry] = useState(entry.privateEntry);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(entry.rating ?? 5);
  const [reviewBody, setReviewBody] = useState(entry.reviewBody ?? "");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const hasProgress = entry.progressCurrent != null || entry.progressTotal != null;

  useEffect(() => {
    setStatus(entry.status);
    setProgressCurrent(entry.progressCurrent?.toString() ?? "");
    setProgressTotal(entry.progressTotal?.toString() ?? "");
    setPrivateEntry(entry.privateEntry);
    setRating(entry.rating ?? 5);
    setReviewBody(entry.reviewBody ?? "");
  }, [entry]);

  async function updateEntry(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await patchJSON<LibraryEntry>(`/api/library/${entry.id}`, {
        status,
        progressCurrent: progressCurrent === "" ? null : Number(progressCurrent),
        progressTotal: progressTotal === "" ? null : Number(progressTotal),
        privateEntry,
      });
      onEntryUpdated?.(updated);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not update this entry");
    } finally {
      setBusy(false);
    }
  }

  async function saveReview(event: React.FormEvent) {
    event.preventDefault();
    setReviewBusy(true);
    setReviewError(null);
    try {
      const updated = await apiFetch<LibraryEntry>(`/api/library/${entry.id}/review`, {
        method: "PUT",
        body: JSON.stringify({ rating, body: reviewBody || null }),
      });
      onEntryUpdated?.(updated);
    } catch (caught: unknown) {
      setReviewError(caught instanceof Error ? caught.message : "Could not save this review");
    } finally {
      setReviewBusy(false);
    }
  }

  async function deleteEntry() {
    if (!window.confirm(`Remove ${entry.title} and its review from your library?`)) return;
    setDeleteBusy(true);
    setError(null);
    try {
      await apiFetch<void>(`/api/library/${entry.id}`, { method: "DELETE" });
      onEntryDeleted?.(entry.id);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not remove this entry");
      setDeleteBusy(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-ink/15 bg-bg-surface shadow-[0_12px_30px_rgba(49,42,32,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(49,42,32,0.14)]">
      {showArtwork ? <Link href={`/media/${entry.mediaId}`} className="relative block aspect-[2/3] overflow-hidden bg-bg-hover" aria-label={`View ${entry.title}`}>
        {entry.posterUrl ? (
          <Image src={entry.posterUrl} alt={`${entry.title} poster`} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 190px" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
        ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl text-text-tertiary">
          {entry.kind === "BOOK" ? "📚" : entry.kind === "GAME" ? "🎮" : entry.kind === "SHOW" ? "📺" : "🎬"}
        </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-paper backdrop-blur">{entry.kind}</span>
        {entry.privateEntry && <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">Private</span>}
      </Link> : null}
      <div className="space-y-2.5 p-4">
        <div>
          <h3 className="truncate font-serif text-lg leading-tight text-text-primary">
            <Link href={`/media/${entry.mediaId}`} className="hover:text-accent">{entry.title}</Link>
          </h3>
          {entry.year && <p className="mt-0.5 text-xs text-text-tertiary">{entry.year}</p>}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-accent">{STATUS_LABELS[entry.status]}</span>
          <span className="text-text-tertiary">{timeAgo(entry.updatedAt)}</span>
        </div>
        {entry.rating != null && <StarsDisplay value={entry.rating} small />}
        {hasProgress && (
          <p className="text-xs text-text-secondary">
            Progress: {entry.progressCurrent ?? 0}{entry.progressTotal != null ? ` / ${entry.progressTotal}` : ""}
          </p>
        )}
        <details className="border-t border-ink/10 pt-2 text-sm">
          <summary className="cursor-pointer font-semibold text-text-secondary">Update entry</summary>
          <form className="mt-3 space-y-2" onSubmit={updateEntry}>
            <select className="input !py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value as LibraryStatus)} aria-label={`Status for ${entry.title}`}>
              <option value="PLANNED">Want to start</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAUSED">Paused</option>
              <option value="DROPPED">Dropped</option>
            </select>
            {(status === "IN_PROGRESS" || status === "PAUSED") && (
              <div className="grid grid-cols-2 gap-2">
                <input className="input !py-2 text-sm" type="number" min="0" step="0.1" placeholder="Current" value={progressCurrent} onChange={(event) => setProgressCurrent(event.target.value)} aria-label={`Current progress for ${entry.title}`} />
                <input className="input !py-2 text-sm" type="number" min="0.1" step="0.1" placeholder="Total" value={progressTotal} onChange={(event) => setProgressTotal(event.target.value)} aria-label={`Total progress for ${entry.title}`} />
              </div>
            )}
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <input type="checkbox" checked={privateEntry} onChange={(event) => setPrivateEntry(event.target.checked)} />
              Private entry
            </label>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button className="btn !w-full !py-2 text-sm" type="submit" disabled={busy}>{busy ? "Saving..." : "Save update"}</button>
          </form>
          {entry.status === "COMPLETED" && (
            <form className="mt-4 space-y-2 border-t border-ink/10 pt-4" onSubmit={saveReview}>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {entry.rating == null ? "Add your review" : "Edit your review"}
              </p>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                className="input min-h-20 text-sm"
                maxLength={4000}
                placeholder="Write a short review (optional)"
                value={reviewBody}
                onChange={(event) => setReviewBody(event.target.value)}
              />
              {reviewError && <p className="text-xs text-danger">{reviewError}</p>}
              <button className="btn-outline !w-full !py-2 text-sm" type="submit" disabled={reviewBusy}>
                {reviewBusy ? "Saving review..." : entry.rating == null ? "Add review" : "Update review"}
              </button>
            </form>
          )}
          <button
            className="mt-4 w-full rounded-xl px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger-muted"
            type="button"
            onClick={deleteEntry}
            disabled={deleteBusy}
          >
            {deleteBusy ? "Removing..." : "Remove from library"}
          </button>
        </details>
      </div>
    </article>
  );
}
