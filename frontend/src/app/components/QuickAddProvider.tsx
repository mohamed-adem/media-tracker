"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import Modal from "./Modal";
import MediaSearchBox from "./MediaSearchBox";
import { StarRating } from "./StarRating";
import { apiFetch } from "@/lib/api";
import type { LibraryEntry, LibraryStatus, MediaKind, SearchItem } from "@/types";
import Image from "next/image";

type QuickAddContextType = {
  openQuickAdd: (kind?: MediaKind, preselected?: SearchItem) => void;
  onEntrySaved: (cb: (entry: LibraryEntry) => void) => (() => void);
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
  const [status, setStatus] = useState<LibraryStatus>("PLANNED");
  const [progressCurrent, setProgressCurrent] = useState("");
  const [progressTotal, setProgressTotal] = useState("");
  const [privateEntry, setPrivateEntry] = useState(false);
  const [addReview, setAddReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listenersRef = useRef<Set<(entry: LibraryEntry) => void>>(new Set());

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
    setStatus("PLANNED");
    setProgressCurrent("");
    setProgressTotal("");
    setPrivateEntry(false);
    setAddReview(false);
    setError(null);
    setShow(true);
  }, []);

  const onEntrySaved = useCallback((cb: (entry: LibraryEntry) => void) => {
    listenersRef.current.add(cb);
    return () => { listenersRef.current.delete(cb); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selection) return;
    setBusy(true);
    setError(null);
    try {
      const entry = await apiFetch<LibraryEntry>("/api/library", {
        method: "POST",
        body: JSON.stringify({
          kind: selection.kind,
          externalId: selection.externalId,
          title: selection.title,
          year: selection.year,
          posterUrl: selection.posterUrl,
          status,
          progressCurrent: progressCurrent === "" ? null : Number(progressCurrent),
          progressTotal: progressTotal === "" ? null : Number(progressTotal),
          privateEntry,
          rating: addReview ? Number(rating) : null,
          reviewBody: addReview ? body || null : null,
        }),
      });
      listenersRef.current.forEach((cb) => cb(entry));
      setShow(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save this media");
    } finally {
      setBusy(false);
    }
  }

  return (
    <QuickAddContext.Provider value={{ openQuickAdd, onEntrySaved }}>
      {children}

      {show && (
        <Modal onClose={() => setShow(false)} title="Add to library">
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
                  <div className="relative h-20 w-14 flex-none overflow-hidden rounded-xl">
                    <Image src={selection.posterUrl} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-bg-hover flex-none flex items-center justify-center text-text-tertiary text-xl">🎬</div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {selection.title}{selection.year ? ` (${selection.year})` : ""}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-text-tertiary">{selection.kind}</div>
                </div>
                <button type="button" className="btn-ghost text-xs" onClick={() => setSelection(null)}>Change</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Library status
                  <select
                    className="input mt-1 normal-case tracking-normal"
                    value={status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as LibraryStatus;
                      setStatus(nextStatus);
                      if (nextStatus !== "COMPLETED") setAddReview(false);
                    }}
                  >
                    <option value="PLANNED">Want to start</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 self-end rounded-xl border border-ink/15 px-3 py-3 text-sm text-text-secondary">
                  <input type="checkbox" checked={privateEntry} onChange={(event) => setPrivateEntry(event.target.checked)} />
                  Keep this entry private
                </label>
              </div>
              {(status === "IN_PROGRESS" || status === "PAUSED") && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Current progress
                    <input className="input mt-1" type="number" min="0" step="0.1" value={progressCurrent} onChange={(event) => setProgressCurrent(event.target.value)} />
                  </label>
                  <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Total, if known
                    <input className="input mt-1" type="number" min="0.1" step="0.1" value={progressTotal} onChange={(event) => setProgressTotal(event.target.value)} />
                  </label>
                </div>
              )}
              {status === "COMPLETED" && (
                <label className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-3 text-sm font-semibold text-text-primary">
                  <input type="checkbox" checked={addReview} onChange={(event) => setAddReview(event.target.checked)} />
                  Add a rating and review now
                </label>
              )}
              {addReview && (
                <>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Your rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea className="input min-h-[80px]" placeholder="Your thoughts..." value={body} onChange={(e) => setBody(e.target.value)} />
                </>
              )}
              {error && <div className="rounded-lg bg-danger-muted px-3 py-2 text-sm text-danger">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setShow(false)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn" disabled={busy}>{busy ? "Saving..." : "Add to library"}</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </QuickAddContext.Provider>
  );
}
