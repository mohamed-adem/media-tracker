"use client";

import { StarsDisplay } from "./StarRating";
import type { Review } from "@/types";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MediaCard({ review }: { review: Review }) {
  return (
    <div className="card-glass !p-0 overflow-hidden group hover:border-accent/30 transition-all hover:scale-[1.02]">
      {review.posterUrl ? (
        <img src={review.posterUrl} alt={review.title} className="w-full aspect-[2/3] object-cover" />
      ) : (
        <div className="w-full aspect-[2/3] bg-bg-hover flex items-center justify-center text-3xl text-text-tertiary">
          {review.kind === "BOOK" ? "📚" : review.kind === "GAME" ? "🎮" : review.kind === "SHOW" ? "📺" : "🎬"}
        </div>
      )}
      <div className="p-3 space-y-1">
        <div className="font-medium text-text-primary text-sm truncate">{review.title}</div>
        <div className="flex items-center justify-between">
          <StarsDisplay value={review.rating} small />
          {review.createdAt && <span className="text-xs text-text-tertiary">{timeAgo(review.createdAt)}</span>}
        </div>
      </div>
    </div>
  );
}
