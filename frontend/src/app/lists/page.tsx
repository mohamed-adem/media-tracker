"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import MediaSearchBox from "@/app/components/MediaSearchBox";
import { useRequireAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { MediaKind, MediaList, MediaListItem, SearchItem } from "@/types";

export default function ListsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [lists, setLists] = useState<MediaList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privateList, setPrivateList] = useState(true);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<MediaKind | "ALL">("ALL");
  const [busy, setBusy] = useState(false);
  const [itemBusy, setItemBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    apiFetch<MediaList[]>("/api/lists")
      .then((data) => {
        setLists(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load lists"));
  }, [authLoading]);

  const selected = useMemo(() => lists.find((list) => list.id === selectedId) ?? null, [lists, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setEditName(selected.name);
    setEditDescription(selected.description ?? "");
    setEditing(false);
  }, [selected]);

  function replaceList(updated: MediaList) {
    setLists((current) => current.map((list) => list.id === updated.id ? updated : list));
  }

  async function createList(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await apiFetch<MediaList>("/api/lists", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null, privateList }),
      });
      setLists((current) => [created, ...current]);
      setSelectedId(created.id);
      setName("");
      setDescription("");
      setPrivateList(true);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not create list");
    } finally {
      setBusy(false);
    }
  }

  async function saveListDetails(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiFetch<MediaList>(`/api/lists/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      replaceList(updated);
      setEditing(false);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not save this list");
    } finally {
      setBusy(false);
    }
  }

  async function addItem(item: SearchItem) {
    if (!selected) return;
    setError(null);
    try {
      const updated = await apiFetch<MediaList>(`/api/lists/${selected.id}/items`, {
        method: "POST",
        body: JSON.stringify(item),
      });
      replaceList(updated);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not add this item");
    }
  }

  async function removeItem(itemId: string) {
    if (!selected) return;
    setItemBusy(itemId);
    setError(null);
    try {
      await apiFetch<void>(`/api/lists/${selected.id}/items/${itemId}`, { method: "DELETE" });
      setLists((current) => current.map((list) => list.id === selected.id
        ? { ...list, items: list.items.filter((item) => item.id !== itemId).map((item, index) => ({ ...item, position: index })) }
        : list));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not remove this item");
    } finally {
      setItemBusy(null);
    }
  }

  async function saveNote(itemId: string, note: string) {
    if (!selected) return;
    setItemBusy(itemId);
    setError(null);
    try {
      const updated = await apiFetch<MediaList>(`/api/lists/${selected.id}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      });
      replaceList(updated);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not save this note");
    } finally {
      setItemBusy(null);
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    if (!selected) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.items.length) return;
    const reordered = [...selected.items];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setItemBusy(reordered[nextIndex].id);
    setError(null);
    try {
      const updated = await apiFetch<MediaList>(`/api/lists/${selected.id}/items/order`, {
        method: "PUT",
        body: JSON.stringify({ itemIds: reordered.map((item) => item.id) }),
      });
      replaceList(updated);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not reorder this list");
    } finally {
      setItemBusy(null);
    }
  }

  async function togglePrivacy() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiFetch<MediaList>(`/api/lists/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ privateList: !selected.privateList }),
      });
      replaceList(updated);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not update this list");
    } finally {
      setBusy(false);
    }
  }

  async function deleteList() {
    if (!selected || !window.confirm(`Delete ${selected.name}? This removes the list, not the media in your library.`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch<void>(`/api/lists/${selected.id}`, { method: "DELETE" });
      const remaining = lists.filter((list) => list.id !== selected.id);
      setLists(remaining);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not delete this list");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="card-dark">
          <p className="eyebrow !text-[#f58b76]">Lists</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Keep related titles together.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-paper/65">Make a weekend watchlist, a reading list, or a shortlist of games to play next.</p>
        </div>
        <form className="card space-y-3" onSubmit={createList}>
          <h2 className="font-serif text-2xl">Create a list</h2>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Name<input className="input mt-1" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Description<textarea className="input mt-1 min-h-20" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={privateList} onChange={(event) => setPrivateList(event.target.checked)} /> Keep this list private</label>
          <button className="btn !w-full" disabled={busy}>{busy ? "Creating…" : "Create list"}</button>
        </form>
      </section>

      {error ? <div className="rounded-xl bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</div> : null}
      {lists.length === 0 ? <EmptyState icon="☷" title="No lists yet" description="Create a list for titles you want to keep together." /> : (
        <section className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav className="card space-y-2" aria-label="Your lists">
            {lists.map((list) => (
              <button key={list.id} onClick={() => setSelectedId(list.id)} className={`w-full rounded-xl px-4 py-3 text-left transition ${selectedId === list.id ? "bg-ink text-paper" : "hover:bg-bg-hover"}`}>
                <span className="block font-semibold">{list.name}</span>
                <span className={`text-xs ${selectedId === list.id ? "text-paper/60" : "text-text-tertiary"}`}>{list.items.length} {list.items.length === 1 ? "item" : "items"} · {list.privateList ? "Private" : "Shared"}</span>
              </button>
            ))}
          </nav>

          {selected ? <div className="space-y-5">
            {editing ? (
              <form className="card space-y-3" onSubmit={saveListDetails}>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Name<input className="input mt-1" required maxLength={80} value={editName} onChange={(event) => setEditName(event.target.value)} /></label>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Description<textarea className="input mt-1 min-h-20" maxLength={500} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label>
                <div className="flex justify-end gap-2"><button className="btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
              </form>
            ) : (
              <div className="rule-title">
                <div><p className="eyebrow">{selected.privateList ? "Private list" : "Shared list"}</p><h2 className="mt-1 font-serif text-3xl">{selected.name}</h2>{selected.description ? <p className="mt-2 text-sm text-text-secondary">{selected.description}</p> : null}</div>
                <div className="flex flex-wrap gap-2"><button className="btn-outline" onClick={() => setEditing(true)}>Edit</button><button className="btn-outline" onClick={togglePrivacy} disabled={busy}>Make {selected.privateList ? "shared" : "private"}</button><button className="btn-danger" onClick={deleteList} disabled={busy}>Delete</button></div>
              </div>
            )}

            <div className="card space-y-3">
              <p className="text-sm font-semibold">Add a title</p>
              <div className="flex flex-wrap gap-2">
                <select className="input !w-auto" value={kind} onChange={(event) => setKind(event.target.value as MediaKind | "ALL")} aria-label="Media type to search"><option value="ALL">All media</option><option value="MOVIE">Movies</option><option value="SHOW">Shows</option><option value="GAME">Games</option><option value="BOOK">Books</option></select>
                <div className="min-w-64 flex-1"><MediaSearchBox kind={kind} onPick={addItem} placeholder={`Add to ${selected.name}…`} /></div>
              </div>
            </div>

            {selected.items.length === 0 ? <EmptyState icon="＋" title="This list is empty" description="Search above to add its first movie, show, game, or book." /> : (
              <div className="grid gap-3 xl:grid-cols-2">
                {selected.items.map((item, index) => (
                  <ListItemCard key={item.id} item={item} index={index} count={selected.items.length} busy={itemBusy === item.id} onMove={moveItem} onSaveNote={saveNote} onRemove={removeItem} />
                ))}
              </div>
            )}
          </div> : null}
        </section>
      )}
    </div>
  );
}

function ListItemCard({ item, index, count, busy, onMove, onSaveNote, onRemove }: {
  item: MediaListItem;
  index: number;
  count: number;
  busy: boolean;
  onMove: (index: number, direction: -1 | 1) => Promise<void>;
  onSaveNote: (itemId: string, note: string) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}) {
  const [note, setNote] = useState(item.note ?? "");
  useEffect(() => setNote(item.note ?? ""), [item.note]);

  return (
    <article className="card !p-4">
      <div className="flex gap-4">
        <Link href={`/media/${item.mediaId}`} className="relative h-24 w-16 flex-none overflow-hidden rounded-xl bg-bg-hover" aria-label={`View ${item.title}`}>
          {item.posterUrl ? <Image src={item.posterUrl} alt="" fill sizes="64px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">{item.kind === "BOOK" ? "📚" : item.kind === "GAME" ? "🎮" : item.kind === "SHOW" ? "📺" : "🎬"}</div>}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{item.kind}{item.year ? ` · ${item.year}` : ""}</p>
          <h3 className="mt-1 truncate font-serif text-xl"><Link href={`/media/${item.mediaId}`} className="hover:text-accent">{item.title}</Link></h3>
          <div className="mt-3 flex items-center gap-1">
            <button className="btn-ghost !min-h-8 !px-2" type="button" disabled={busy || index === 0} onClick={() => void onMove(index, -1)} aria-label={`Move ${item.title} up`}>↑</button>
            <button className="btn-ghost !min-h-8 !px-2" type="button" disabled={busy || index === count - 1} onClick={() => void onMove(index, 1)} aria-label={`Move ${item.title} down`}>↓</button>
            <span className="ml-2 text-xs text-text-tertiary">Position {index + 1}</span>
          </div>
        </div>
      </div>
      <form className="mt-4 space-y-2 border-t border-ink/10 pt-4" onSubmit={(event) => { event.preventDefault(); void onSaveNote(item.id, note); }}>
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Note<textarea className="input mt-1 min-h-16 text-sm" maxLength={500} placeholder="Why is this on the list?" value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <div className="flex items-center justify-between gap-2"><button className="text-xs font-semibold text-danger" type="button" disabled={busy} onClick={() => void onRemove(item.id)}>Remove</button><button className="btn-outline !min-h-8 !px-3 !py-1 text-xs" disabled={busy || note === (item.note ?? "")}>{busy ? "Saving…" : "Save note"}</button></div>
      </form>
    </article>
  );
}
