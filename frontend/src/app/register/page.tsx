"use client";
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
    setLoading(true); setErr("");
    try {
      const res = await postJSON<{ accessToken: string; refreshToken: string }>(
        "/api/auth/register",
        { email, password, displayName }
      );
      saveTokens(res.accessToken, res.refreshToken);
      r.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Display name"
            value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          <input className="input" type="email" placeholder="Email"
            value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password"
            value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn w-full" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}