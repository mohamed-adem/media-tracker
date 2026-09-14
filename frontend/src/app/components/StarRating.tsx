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
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex gap-1" role="group" aria-label={`Rating: ${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const fill = Math.max(0, Math.min(1, value - index));
          return (
            <button
              key={starValue}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/15 bg-bg-surface text-3xl leading-none shadow-sm transition hover:border-star hover:bg-star/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Set rating to ${starValue} stars`}
              onClick={() => onChange(starValue)}
            >
              <span className="relative inline-block text-border" aria-hidden="true">
                ★
                <span className="absolute inset-0 overflow-hidden text-star" style={{ width: `${fill * 100}%` }}>★</span>
              </span>
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
        Score
        <select
          className="input !w-auto !py-2"
          value={value.toFixed(1)}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Numeric rating"
        >
          {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).map((rating) => (
            <option key={rating} value={rating.toFixed(1)}>{rating.toFixed(1)}</option>
          ))}
        </select>
        <span className="text-text-tertiary">/ 5</span>
      </label>
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
