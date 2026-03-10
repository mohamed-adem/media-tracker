"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useAuth";
import { ProfileSkeleton } from "@/app/components/LoadingSkeleton";
import type { Me } from "@/types";

export default function AccountPage() {
  const r = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      try {
        const u = await apiFetch<Me>("/api/users/me");
        setMe(u);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to fetch user");
      }
    })();
  }, [authLoading]);

  function doLogout() {
    logout();
    r.replace("/login");
  }

  if (authLoading) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account</h1>
        <button className="btn-danger" onClick={doLogout}>
          Log out
        </button>
      </div>

      {err && (
        <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">{err}</div>
      )}

      {!me && !err && <ProfileSkeleton />}

      {me && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-bg-base text-2xl font-bold flex-none">
              {me.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{me.displayName}</h2>
              <p className="text-sm text-text-secondary">{me.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border-muted">
              <span className="text-sm text-text-secondary">Role</span>
              <span className="text-sm font-medium text-accent bg-accent-muted px-2 py-0.5 rounded-full">
                {me.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-secondary">User ID</span>
              <span className="text-xs text-text-tertiary font-mono">{me.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
