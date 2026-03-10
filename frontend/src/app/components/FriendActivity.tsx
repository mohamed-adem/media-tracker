"use client";

import { StarsDisplay } from "./StarRating";
import { FeedItemSkeleton } from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import Link from "next/link";
import type { FeedItem } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

type Props = {
  items: FeedItem[];
  loading: boolean;
  maxItems?: number;
};

export default function FriendActivity({ items, loading, maxItems = 6 }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <FeedItemSkeleton />
        <FeedItemSkeleton />
        <FeedItemSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No activity yet"
        description="Add friends to see what they're watching."
        action={<Link href="/friends" className="btn text-sm">Find friends</Link>}
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, maxItems).map((it) => (
        <div key={it.reviewId} className="rounded-xl bg-bg-hover/30 p-3 flex gap-3 hover:bg-bg-hover/50 transition-colors">
          {it.posterUrl ? (
            <img src={it.posterUrl} alt="" className="w-8 h-12 rounded-md object-cover flex-none" />
          ) : (
            <div className="w-8 h-12 bg-bg-hover rounded-md flex-none flex items-center justify-center text-text-tertiary text-xs">🎬</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary truncate">{it.author}</span>
              <span className="text-xs text-text-tertiary">{timeAgo(it.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-text-secondary truncate">{it.title}</span>
              {it.rating != null && <StarsDisplay value={it.rating} small />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
