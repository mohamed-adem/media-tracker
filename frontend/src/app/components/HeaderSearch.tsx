"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useQuickAdd } from "./QuickAddProvider";
import type { SearchItem, MediaKind } from "@/types";

export default function HeaderSearch() {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const quickAdd = useQuickAdd();

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setQ("");
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  // Debounced search
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiFetch<SearchItem[]>(
          `/api/search?q=${encodeURIComponent(q)}&limit=6&kind=ALL`
        );
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  function pick(item: SearchItem) {
    setExpanded(false);
    setQ("");
    setResults([]);
    quickAdd?.openQuickAdd(item.kind as MediaKind, item);
  }

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="btn-ghost !p-2" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        className="input !w-48 sm:!w-64 !py-1.5 !text-sm"
        placeholder="Search media..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setExpanded(false);
            setQ("");
            setResults([]);
          }
        }}
      />

      {/* Dropdown */}
      {(results.length > 0 || loading) && (
        <div className="absolute top-full mt-2 right-0 w-72 sm:w-80 rounded-xl border border-border bg-bg-elevated shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden z-50">
          {loading && <div className="p-3 text-xs text-text-tertiary">Searching...</div>}
          {results.map((it) => (
            <button
              key={`${it.kind}-${it.externalId ?? it.title}`}
              className="w-full text-left p-3 flex gap-3 items-center hover:bg-bg-hover transition-colors"
              onClick={() => pick(it)}
            >
              {it.posterUrl ? (
                <img src={it.posterUrl} alt="" className="w-8 h-12 rounded-md object-cover flex-none" />
              ) : (
                <div className="w-8 h-12 bg-bg-hover rounded-md flex-none flex items-center justify-center text-text-tertiary text-xs">🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {it.title} {it.year ? `(${it.year})` : ""}
                </div>
                <div className="text-xs text-text-tertiary">{it.kind}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
