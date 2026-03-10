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

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="card-glass p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {err && (
              <div className="text-sm text-danger bg-danger-muted rounded-lg px-3 py-2">
                {err}
              </div>
            )}
            <button className="btn w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary">
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
