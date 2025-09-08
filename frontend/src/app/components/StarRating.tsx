"use client";

import { useMemo } from "react";

type Props = {
  value: number;                
  onChange: (v: number) => void;
  size?: number;
};

export default function StarRating({ value, onChange, size = 22 }: Props) {
  const steps = useMemo(() => Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5), []);
  return (
    <div className="inline-flex items-center gap-1" aria-label="Rating">
      {steps.map((step) => {
        const filled = value >= step;
        const half = Math.abs(value - step) === 0.5 && !filled;
        return (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className="p-0.5"
            aria-label={`${step} stars`}
            title={`${step} stars`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className={filled ? "text-yellow-500" : "text-neutral-300"}
              style={{ display: "block" }}
            >
              {/* base star outline */}
              <path
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                d="M12 3.75l2.62 5.31 5.86.85-4.24 4.13 1 5.82L12 17.98 6.76 19.86l1-5.82-4.24-4.13 5.86-.85L12 3.75z"
              />
              {/* half overlay when selecting halves from the left */}
              {half && (
                <clipPath id={`half-${step}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              )}
              {half && (
                <path
                  clipPath={`url(#half-${step})`}
                  fill="currentColor"
                  d="M12 3.75l2.62 5.31 5.86.85-4.24 4.13 1 5.82L12 17.98 6.76 19.86l1-5.82-4.24-4.13 5.86-.85L12 3.75z"
                />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
