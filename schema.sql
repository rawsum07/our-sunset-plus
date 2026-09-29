create extension if not exists pgcrypto;

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  user_id text not null,
  answer text not null,
  display_name text not null default 'anonymous',
  anonymous boolean not null default true,
  visual_type int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (day, user_id)
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  user_id text not null,
  type text not null,
  created_at timestamptz not null default now(),
  unique (response_id, user_id)
);

create index if not exists idx_responses_day on responses(day);
