-- =============================================================================
-- 0001_initial.sql
-- Schema: profiles, listings, interests
-- Uses security-definer helper functions to avoid infinite recursion in RLS
-- =============================================================================

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  role       text not null default 'buyer'
               check (role in ('buyer', 'seller', 'operator')),
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id),
  title       text not null,
  description text,
  price       numeric(12, 2),
  currency    text not null default 'USD',
  status      text not null default 'pending_review'
                check (status in ('pending_review', 'live', 'declined', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.interests (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id   uuid references public.profiles(id),
  email      text not null,
  message    text,
  created_at timestamptz not null default now()
);

-- ─── Auto-create profile on signup ───────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Security-definer helpers ─────────────────────────────────────────────────
-- These run as the function owner (postgres superuser), bypassing RLS.
-- Without these, any policy that queries profiles from within another
-- profiles policy causes infinite recursion.

create or replace function public.get_my_role()
returns text language sql security definer stable
set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_verified()
returns boolean language sql security definer stable
set search_path = public as $$
  select verified from public.profiles where id = auth.uid()
$$;

-- ─── Enable RLS ──────────────────────────────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.listings  enable row level security;
alter table public.interests enable row level security;

-- =============================================================================
-- profiles policies
-- =============================================================================

create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: operator read all"
  on public.profiles for select
  using (get_my_role() = 'operator');

-- WITH CHECK uses get_my_role() / get_my_verified() to prevent self-promotion
create policy "profiles: owner update non-privileged fields"
  on public.profiles for update
  using  (auth.uid() = id)
  with check (
    auth.uid() = id
    and role     = get_my_role()
    and verified = get_my_verified()
  );

create policy "profiles: operator update any"
  on public.profiles for update
  using (get_my_role() = 'operator');

-- =============================================================================
-- listings policies
-- =============================================================================

create policy "listings: public read live"
  on public.listings for select
  using (status = 'live');

create policy "listings: seller read own"
  on public.listings for select
  using (auth.uid() = seller_id);

create policy "listings: operator read all"
  on public.listings for select
  using (get_my_role() = 'operator');

create policy "listings: verified seller insert"
  on public.listings for insert
  with check (
    auth.uid() = seller_id
    and get_my_role()      = 'seller'
    and get_my_verified()  = true
  );

create policy "listings: seller update pending"
  on public.listings for update
  using  (auth.uid() = seller_id and status = 'pending_review')
  with check (auth.uid() = seller_id);

create policy "listings: operator update any"
  on public.listings for update
  using (get_my_role() = 'operator');

-- =============================================================================
-- interests policies
-- =============================================================================

create policy "interests: anyone insert on live listing"
  on public.interests for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'live'
    )
  );

create policy "interests: buyer read own"
  on public.interests for select
  using (auth.uid() = buyer_id);

create policy "interests: operator read all"
  on public.interests for select
  using (get_my_role() = 'operator');
