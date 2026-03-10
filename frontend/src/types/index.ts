export type MediaKind = "MOVIE" | "SHOW" | "GAME" | "BOOK";

export type Me = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  bio: string;
  createdAt: string;
};

export type Review = {
  id: string;
  mediaId: string;
  title: string;
  rating: number;
  body: string | null;
  kind?: MediaKind;
  year?: number | null;
  posterUrl?: string | null;
  createdAt?: string;
};

export type FeedItem = {
  reviewId: string;
  authorId: string;
  author: string;
  title: string;
  rating: number | null;
  body: string | null;
  createdAt: string;
  posterUrl?: string | null;
};

export type FriendView = {
  userId: string;
  friendId: string;
  friendDisplayName: string;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
};

export type IncomingRequest = {
  requesterId: string;
  requesterDisplayName: string;
  createdAt: string;
};

export type UserResult = {
  id: string;
  displayName: string;
  email: string;
};

export type SearchItem = {
  kind: MediaKind;
  externalId: string | null;
  title: string;
  year: number | null;
  posterUrl: string | null;
};
