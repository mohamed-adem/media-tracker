import { apiFetch } from "@/lib/api";

export type FriendView = {
  friendId: string;
  status: "PENDING" | "ACCEPTED";
};

export const Friends = {
  list: (token: string) =>
    apiFetch<FriendView[]>("/api/friends", { token }),

  send: (token: string, friendId: string) =>
    apiFetch<FriendView>(`/api/friends/${friendId}`, {
      method: "POST",
      token,
    }),

  accept: (token: string, friendId: string) =>
    apiFetch<FriendView>(`/api/friends/${friendId}/accept`, {
      method: "POST",
      token,
    }),

  decline: (token: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${friendId}/decline`, {
      method: "POST",
      token,
    }),

  remove: (token: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${friendId}`, {
      method: "DELETE",
      token,
    }),
};
