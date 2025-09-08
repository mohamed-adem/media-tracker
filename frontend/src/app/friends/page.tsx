"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, getJSON, postJSON } from "@/lib/api";
import { loadAccessToken } from "@/lib/auth";

type Me = { id: string; displayName: string; email: string };

type FriendView = {
  userId: string;        
  friendId: string;      
  friendDisplayName: string;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
};

type IncomingRequest = {
  requesterId: string;
  requesterDisplayName: string;
  createdAt: string;
};

type UserResult = { id: string; displayName: string; email: string };

export default function FriendsPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [friends, setFriends] = useState<FriendView[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const token = loadAccessToken();

  async function refreshAll() {
    if (!token) return;
    setErr(null);
    try {
      const u = await apiFetch<Me>("/api/users/me", { token });
      setMe(u);
      const myFriends = await apiFetch<FriendView[]>("/api/friends", { token });
      setFriends(myFriends);
      const reqs = await apiFetch<IncomingRequest[]>("/api/friends/requests", {
        token,
      });
      setIncoming(reqs);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load friends data");
    }
  }

  useEffect(() => {
    if (!token) return;
    refreshAll();
    const t = setInterval(refreshAll, 15000);
    return () => clearInterval(t);
  }, [token]);

  async function searchUsers(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    try {
      const data = await getJSON<UserResult[]>(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        { token }
      );
      setResults(data);
    } catch (e: any) {
      setErr(e?.message ?? "Search failed");
    }
  }

  async function sendRequest(friendId: string) {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${friendId}`, {}, { token });
      await refreshAll();
    } catch (e: any) {
      setErr(e?.message ?? "Send request failed");
    } finally {
      setBusy(false);
    }
  }

  async function acceptRequest(requesterId: string) {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${requesterId}/accept`, {}, { token });
      await refreshAll();
    } catch (e: any) {
      setErr(e?.message ?? "Accept failed");
    } finally {
      setBusy(false);
    }
  }

  async function declineRequest(requesterId: string) {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await postJSON(`/api/friends/${requesterId}/decline`, {}, { token });
      await refreshAll();
    } catch (e: any) {
      setErr(e?.message ?? "Decline failed");
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Friends</h1>
      </div>

      {err && <p className="text-red-600">{err}</p>}

      {/* Search */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">Find people</h2>
        <form onSubmit={searchUsers} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Search by name or email…"
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
              <div
                key={u.id}
                className="rounded border p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{u.displayName}</div>
                  <div className="text-xs opacity-70">{u.email}</div>
                </div>
                <button
                  className="btn"
                  onClick={() => sendRequest(u.id)}
                  disabled={busy}
                >
                  Add friend
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">Incoming requests</h2>
        {incoming.length === 0 && <p className="text-sm opacity-70">None.</p>}
        {incoming.map((req) => (
          <div
            key={req.requesterId}
            className="rounded border p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{req.requesterDisplayName}</div>
              <div className="text-xs opacity-70">
                Requested at {new Date(req.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn"
                onClick={() => acceptRequest(req.requesterId)}
                disabled={busy}
              >
                Accept
              </button>
              <button
                className="btn"
                onClick={() => declineRequest(req.requesterId)}
                disabled={busy}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Outgoing (pending) */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">Outgoing requests</h2>
        {outgoingPending.length === 0 && (
          <p className="text-sm opacity-70">None.</p>
        )}
        {outgoingPending.map((f) => (
          <div
            key={f.friendId}
            className="rounded border p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{f.friendDisplayName}</div>
              <div className="text-xs opacity-70">
                Sent at {new Date(f.createdAt).toLocaleString()}
              </div>
            </div>
            <span className="text-xs">Pending</span>
          </div>
        ))}
      </section>

      {/* Friends (accepted) */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">Your friends</h2>
        {accepted.length === 0 && <p className="text-sm opacity-70">None.</p>}
        {accepted.map((f) => (
          <div key={f.friendId} className="rounded border p-3">
            <div className="font-medium">{f.friendDisplayName}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
