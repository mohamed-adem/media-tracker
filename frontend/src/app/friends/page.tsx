"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, getJSON, postJSON } from "@/lib/api";
import { loadAccessToken } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { FriendCardSkeleton } from "@/app/components/LoadingSkeleton";
import EmptyState from "@/app/components/EmptyState";
import type { Me, FriendView, IncomingRequest, UserResult } from "@/types";

export default function FriendsPage() {
  const { loading: authLoading } = useRequireAuth();

  const [me, setMe] = useState<Me | null>(null);
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
      const u = await apiFetch<Me>("/api/users/me", { token });
      setMe(u);
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
    const t = setInterval(refreshAll, 15000);
    return () => clearInterval(t);
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold">Friends</h1>

      {err && (
        <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>
      )}

      {/* Search */}
      <section className="card-glass space-y-3">
        <h2 className="text-lg font-semibold">Find people</h2>
        <form onSubmit={searchUsers} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!query || busy}>
            Search
          </button>
        </form>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((u) => (
              <div key={u.id} className="rounded-xl bg-bg-hover/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{u.displayName}</div>
                    <div className="text-xs text-text-tertiary">{u.email}</div>
                  </div>
                </div>
                <button className="btn-outline text-xs" onClick={() => sendRequest(u.id)} disabled={busy}>
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
                  <div className="font-medium text-text-primary">{req.requesterDisplayName}</div>
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
                  <div className="font-medium text-text-primary">{f.friendDisplayName}</div>
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
      <section className="card-glass space-y-3">
        <h2 className="text-lg font-semibold">Your friends</h2>
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
                  <div className="font-medium text-text-primary">{f.friendDisplayName}</div>
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
