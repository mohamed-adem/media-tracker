"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { isLoggedIn, logout } from "@/lib/auth";

type Me = { id: string; email: string; displayName: string; role: string };

export default function AccountPage() {
  const r = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) return r.replace("/login");
    (async () => {
      try {
        const u = await apiFetch<Me>("/api/users/me");
        setMe(u);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to fetch user");
      }
    })();
  }, [r]);

  function doLogout() {
    logout();
    r.replace("/login");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Account</h1>
        <button className="btn-primary" onClick={doLogout}>Log out</button>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {!me && !err && <p>Loading…</p>}

      {me && (
        <div className="rounded-lg border bg-white p-4">
          <p><span className="font-medium">Name:</span> {me.displayName}</p>
          <p><span className="font-medium">Email:</span> {me.email}</p>
          <p><span className="font-medium">Role:</span> {me.role}</p>
          <p><span className="font-medium">ID:</span> {me.id}</p>
        </div>
      )}
    </div>
  );
}
