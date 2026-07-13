"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { MediaDetail, MediaList } from "@/types";

export default function MediaListMembership({ media }: { media: MediaDetail }) {
  const [lists, setLists] = useState<MediaList[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyListId, setBusyListId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MediaList[]>("/api/lists")
      .then(setLists)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load your lists"))
      .finally(() => setLoading(false));
  }, []);

  async function toggleMembership(list: MediaList) {
    const existing = list.items.find((item) => item.mediaId === media.mediaId);
    setBusyListId(list.id);
    setError(null);
    try {
      if (existing) {
        await apiFetch<void>(`/api/lists/${list.id}/items/${existing.id}`, { method: "DELETE" });
        setLists((current) => current.map((candidate) => candidate.id === list.id
          ? { ...candidate, items: candidate.items.filter((item) => item.id !== existing.id) }
          : candidate));
      } else {
        const updated = await apiFetch<MediaList>(`/api/lists/${list.id}/items`, {
          method: "POST",
          body: JSON.stringify({
            kind: media.kind,
            externalId: media.externalId,
            title: media.title,
            year: media.year,
            posterUrl: media.posterUrl,
          }),
        });
        setLists((current) => current.map((candidate) => candidate.id === list.id ? updated : candidate));
      }
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not update this list");
    } finally {
      setBusyListId(null);
    }
  }

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3">
        <div><p className="eyebrow">Lists</p><h2 className="mt-1 font-serif text-2xl">Add to a list</h2></div>
        <Link href="/lists" className="text-sm font-semibold text-text-secondary hover:text-accent">Manage lists</Link>
      </div>
      {error ? <p className="mt-4 rounded-xl bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-text-tertiary">Loading lists…</p> : lists.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">You do not have any lists yet. <Link href="/lists" className="font-semibold text-accent">Create one</Link></p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {lists.map((list) => {
            const included = list.items.some((item) => item.mediaId === media.mediaId);
            return (
              <button
                key={list.id}
                className={included ? "btn" : "btn-outline"}
                type="button"
                disabled={busyListId === list.id}
                onClick={() => void toggleMembership(list)}
                aria-pressed={included}
              >
                {busyListId === list.id ? "Saving…" : included ? `✓ ${list.name}` : list.name}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
