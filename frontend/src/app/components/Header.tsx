"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";
import MobileMenu from "./MobileMenu";
import HeaderSearch from "./HeaderSearch";
import { useQuickAdd } from "./QuickAddProvider";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const r = useRouter();
  const quickAdd = useQuickAdd();

  useEffect(() => setAuthed(isLoggedIn()), [pathname]);

  function doLogout() {
    logout();
    setAuthed(false);
    r.push("/login");
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-bg-surface/80 backdrop-blur-lg supports-[backdrop-filter]:bg-bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          {/* Logo */}
          <Link href="/" className="font-bold tracking-tight text-text-primary hover:text-accent transition-colors">
            MediaTracker
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 ml-6">
            {authed &&
              navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "text-accent bg-accent-muted"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {authed && <HeaderSearch />}
            {authed && (
              <button onClick={() => quickAdd?.openQuickAdd("MOVIE")} className="btn hidden sm:inline-flex text-sm">
                + Add
              </button>
            )}
            {authed && (
              <button onClick={doLogout} className="btn-ghost hidden sm:inline-flex text-sm">
                Log out
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="sm:hidden btn-ghost !p-2"
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
