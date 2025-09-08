// app/components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();
  const r = useRouter();

  useEffect(() => setAuthed(isLoggedIn()), [pathname]);

  function doLogout() {
    logout();
    r.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold tracking-tight text-slate-900">
            MediaTracker
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            {authed && (
              <>
                <Link href="/dashboard" className="hover:text-slate-900 transition">Dashboard</Link>
                <Link href="/friends" className="hover:text-slate-900 transition">Friends</Link>
                <Link href="/feed" className="hover:text-slate-900 transition">Feed</Link>
                <Link href="/account" className="hover:text-slate-900 transition">Account</Link>
              </>
            )}
          </nav>
        </div>

        {authed && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={doLogout} className="btn">Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}