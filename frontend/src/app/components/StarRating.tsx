"use client";

import { useId } from "react";

/* ---------- Read-only star display ---------- */

export function StarsDisplay({ value, small = false }: { value: number; small?: boolean }) {
  const uid = useId();
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className={`inline-flex ${small ? "scale-90" : ""}`} aria-label={`${value} stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const showHalf = i === full && half;
        return (
          <span key={i} className="relative inline-block w-4 h-4 mr-0.5">
            <StarOutline />
            {filled && <StarFill />}
            {showHalf && <StarHalf idSuffix={`${uid}-${i}`} />}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Interactive star rating ---------- */

export function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0.5, Math.min(5, Math.round(pct * 10) / 2));
    onChange(v);
  }

  return (
    <div
      className="inline-flex items-center cursor-pointer select-none"
      onClick={handleClick}
      role="slider"
      tabIndex={0}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-label="Rating"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(5, value + 0.5));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(0.5, value - 0.5));
        }
      }}
    >
      <StarsDisplay value={value} />
      <span className="ml-2 text-sm text-text-secondary">{value.toFixed(1)}</span>
    </div>
  );
}

/* ---------- SVG primitives ---------- */

function StarOutline() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 text-border" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
    </svg>
  );
}

function StarFill() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 text-star" fill="currentColor">
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
    </svg>
  );
}

function StarHalf({ idSuffix }: { idSuffix: string }) {
  const gradId = `half-grad-${idSuffix}`;
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="50%" stopColor="var(--color-star)" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"
        fill={`url(#${gradId})`}
        stroke="var(--color-star)"
      />
    </svg>
  );
}
