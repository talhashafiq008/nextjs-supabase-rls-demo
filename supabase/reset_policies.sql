-- Nuclear reset: drop all policies and recreate clean
-- Run this in Supabase SQL Editor

-- Step 1: Drop every policy on the three tables
do $$
declare r record;
begin
  for r in (
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'listings', 'interests')
  ) loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Step 2: Create security-definer helpers (bypasses RLS, no recursion)
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

-- Step 3: Recreate all policies

-- profiles
create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: operator read all"
  on public.profiles for select
  using (get_my_role() = 'operator');

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

-- listings
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
    and get_my_role()     = 'seller'
    and get_my_verified() = true
  );

create policy "listings: seller update pending"
  on public.listings for update
  using  (auth.uid() = seller_id and status = 'pending_review')
  with check (auth.uid() = seller_id);

create policy "listings: operator update any"
  on public.listings for update
  using (get_my_role() = 'operator');

-- interests
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
