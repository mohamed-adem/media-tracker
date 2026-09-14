export type MediaKind = "MOVIE" | "SHOW" | "GAME" | "BOOK";
export type LibraryStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "DROPPED";

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

export type LibraryEntry = {
  id: string;
  mediaId: string;
  title: string;
  kind: MediaKind;
  year: number | null;
  posterUrl: string | null;
  status: LibraryStatus;
  progressCurrent: number | null;
  progressTotal: number | null;
  startedAt: string | null;
  completedAt: string | null;
  privateEntry: boolean;
  createdAt: string;
  updatedAt: string;
  rating: number | null;
  reviewBody: string | null;
  reviewedAt: string | null;
};

export type FeedItem = {
  reviewId: string;
  mediaId: string;
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

export type SuggestedUser = {
  id: string;
  displayName: string;
  bio: string | null;
  sharedMediaCount: number;
  reason: string;
};

export type PublicProfileEntry = {
  mediaId: string;
  title: string;
  kind: MediaKind;
  year: number | null;
  posterUrl: string | null;
  status: LibraryStatus;
  rating: number | null;
  reviewBody: string | null;
  reviewedAt: string | null;
};

export type PublicProfile = {
  id: string;
  displayName: string;
  bio: string | null;
  createdAt: string;
  entries: PublicProfileEntry[];
};

export type SearchItem = {
  kind: MediaKind;
  externalId: string | null;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

export type Recommendation = SearchItem & {
  mediaId: string;
  score: number;
  reason: string;
};

export type FriendReview = {
  reviewId: string;
  authorId: string;
  author: string;
  rating: number;
  body: string | null;
  updatedAt: string;
};

export type MediaDetail = SearchItem & {
  mediaId: string;
  libraryEntry: LibraryEntry | null;
  friendReviews: FriendReview[];
};

export type MediaListItem = SearchItem & {
  id: string;
  mediaId: string;
  position: number;
  note: string | null;
  createdAt: string;
};

export type MediaList = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  privateList: boolean;
  createdAt: string;
  updatedAt: string;
  items: MediaListItem[];
};

export type NotificationItem = {
  id: string;
  actorId: string | null;
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPTED";
  message: string;
  targetPath: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationSummary = {
  unreadCount: number;
  notifications: NotificationItem[];
};
