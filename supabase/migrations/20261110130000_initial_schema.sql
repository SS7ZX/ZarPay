create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('borrower', 'evaluator');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.application_status as enum ('pending', 'approved', 'declined');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.risk_tier as enum ('low', 'moderate', 'elevated', 'high');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  role public.user_role not null default 'borrower',
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.profiles (id) on delete restrict,
  applicant_name text not null check (char_length(btrim(applicant_name)) between 2 and 100),
  monthly_income numeric(14, 2) not null check (monthly_income between 1 and 1000000000),
  monthly_debt numeric(14, 2) not null check (monthly_debt between 0 and 1000000000),
  loan_amount numeric(14, 2) not null check (loan_amount between 1000000 and 10000000000),
  loan_term_months integer not null check (loan_term_months between 3 and 60),
  estimated_payment numeric(14, 2) not null check (estimated_payment > 0),
  dti_ratio numeric(15, 5) not null check (dti_ratio >= 0),
  employment_years numeric(4, 1) not null check (employment_years between 0 and 60),
  credit_history_years numeric(4, 1) not null check (credit_history_years between 0 and 60),
  recent_defaults boolean not null,
  credit_score integer not null check (credit_score between 300 and 850),
  risk_tier public.risk_tier not null,
  score_factors jsonb not null check (jsonb_typeof(score_factors) = 'array'),
  status public.application_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'pending' and reviewed_at is null) or status <> 'pending')
);

create index if not exists applications_borrower_created_idx
  on public.applications (borrower_id, created_at desc);
create index if not exists applications_status_created_idx
  on public.applications (status, created_at desc);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
  limit 1
$$;

revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  if profile_name is null or char_length(profile_name) < 2 or char_length(profile_name) > 100 then
    raise exception 'A valid full_name is required to create a profile';
  end if;

  insert into public.profiles (id, full_name, role)
  values (new.id, profile_name, 'borrower')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.applications from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.applications to authenticated;
grant all on public.profiles, public.applications to service_role;

drop policy if exists "Users can read permitted profiles" on public.profiles;
create policy "Users can read permitted profiles"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.current_user_role()) = 'evaluator'::public.user_role
  );

drop policy if exists "Borrowers and evaluators can read permitted applications" on public.applications;
create policy "Borrowers and evaluators can read permitted applications"
  on public.applications for select
  to authenticated
  using (
    borrower_id = (select auth.uid())
    or (select public.current_user_role()) = 'evaluator'::public.user_role
  );
