"use client";

import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(isLoggedIn()), []);

  return (
    <div className="relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(0,224,84,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center animate-fade-in-up">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-accent to-text-primary bg-clip-text text-transparent">
          MediaTracker
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-md mx-auto">
          Track movies, shows, games, and books. Rate, review, and see what your friends are watching.
        </p>

        {!authed ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login" className="btn">Log in</Link>
            <Link href="/register" className="btn-outline">Register</Link>
          </div>
        ) : (
          <div className="mt-8">
            <Link href="/dashboard" className="btn">Go to dashboard</Link>
          </div>
        )}
      </section>

      {/* Feature cards */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass text-center py-8 px-4">
            <span className="text-3xl">🎬</span>
            <h3 className="mt-3 font-semibold text-text-primary">Track Everything</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Movies, TV shows, video games, and books — all in one place.
            </p>
          </div>
          <div className="card-glass text-center py-8 px-4">
            <span className="text-3xl">⭐</span>
            <h3 className="mt-3 font-semibold text-text-primary">Rate & Review</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Half-star ratings and text reviews for everything you consume.
            </p>
          </div>
          <div className="card-glass text-center py-8 px-4">
            <span className="text-3xl">👥</span>
            <h3 className="mt-3 font-semibold text-text-primary">Connect</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Follow friends and see their latest reviews in your feed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
