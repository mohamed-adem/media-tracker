"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { postJSON } from "@/lib/api";
import { saveTokens, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
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
        "/api/auth/login",
        { email, password }
      );
      saveTokens(res.accessToken, res.refreshToken);
      r.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function tryDemo() {
    setEmail("demo@mediatracker.app");
    setPassword("DemoUserPass123!");
    setLoading(true);
    setErr("");
    try {
      const res = await postJSON<{ accessToken: string; refreshToken: string }>(
        "/api/auth/login",
        { email: "demo@mediatracker.app", password: "DemoUserPass123!" }
      );
      saveTokens(res.accessToken, res.refreshToken);
      r.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Demo account is unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[68vh] items-stretch overflow-hidden rounded-[2rem] border border-ink/15 bg-bg-surface shadow-[0_24px_70px_rgba(49,42,32,0.12)] lg:grid-cols-2">
      <div className="hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <span className="eyebrow !text-[#f58b76]">Welcome back</span>
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight">Pick up where you left off.</p>
          <p className="mt-4 text-sm leading-6 text-paper/55">Your library, lists, reviews, and friend activity are tied to your account.</p>
        </div>
        <p className="text-sm text-paper/55">Movies · Shows · Games · Books</p>
      </div>
      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-sm animate-fade-in-up space-y-7">
          <div>
            <p className="eyebrow">Sign in</p>
            <h1 className="mt-3 font-serif text-4xl text-text-primary">Log in to your library.</h1>
            <p className="mt-2 text-sm text-text-secondary">Enter your email and password.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
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
              required
            />
            </label>
            {err && (
              <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">
                {err}
              </div>
            )}
            <button className="btn w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-text-primary">Want to look around first?</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">Use the demo account to explore a sample library, reviews, and friend activity.</p>
            <button type="button" className="btn-outline mt-3 w-full text-sm" onClick={tryDemo} disabled={loading}>
              Try the demo
            </button>
          </div>

          <p className="text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
