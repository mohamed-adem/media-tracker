"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { SearchItem, MediaKind } from "@/types";

export default function MediaSearchBox({
  kind,
  onPick,
  placeholder = "Search movies, shows, games, books...",
}: {
  kind: MediaKind;
  onPick: (item: SearchItem) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const debounce = useMemo(() => {
    let t: ReturnType<typeof setTimeout>;
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
      {loading && <div className="text-xs text-text-tertiary">Searching...</div>}
      {items.length > 0 && (
        <ul className="rounded-xl border border-border bg-bg-elevated divide-y divide-border-muted overflow-hidden">
          {items.map((it) => (
            <li key={`${it.kind}-${it.externalId ?? it.title}`}>
              <button
                type="button"
                className="w-full text-left p-3 flex gap-3 items-center hover:bg-bg-hover transition-colors"
                onClick={() => onPick(it)}
              >
                {it.posterUrl ? (
                  <img src={it.posterUrl} alt="" width={40} height={60} className="w-10 h-14 rounded-lg object-cover flex-none" />
                ) : (
                  <div className="w-10 h-14 bg-bg-hover rounded-lg flex-none flex items-center justify-center text-text-tertiary">
                    🎬
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">
                    {it.title} {it.year ? `(${it.year})` : ""}
                  </div>
                  <div className="text-xs text-text-tertiary">{it.kind}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
