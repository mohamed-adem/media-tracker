"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { postJSON } from "@/lib/api";
import { saveTokens, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isLoggedIn()) r.replace("/dashboard");
  }, [r]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await postJSON<{ accessToken: string; refreshToken: string }>(
        "/api/auth/register",
        { email, password, displayName }
      );
      saveTokens(res.accessToken, res.refreshToken);
      r.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[68vh] items-stretch overflow-hidden rounded-[2rem] border border-ink/15 bg-bg-surface shadow-[0_24px_70px_rgba(49,42,32,0.12)] lg:grid-cols-2">
      <div className="hidden bg-accent p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Your media in one place</span>
        <div>
          <div className="font-serif text-5xl leading-none">Watch.<br />Play.<br />Read.<br />Remember.</div>
        </div>
        <p className="max-w-sm text-sm leading-6 text-white/70">Track progress, save ratings, write reviews, and share with friends.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-sm animate-fade-in-up space-y-7">
          <div>
            <p className="eyebrow">Create account</p>
            <h1 className="mt-3 font-serif text-4xl text-text-primary">Start your library.</h1>
            <p className="mt-2 text-sm text-text-secondary">Create an account, then add your first title.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-semibold">
              <span>Display name</span>
            <input
              className="input"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              <span>Email</span>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              <span>Password</span>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              required
            />
            </label>
            {err && (
              <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">
                {err}
              </div>
            )}
            <button className="btn w-full" disabled={loading} type="submit">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-text-primary">Just browsing?</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">Explore a sample library before creating your own account.</p>
            <Link href="/login" className="btn-outline mt-3 block w-full text-center text-sm">
              Try the demo
            </Link>
          </div>

          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
