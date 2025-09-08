const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

import {
  loadAccessToken,
  loadRefreshToken,
  setAccessToken,
  saveTokens,
} from "@/lib/auth";

type FetchOpts = {
  token?: string;
  init?: RequestInit;
};

function buildHeaders(base?: HeadersInit): Headers {
  return new Headers(base);
}

function withAuth(token?: string, base?: HeadersInit): Headers {
  const h = buildHeaders(base);
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

async function parseHandled<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = text ? JSON.parse(text) : null;
      if (j && typeof j === "object") {
        msg =
          (j.error as string) ??
          (j.message as string) ??
          (j.detail as string) ??
          msg;
      } else if (text) {
        msg = text;
      }
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

let refreshing: Promise<void> | null = null;

async function refreshAccessTokenOnce(): Promise<void> {
  if (refreshing) return refreshing;

  const doRefresh = async () => {
    const rt = loadRefreshToken();
    if (!rt) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      refreshing = null;
      throw new Error("Session expired");
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken?: string;
    };
    if (data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
    } else {
      setAccessToken(data.accessToken);
    }
    refreshing = null;
  };

  refreshing = doRefresh();
  try {
    await refreshing;
  } finally {
    refreshing = null;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: (RequestInit & { token?: string; _retried?: boolean }) = {}
): Promise<T> {
  const { token = loadAccessToken() ?? undefined, headers: baseHeaders, body, _retried, ...rest } = opts;

  const headers = withAuth(token, baseHeaders);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  if (body != null && !isFormData && !isBlob && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { headers, cache: "no-store", body, ...rest });

  if (res.status === 401 && !_retried) {
    await refreshAccessTokenOnce();
    const newToken = loadAccessToken() ?? undefined;
    const headers2 = withAuth(newToken, baseHeaders);
    if (body != null && !isFormData && !isBlob && !headers2.has("Content-Type")) {
      headers2.set("Content-Type", "application/json");
    }
    const res2 = await fetch(`${API_BASE}${path}`, {
      headers: headers2,
      cache: "no-store",
      body,
      ...rest,
    });
    return parseHandled<T>(res2);
  }

  return parseHandled<T>(res);
}

export async function postJSON<T>(
  path: string,
  data: unknown,
  opts: FetchOpts = {}
): Promise<T> {
  const headers = withAuth(opts.token ?? loadAccessToken() ?? undefined, opts.init?.headers);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
    ...opts.init,
  });

  if (res.status === 401) {
    await refreshAccessTokenOnce();
    const headers2 = withAuth(loadAccessToken() ?? undefined, opts.init?.headers);
    headers2.set("Content-Type", "application/json");
    const res2 = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: headers2,
      body: JSON.stringify(data),
      cache: "no-store",
      ...opts.init,
    });
    return parseHandled<T>(res2);
  }

  return parseHandled<T>(res);
}

export async function getJSON<T>(
  path: string,
  opts: FetchOpts = {}
): Promise<T> {
  return apiFetch<T>(path, { method: "GET", token: opts.token, ...(opts.init ?? {}) });
}

export type AuthResponse = { accessToken: string; refreshToken: string };
export type RegisterPayload = { email: string; password: string; displayName: string };
export type LoginPayload = { email: string; password: string };

export const Auth = {
  register: (data: RegisterPayload) =>
    postJSON<AuthResponse>("/api/auth/register", data),
  login: (data: LoginPayload) =>
    postJSON<AuthResponse>("/api/auth/login", data),
};