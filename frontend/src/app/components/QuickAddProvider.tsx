"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import Modal from "./Modal";
import MediaSearchBox from "./MediaSearchBox";
import { StarRating } from "./StarRating";
import { apiFetch } from "@/lib/api";
import type { MediaKind, Review, SearchItem } from "@/types";

type QuickAddContextType = {
  openQuickAdd: (kind?: MediaKind, preselected?: SearchItem) => void;
  onReviewCreated: (cb: (review: Review) => void) => (() => void);
};

const QuickAddContext = createContext<QuickAddContextType | null>(null);
export const useQuickAdd = () => useContext(QuickAddContext);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [kind, setKind] = useState<MediaKind>("MOVIE");
  const [selection, setSelection] = useState<{
    kind: MediaKind;
    externalId: string | null;
    title: string;
    year: number | null;
    posterUrl: string | null;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  const listenersRef = useRef<Set<(review: Review) => void>>(new Set());

  const openQuickAdd = useCallback((k?: MediaKind, preselected?: SearchItem) => {
    const nextKind = preselected?.kind ?? k ?? "MOVIE";
    setKind(nextKind);
    if (preselected) {
      setSelection({
        kind: preselected.kind,
        externalId: preselected.externalId,
        title: preselected.title,
        year: preselected.year ?? null,
        posterUrl: preselected.posterUrl ?? null,
      });
    } else {
      setSelection(null);
    }
    setRating(5);
    setBody("");
    setShow(true);
  }, []);

  const onReviewCreated = useCallback((cb: (review: Review) => void) => {
    listenersRef.current.add(cb);
    return () => { listenersRef.current.delete(cb); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selection) return;
    try {
      const payload: Record<string, unknown> = {
        kind: selection.kind,
        title: selection.title,
        year: selection.year,
        rating: Number(rating),
        body: body || null,
        posterUrl: selection.posterUrl ?? null,
      };
      if (selection.externalId) payload.externalId = selection.externalId;

      const created = await apiFetch<Review>("/api/reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      listenersRef.current.forEach((cb) => cb(created));
      setShow(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create review");
    }
  }

  return (
    <QuickAddContext.Provider value={{ openQuickAdd, onReviewCreated }}>
      {children}

      {show && (
        <Modal onClose={() => setShow(false)} title="Add media">
          {!selection ? (
            <div className="space-y-3">
              <select className="input" value={kind} onChange={(e) => setKind(e.target.value as MediaKind)}>
                <option value="MOVIE">Movie</option>
                <option value="SHOW">TV Show</option>
                <option value="GAME">Game</option>
                <option value="BOOK">Book</option>
              </select>
              <MediaSearchBox
                kind={kind}
                placeholder="Search and pick..."
                onPick={(it) => {
                  setSelection({
                    kind: (it.kind ?? kind) as MediaKind,
                    externalId: it.externalId,
                    title: it.title,
                    year: it.year ?? null,
                    posterUrl: it.posterUrl ?? null,
                  });
                }}
              />
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center gap-3">
                {selection.posterUrl ? (
                  <img src={selection.posterUrl} alt="" className="w-14 h-20 rounded-lg object-cover flex-none" />
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-bg-hover flex-none flex items-center justify-center text-text-tertiary text-xl">🎬</div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {selection.title}{selection.year ? ` (${selection.year})` : ""}
                  </div>
                  <div className="text-xs text-text-tertiary">{selection.kind}</div>
                </div>
                <button type="button" className="btn-ghost text-xs" onClick={() => setSelection(null)}>Change</button>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Your rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea className="input min-h-[80px]" placeholder="Your thoughts..." value={body} onChange={(e) => setBody(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setShow(false)}>Cancel</button>
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </QuickAddContext.Provider>
  );
}
