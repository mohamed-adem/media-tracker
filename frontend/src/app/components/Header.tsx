"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";
import MobileMenu from "./MobileMenu";
import HeaderSearch from "./HeaderSearch";
import { useQuickAdd } from "./QuickAddProvider";
import { apiFetch } from "@/lib/api";
import type { NotificationSummary } from "@/types";

const navLinks = [
  { href: "/dashboard", label: "Library" },
  { href: "/discover", label: "For you" },
  { href: "/lists", label: "Lists" },
  { href: "/friends", label: "Friends" },
  { href: "/notifications", label: "Inbox" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const r = useRouter();
  const quickAdd = useQuickAdd();

  useEffect(() => setAuthed(isLoggedIn()), [pathname]);

  useEffect(() => {
    if (!isLoggedIn()) {
      setUnreadCount(0);
      return;
    }
    apiFetch<NotificationSummary>("/api/notifications")
      .then((summary) => setUnreadCount(summary.unreadCount))
      .catch(() => setUnreadCount(0));
  }, [pathname]);

  useEffect(() => {
    function updateUnread(event: Event) {
      const count = (event as CustomEvent<number>).detail;
      if (typeof count === "number") setUnreadCount(count);
    }
    window.addEventListener("notifications:changed", updateUnread);
    return () => window.removeEventListener("notifications:changed", updateUnread);
  }, []);

  function doLogout() {
    logout();
    setAuthed(false);
    r.push("/login");
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-ink/15 bg-bg-base/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Media Tracker home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-black text-white transition group-hover:rotate-6">M</span>
            <span className="font-bold tracking-[-0.04em] text-text-primary">media tracker</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
            {authed &&
              navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-ink text-paper"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    {link.label}
                    {link.href === "/notifications" && unreadCount > 0 ? (
                      <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] leading-none text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {authed && <HeaderSearch />}
            {authed && (
              <button onClick={() => quickAdd?.openQuickAdd("MOVIE")} className="btn !hidden sm:!inline-flex">
                Add to library
              </button>
            )}
            {authed && (
              <button onClick={doLogout} className="btn-ghost !hidden sm:!inline-flex">
                Sign out
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="btn-ghost !p-2 sm:!hidden"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <MobileMenu open={menuOpen} onClose={closeMenu} authed={authed} onLogout={doLogout} />
    </>
  );
}
