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
create policy "access_codes_select_active_or_admin" on public.access_codes
  for select using (
    public.is_admin()
    or (
      is_active = true
      and (valid_from is null or valid_from <= now())
      and (valid_until is null or valid_until >= now())
    )
  );

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

create or replace function public.record_access_code_use(
  access_code_id uuid,
  signed_up_user_id uuid,
  signed_up_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if access_code_id is null or signed_up_email is null then
    return;
  end if;

  insert into public.access_code_redemptions (access_code_id, user_id, email)
  values (access_code_id, signed_up_user_id, signed_up_email);

  update public.access_codes
  set used_count = used_count + 1,
      updated_at = now()
  where id = access_code_id;
end;
$$;

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
