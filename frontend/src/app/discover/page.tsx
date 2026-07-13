"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import { useQuickAdd } from "@/app/components/QuickAddProvider";
import { useRequireAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { Recommendation } from "@/types";

export default function DiscoverPage() {
  const { loading: authLoading } = useRequireAuth();
  const quickAdd = useQuickAdd();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    apiFetch<Recommendation[]>("/api/recommendations?limit=12")
      .then(setItems)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load recommendations"))
      .finally(() => setLoading(false));
  }, [authLoading]);

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="card-dark overflow-hidden">
        <p className="eyebrow !text-[#f58b76]">For you</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl sm:text-5xl">What your friends liked.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-paper/65">These picks come from friends’ public ratings. Titles already in your library are left out.</p>
      </section>

      {error ? <div className="rounded-xl bg-danger-muted px-4 py-3 text-sm text-danger">{error}</div> : null}
      {loading ? <p className="text-sm text-text-tertiary">Loading suggestions…</p> : items.length === 0 ? (
        <EmptyState icon="✦" title="Nothing to suggest yet" description="Add a friend who has shared ratings, then check back here." />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.mediaId} className="card flex flex-col overflow-hidden !p-0">
              <div className="relative aspect-[16/10] bg-bg-hover">
                {item.posterUrl ? <Image src={item.posterUrl} alt={`${item.title} artwork`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">✦</div>}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow">{item.kind}{item.year ? ` · ${item.year}` : ""}</p>
                <h2 className="mt-2 font-serif text-2xl"><Link href={`/media/${item.mediaId}`} className="hover:text-accent">{item.title}</Link></h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-text-secondary"><span className="font-semibold text-text-primary">Why it’s here:</span> {item.reason}.</p>
                <button className="btn mt-5 !w-full" onClick={() => quickAdd?.openQuickAdd(item.kind, item)}>Add to library</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
