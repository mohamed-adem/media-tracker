"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  authed: boolean;
  onLogout: () => void;
};

const navLinks = [
  { href: "/", label: "Home", auth: false },
  { href: "/dashboard", label: "Library", auth: true },
  { href: "/discover", label: "For you", auth: true },
  { href: "/lists", label: "Lists", auth: true },
  { href: "/friends", label: "Friends", auth: true },
  { href: "/notifications", label: "Inbox", auth: true },
  { href: "/profile", label: "Profile", auth: true },
  { href: "/login", label: "Log in", auth: false },
  { href: "/register", label: "Register", auth: false },
];

export default function MobileMenu({ open, onClose, authed, onLogout }: MobileMenuProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Overlay */}
      <button className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close menu" />

      {/* Drawer */}
      <nav className="absolute bottom-0 right-0 top-0 flex w-72 animate-slide-in-right flex-col border-l border-white/10 bg-ink text-paper">
        {/* Close button */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <span className="font-semibold text-paper">Browse</span>
          <button onClick={onClose} className="rounded-full p-2 text-paper hover:bg-white/10" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 py-2">
          {navLinks
            .filter((link) => (link.auth ? authed : !authed))
            .map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mx-3 block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                    active
                      ? "bg-accent text-white"
                      : "text-paper/70 hover:bg-white/10 hover:text-paper"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </div>

        {/* Logout */}
        {authed && (
          <div className="border-t border-white/10 p-4">
            <button onClick={onLogout} className="btn-danger w-full">
              Log out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
