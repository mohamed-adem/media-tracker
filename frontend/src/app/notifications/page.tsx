"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import { useRequireAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { NotificationItem, NotificationSummary } from "@/types";

export default function NotificationsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    apiFetch<NotificationSummary>("/api/notifications")
      .then(setSummary)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load notifications"));
  }, [authLoading]);

  async function markRead(item: NotificationItem) {
    if (item.readAt) return;
    try {
      const updated = await apiFetch<NotificationItem>(`/api/notifications/${item.id}/read`, { method: "PATCH" });
      const nextCount = Math.max(0, (summary?.unreadCount ?? 1) - 1);
      setSummary((current) => current ? {
        unreadCount: Math.max(0, current.unreadCount - 1),
        notifications: current.notifications.map((existing) => existing.id === item.id ? updated : existing),
      } : current);
      window.dispatchEvent(new CustomEvent("notifications:changed", { detail: nextCount }));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not mark this notification as read");
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    setError(null);
    try {
      await apiFetch<void>("/api/notifications/read-all", { method: "POST" });
      const now = new Date().toISOString();
      setSummary((current) => current ? {
        unreadCount: 0,
        notifications: current.notifications.map((item) => ({ ...item, readAt: item.readAt ?? now })),
      } : current);
      window.dispatchEvent(new CustomEvent("notifications:changed", { detail: 0 }));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Could not mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div className="rule-title">
        <div><p className="eyebrow">Updates</p><h1 className="mt-1 font-serif text-4xl">Inbox</h1></div>
        {summary && summary.unreadCount > 0 ? <button className="btn-outline" onClick={markAllRead} disabled={markingAll}>{markingAll ? "Saving…" : "Mark all read"}</button> : null}
      </div>
      {error ? <div className="rounded-xl bg-danger-muted px-4 py-3 text-sm text-danger">{error}</div> : null}
      {!summary ? <p className="text-sm text-text-tertiary">Loading notifications…</p> : summary.notifications.length === 0 ? (
        <EmptyState icon="◌" title="Nothing new" description="Friend requests and social updates will appear here." />
      ) : (
        <div className="space-y-3">
          {summary.notifications.map((item) => (
            <Link key={item.id} href={item.targetPath ?? "/notifications"} onClick={() => void markRead(item)} className={`block rounded-2xl border p-5 transition hover:-translate-y-0.5 ${item.readAt ? "border-ink/10 bg-bg-surface" : "border-accent/35 bg-accent-muted"}`}>
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-semibold text-text-primary">{item.message}</p><p className="mt-1 text-xs text-text-tertiary">{new Date(item.createdAt).toLocaleString()}</p></div>
                {!item.readAt ? <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-accent" aria-label="Unread" /> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
