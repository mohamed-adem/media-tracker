"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

/**
 * Hook that requires authentication.
 * Redirects to /login if not authenticated.
 * Handles SSR hydration by waiting for mount.
 */
export function useRequireAuth() {
  const r = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      setAuthed(true);
    } else {
      r.replace("/login");
    }
    setLoading(false);
  }, [r]);

  return { authed, loading };
}
