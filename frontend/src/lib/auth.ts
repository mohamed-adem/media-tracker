const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function setAccessToken(accessToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
}

export function loadAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function loadRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ACCESS_KEY);
}


export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}


export function authHeader(): Record<string, string> {
  const t = loadAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}


export async function refreshAccessToken(): Promise<string | null> {
  try {
    const rt = loadRefreshToken();
    if (!rt) return null;

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      logout();
      return null;
    }

    const data = (await res.json()) as { accessToken: string; refreshToken?: string };

    if (data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
    } else {
      setAccessToken(data.accessToken);
    }

    return data.accessToken;
  } catch {
    return null;
  }
}