// app/page.tsx
"use client";

import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [authed, setAuthed] = useState(false);
  const r = useRouter();

  useEffect(() => setAuthed(isLoggedIn()), []);


  return (
    <main className="relative">
      {/* subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,#EEF2FF_0%,transparent_60%)] pointer-events-none" />

      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          MediaTracker
        </h1>
        <p className="mt-3 text-slate-600">
          Track movies, shows, games, and books. See friends’ reviews. Share yours.
        </p>

        {!authed && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login" className="btn">
              Log in
            </Link>
            <Link href="/register" className="btn-outline">
              Register
            </Link>
          </div>
        )}

        {authed && (
          <div className="mt-8">
            <Link href="/dashboard" className="btn">
              Go to dashboard
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
