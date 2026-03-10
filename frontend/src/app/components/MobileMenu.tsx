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
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard", auth: true },
  { href: "/friends", label: "Friends", auth: true },
  { href: "/feed", label: "Feed", auth: true },
  { href: "/account", label: "Account", auth: true },
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <nav className="absolute right-0 top-0 bottom-0 w-64 bg-bg-surface border-l border-border animate-slide-in-right flex flex-col">
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-text-primary">Menu</span>
          <button onClick={onClose} className="btn-ghost !p-1.5" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 py-2">
          {navLinks
            .filter((link) => !link.auth || authed)
            .map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "text-accent bg-accent-muted"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </div>

        {/* Logout */}
        {authed && (
          <div className="p-4 border-t border-border">
            <button onClick={onLogout} className="btn-danger w-full">
              Log out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
