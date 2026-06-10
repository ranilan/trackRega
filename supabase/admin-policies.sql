alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

alter table public.profiles
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'trial', 'paid', 'comped'));

alter table public.profiles
  add column if not exists access_status text not null default 'active'
  check (access_status in ('active', 'paused', 'blocked', 'cancelled'));

alter table public.profiles
  add column if not exists access_code_id uuid;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  code_hash text unique not null,
  is_active boolean not null default true,
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  discount_percent integer not null default 0 check (discount_percent between 0 and 100),
  valid_from timestamptz,
  valid_until timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references public.access_codes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  redeemed_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'trial', 'paid', 'comped')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'cancelled', 'paused')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists access_codes_hash_idx on public.access_codes(code_hash);
create index if not exists access_code_redemptions_code_idx on public.access_code_redemptions(access_code_id);
create index if not exists subscriptions_email_idx on public.subscriptions(email);

alter table public.access_codes enable row level security;
alter table public.access_code_redemptions enable row level security;
alter table public.subscriptions enable row level security;

revoke all on table public.access_codes from anon, authenticated;
revoke all on table public.access_code_redemptions from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;

grant select, insert, update, delete on public.access_codes to authenticated;
grant select on public.access_code_redemptions to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where email = auth.email()
      and role = 'admin'
  );
$$;

create or replace function private.validate_access_code(submitted_code_hash text)
returns table (
  id uuid,
  max_uses integer,
  used_count integer,
  valid_from timestamptz,
  valid_until timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select ac.id, ac.max_uses, ac.used_count, ac.valid_from, ac.valid_until
  from public.access_codes ac
  where ac.code_hash = submitted_code_hash
    and ac.is_active = true
  limit 1;
$$;

revoke all on function private.validate_access_code(text) from public;
grant execute on function private.validate_access_code(text) to anon, authenticated;

create or replace function public.validate_access_code(submitted_code_hash text)
returns table (
  id uuid,
  max_uses integer,
  used_count integer,
  valid_from timestamptz,
  valid_until timestamptz
)
language sql
stable
set search_path = public, private
as $$
  select * from private.validate_access_code(submitted_code_hash);
$$;

revoke all on function public.validate_access_code(text) from public;
grant execute on function public.validate_access_code(text) to anon, authenticated;

insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
from auth.users
where email = 'ranilan00@gmail.com'
on conflict (email) do update set role = 'admin';

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (email = auth.email() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (email = auth.email() or public.is_admin())
  with check ((email = auth.email() and role = 'user') or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check ((email = auth.email() and role = 'user') or public.is_admin());

drop policy if exists "access_codes_select_active_or_admin" on public.access_codes;
drop policy if exists "access_codes_admin_select" on public.access_codes;
create policy "access_codes_admin_select" on public.access_codes
  for select using (public.is_admin());

drop policy if exists "access_codes_admin_all" on public.access_codes;
create policy "access_codes_admin_all" on public.access_codes
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "access_code_redemptions_admin_select" on public.access_code_redemptions;
create policy "access_code_redemptions_admin_select" on public.access_code_redemptions
  for select using (public.is_admin() or email = auth.email());

drop policy if exists "subscriptions_owner_or_admin" on public.subscriptions;
create policy "subscriptions_owner_or_admin" on public.subscriptions
  for select using (email = auth.email() or public.is_admin());

drop policy if exists "subscriptions_admin_all" on public.subscriptions;
create policy "subscriptions_admin_all" on public.subscriptions
  for all using (public.is_admin())
  with check (public.is_admin());

create or replace function private.record_access_code_use(
  access_code_id uuid,
  signed_up_user_id uuid,
  signed_up_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  redeemed_access_code_id uuid;
begin
  if access_code_id is null or signed_up_email is null then
    return;
  end if;

  update public.access_codes
  set used_count = used_count + 1,
      updated_at = now()
  where id = access_code_id
    and is_active = true
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now())
    and (max_uses is null or used_count < max_uses)
  returning id into redeemed_access_code_id;

  if redeemed_access_code_id is null then
    return;
  end if;

  insert into public.access_code_redemptions (access_code_id, user_id, email)
  values (redeemed_access_code_id, signed_up_user_id, signed_up_email);
end;
$$;

revoke all on function private.record_access_code_use(uuid, uuid, text) from public;
grant execute on function private.record_access_code_use(uuid, uuid, text) to anon, authenticated;

create or replace function public.record_access_code_use(
  access_code_id uuid,
  signed_up_user_id uuid,
  signed_up_email text
)
returns void
language sql
set search_path = public, private
as $$
  select private.record_access_code_use(access_code_id, signed_up_user_id, signed_up_email);
$$;

revoke all on function public.record_access_code_use(uuid, uuid, text) from public;
grant execute on function public.record_access_code_use(uuid, uuid, text) to anon, authenticated;

drop policy if exists "financial_sources_owner_all" on public.financial_sources;
create policy "financial_sources_owner_all" on public.financial_sources
  for all using (created_by = auth.email() or public.is_admin())
  with check (created_by = auth.email() or public.is_admin());

drop policy if exists "categories_owner_all" on public.categories;
create policy "categories_owner_all" on public.categories
  for all using (created_by = auth.email() or public.is_admin())
  with check (created_by = auth.email() or public.is_admin());

drop policy if exists "transactions_owner_all" on public.transactions;
create policy "transactions_owner_all" on public.transactions
  for all using (created_by = auth.email() or public.is_admin())
  with check (created_by = auth.email() or public.is_admin());

drop policy if exists "budgets_owner_all" on public.budgets;
create policy "budgets_owner_all" on public.budgets
  for all using (created_by = auth.email() or public.is_admin())
  with check (created_by = auth.email() or public.is_admin());
