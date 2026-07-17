-- NY Trip Planner schema. Run once against a fresh Supabase project (SQL Editor).

create extension if not exists "pgcrypto";

do $$ begin
  create type destination_category as enum
    ('mirador', 'monumento', 'museo', 'parque', 'comida', 'templo', 'sunset', 'otro');
exception
  when duplicate_object then null;
end $$;

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  sort_order int not null
);

create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references days(id) on delete set null, -- null = backlog
  name text not null,
  category destination_category not null default 'otro',
  lat double precision not null,
  lng double precision not null,
  notes text,
  is_sunset_spot boolean not null default false,
  visited boolean not null default false,
  sort_order int not null default 0,
  opens_at time, -- optional manual opening hours, used only for a rough same-day arrival estimate
  closes_at time,
  estimated_cost numeric, -- optional, per-destination rough budget estimate
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists restrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  notes text,
  source text not null check (source in ('official', 'custom')),
  created_at timestamptz not null default now()
);

create index if not exists destinations_day_id_idx on destinations(day_id);
create index if not exists destinations_sort_order_idx on destinations(sort_order);

-- Single-user personal app on the free tier: RLS is enabled but left open.
-- Add a real policy (e.g. scoped to an authenticated user) if this ever
-- becomes multi-user. Access is otherwise gated by middleware.ts (APP_PASSWORD).
alter table days enable row level security;
alter table destinations enable row level security;
alter table restrooms enable row level security;

drop policy if exists "open" on days;
drop policy if exists "open" on destinations;
drop policy if exists "open" on restrooms;

create policy "open" on days for all using (true) with check (true);
create policy "open" on destinations for all using (true) with check (true);
create policy "open" on restrooms for all using (true) with check (true);
