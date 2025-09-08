create table friends (
    user_id uuid not null,
    friend_id uuid not null,
    status varchar(20) not null,
    created_at timestamptz not null default now(),
    primary key (user_id, friend_id)
);