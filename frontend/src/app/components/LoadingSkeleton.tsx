export function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-24 mb-2" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="card flex gap-3">
      <div className="skeleton w-10 h-14 flex-none rounded-md" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-3 w-48" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="card flex gap-3">
      <div className="skeleton w-12 h-[72px] flex-none rounded-md" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton w-16 h-16 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-3 w-48" />
      </div>
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="card-glass">
      <div className="skeleton w-full aspect-[2/3] rounded-lg mb-2" />
      <div className="skeleton h-4 w-3/4 mb-1" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="card-glass flex items-center gap-6 p-6">
      <div className="skeleton w-20 h-20 rounded-full flex-none" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-4 w-64" />
        <div className="skeleton h-3 w-32" />
      </div>
    </div>
  );
}

export function FriendCardSkeleton() {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-3 w-36" />
        </div>
      </div>
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
  );
}
