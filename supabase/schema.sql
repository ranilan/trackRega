create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  active_budget_group_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_sources (
  id text primary key,
  created_by text not null,
  created_by_id text,
  name text not null,
  type text not null check (type in ('bank', 'credit_card', 'cash', 'digital_wallet', 'investment', 'other')),
  starting_balance numeric not null default 0,
  starting_balance_date date not null,
  currency text not null default 'ILS',
  is_active boolean not null default true,
  description text,
  is_sample boolean not null default false,
  created_date timestamptz,
  updated_date timestamptz
);

create table if not exists public.categories (
  id text primary key,
  created_by text not null,
  created_by_id text,
  name text not null,
  parent_type text not null check (parent_type in ('income', 'expense')),
  parent_category_name text,
  color text,
  icon text,
  is_active boolean not null default true,
  is_system boolean not null default false,
  is_sample boolean not null default false,
  created_date timestamptz,
  updated_date timestamptz
);

create table if not exists public.transactions (
  id text primary key,
  created_by text not null,
  created_by_id text,
  amount numeric not null,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  category_id text,
  source_id text,
  description text,
  receipt_url text,
  is_sample boolean not null default false,
  created_date timestamptz,
  updated_date timestamptz
);

create table if not exists public.budgets (
  id text primary key,
  created_by text not null,
  created_by_id text,
  name text not null,
  budget_group_name text not null,
  start_date date not null,
  category_id text not null,
  monthly_amount numeric not null default 0,
  is_active boolean not null default true,
  is_sample boolean not null default false,
  created_date timestamptz,
  updated_date timestamptz
);

create index if not exists financial_sources_created_by_idx on public.financial_sources(created_by);
create index if not exists categories_created_by_idx on public.categories(created_by);
create index if not exists categories_parent_idx on public.categories(created_by, parent_type, parent_category_name);
create index if not exists transactions_created_by_date_idx on public.transactions(created_by, date desc);
create index if not exists transactions_category_idx on public.transactions(category_id);
create index if not exists transactions_source_idx on public.transactions(source_id);
create index if not exists budgets_created_by_group_idx on public.budgets(created_by, budget_group_name);
create index if not exists budgets_category_idx on public.budgets(category_id);

alter table public.profiles enable row level security;
alter table public.financial_sources enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

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
