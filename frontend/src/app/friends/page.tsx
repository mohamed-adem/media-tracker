"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, getJSON, postJSON } from "@/lib/api";
import { loadAccessToken } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { FriendCardSkeleton } from "@/app/components/LoadingSkeleton";
import EmptyState from "@/app/components/EmptyState";
import type { FriendView, IncomingRequest, UserResult } from "@/types";

export default function FriendsPage() {
  const { loading: authLoading } = useRequireAuth();

  const [friends, setFriends] = useState<FriendView[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  async function refreshAll() {
    const token = loadAccessToken();
    if (!token) return;
    setErr(null);
    try {
      const myFriends = await apiFetch<FriendView[]>("/api/friends", { token });
      setFriends(myFriends);
      const reqs = await apiFetch<IncomingRequest[]>("/api/friends/requests", { token });
      setIncoming(reqs);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load friends data");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    refreshAll();
  }, [authLoading]);

  async function searchUsers(e: React.FormEvent) {
    e.preventDefault();
    const token = loadAccessToken();
    if (!token) return;
    setErr(null);
    try {
      const data = await getJSON<UserResult[]>(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        { token }
      );
      setResults(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Search failed");
    }
  }

  async function sendRequest(friendId: string) {
    const token = loadAccessToken();
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${friendId}`, {}, { token });
      await refreshAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Send request failed");
    } finally {
      setBusy(false);
    }
  }

  async function acceptRequest(requesterId: string) {
    const token = loadAccessToken();
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${requesterId}/accept`, {}, { token });
      await refreshAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Accept failed");
    } finally {
      setBusy(false);
    }
  }

  async function declineRequest(requesterId: string) {
    const token = loadAccessToken();
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${requesterId}/decline`, {}, { token });
      await refreshAll();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Decline failed");
    } finally {
      setBusy(false);
    }
  }

  const outgoingPending = useMemo(
    () => friends.filter((f) => f.status === "PENDING"),
    [friends]
  );
  const accepted = useMemo(
    () => friends.filter((f) => f.status === "ACCEPTED"),
    [friends]
  );

  if (authLoading) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in-up">
      <div className="flex items-end justify-between gap-5 border-b border-ink/15 pb-6">
        <div>
          <p className="eyebrow">Friends</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Find people you know.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">Add friends to see the public ratings and reviews they share.</p>
        </div>
        <button className="btn-outline text-sm" onClick={refreshAll} disabled={busy}>
          Refresh
        </button>
      </div>

      {err && (
        <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>
      )}

      {/* Search */}
      <section className="card-dark space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f58b76]">Search</p>
          <h2 className="mt-1 font-serif text-2xl">Find a friend</h2>
        </div>
        <form onSubmit={searchUsers} className="flex gap-2">
          <input
            className="input flex-1 !border-white/15 !bg-white/10 !text-paper placeholder:!text-paper/40"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn !bg-paper !text-ink !shadow-none hover:!bg-accent hover:!text-white"
            type="submit"
            disabled={!query || busy}
          >
            Search
          </button>
        </form>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/profile/${u.id}`} className="font-medium text-paper hover:text-[#f58b76]">{u.displayName}</Link>
                    <div className="text-xs text-paper/45">{u.email}</div>
                  </div>
                </div>
                <button className="btn-outline !border-white/20 !bg-white/10 !text-paper text-xs" onClick={() => sendRequest(u.id)} disabled={busy}>
                  Add friend
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <section className="card-glass space-y-3 border-l-4 border-l-accent">
          <h2 className="text-lg font-semibold">
            Incoming requests
            <span className="ml-2 text-xs bg-accent text-bg-base px-2 py-0.5 rounded-full">
              {incoming.length}
            </span>
          </h2>
          {incoming.map((req) => (
            <div key={req.requesterId} className="rounded-xl bg-bg-hover/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                  {req.requesterDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link href={`/profile/${req.requesterId}`} className="font-medium text-text-primary hover:text-accent">{req.requesterDisplayName}</Link>
                  <div className="text-xs text-text-tertiary">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn text-xs" onClick={() => acceptRequest(req.requesterId)} disabled={busy}>
                  Accept
                </button>
                <button className="btn-ghost text-xs" onClick={() => declineRequest(req.requesterId)} disabled={busy}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Outgoing pending */}
      {outgoingPending.length > 0 && (
        <section className="card-glass space-y-3">
          <h2 className="text-lg font-semibold">Outgoing requests</h2>
          {outgoingPending.map((f) => (
            <div key={f.friendId} className="rounded-xl bg-bg-hover/50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning font-semibold text-sm">
                  {f.friendDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link href={`/profile/${f.friendId}`} className="font-medium text-text-primary hover:text-accent">{f.friendDisplayName}</Link>
                  <div className="text-xs text-text-tertiary">
                    Sent {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="text-xs text-warning bg-warning/15 px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Friends list */}
      <section className="card space-y-4">
        <div className="rule-title">
          <div>
            <p className="eyebrow">Connected</p>
            <h2 className="mt-1 font-serif text-2xl">Your people</h2>
          </div>
          <span className="text-sm text-text-tertiary">{accepted.length}</span>
        </div>
        {dataLoading ? (
          <div className="space-y-3">
            <FriendCardSkeleton />
            <FriendCardSkeleton />
          </div>
        ) : accepted.length === 0 ? (
          <EmptyState
            icon="👋"
            title="No friends yet"
            description="Search for people above to add them as friends."
          />
        ) : (
          <div className="space-y-2">
            {accepted.map((f) => (
              <div key={f.friendId} className="rounded-xl bg-bg-hover/50 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                  {f.friendDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <Link href={`/profile/${f.friendId}`} className="font-medium text-text-primary hover:text-accent">{f.friendDisplayName}</Link>
                </div>
                <span className="w-2 h-2 rounded-full bg-success" title="Connected" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
