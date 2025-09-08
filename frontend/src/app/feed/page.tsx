"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { loadAccessToken, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type FeedItem = {
  reviewId: string;
  authorId: string;
  author: string;
  title: string;
  rating: number | null;
  body: string | null;
  createdAt: string; 
};

export default function FeedPage() {
  const r = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    const token = loadAccessToken();
    if (!token) {
      r.replace("/login");
      return;
    }
    try {
      const data = await apiFetch<FeedItem[]>("/api/feed", { token, cache: "no-store" });
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* on mount */ }, []);

  function doLogout() {
    logout();
    r.replace("/login");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Friends’ Feed</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn" onClick={doLogout}>Log out</button>
        </div>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {loading && !items.length && <p>Loading…</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border p-4">
          <p className="font-medium">Your feed is empty.</p>
          <p className="text-sm opacity-80 mt-1">
            Add friends and they’ll show up here when they post reviews.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.reviewId} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{new Date(it.createdAt).toLocaleString()}</p>
                <h3 className="font-semibold mt-1">{it.author}</h3>
              </div>
              <span className="text-sm">
                {it.rating == null ? "—/5" : `${it.rating}/5`}
              </span>
            </div>
            <p className="mt-2"><span className="font-medium">{it.title}</span></p>
            {it.body && <p className="text-sm mt-2 opacity-90">{it.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
