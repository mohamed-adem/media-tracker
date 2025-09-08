"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api"; 

type SearchItem = {
  kind: "MOVIE" | "SHOW" | "GAME" | "BOOK";
  externalId: string | null;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

export default function MediaSearchBox({
  kind,
  onPick,
  placeholder = "Search movies, shows, games, books…",
}: {
  kind: "MOVIE" | "SHOW" | "GAME" | "BOOK";
  onPick: (item: SearchItem) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const debounce = useMemo(() => {
    let t: any;
    return (v: string, fn: (s: string) => void, ms = 300) => {
      clearTimeout(t);
      t = setTimeout(() => fn(v), ms);
    };
  }, []);

  useEffect(() => {
    if (!q.trim()) { setItems([]); return; }
    debounce(q, async (value) => {
      try {
        setLoading(true);
        const data = await apiFetch<SearchItem[]>(
          `/api/search?q=${encodeURIComponent(value)}&limit=8&kind=${encodeURIComponent(kind)}`
        );
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    });
  }, [q, kind, debounce]);

  return (
    <div className="space-y-2">
      <input
        className="input w-full"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />
      {loading && <div className="text-xs text-neutral-500">Searching…</div>}
      {items.length > 0 && (
        <ul className="rounded-lg border divide-y bg-white">
          {items.map((it) => (
            <li key={`${it.kind}-${it.externalId ?? it.title}`}>
              <button
                type="button"
                className="w-full text-left p-3 flex gap-3 items-center hover:bg-neutral-50"
                onClick={() => onPick(it)}
              >
                {it.posterUrl ? (
                  <img src={it.posterUrl} alt="" width={40} height={60} className="rounded object-cover" />
                ) : (
                  <div className="w-10 h-14 bg-neutral-200 rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {it.title} {it.year ? `(${it.year})` : ""}
                  </div>
                  <div className="text-xs text-neutral-500">{it.kind}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}