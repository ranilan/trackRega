alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

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
