do $$
begin
  if exists (
    select 1
    from public.applications
    where monthly_income <> trunc(monthly_income)
      or monthly_debt <> trunc(monthly_debt)
      or loan_amount <> trunc(loan_amount)
  ) then
    raise exception
      'Cannot enforce whole-Rupiah amounts: reconcile existing fractional application values first.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.applications'::regclass
      and conname = 'applications_rupiah_amounts_whole_check'
  ) then
    alter table public.applications
      add constraint applications_rupiah_amounts_whole_check
      check (
        monthly_income = trunc(monthly_income)
        and monthly_debt = trunc(monthly_debt)
        and loan_amount = trunc(loan_amount)
      );
  end if;
end
$$;

alter table public.applications
  add column if not exists reviewed_by uuid
    references public.profiles (id) on delete restrict,
  add column if not exists review_note text;

alter table public.applications
  drop constraint if exists applications_pending_review_metadata_check;

alter table public.applications
  add constraint applications_pending_review_metadata_check
  check (
    status <> 'pending'
    or (reviewed_at is null and reviewed_by is null and review_note is null)
  );

alter table public.applications
  drop constraint if exists applications_review_note_length_check;

alter table public.applications
  add constraint applications_review_note_length_check
  check (
    review_note is null
    or char_length(btrim(review_note)) between 10 and 1000
  );

create index if not exists applications_created_id_idx
  on public.applications (created_at desc, id desc);

revoke select on public.applications from authenticated;
grant select (
  id,
  borrower_id,
  applicant_name,
  monthly_income,
  monthly_debt,
  loan_amount,
  loan_term_months,
  estimated_payment,
  dti_ratio,
  employment_years,
  credit_history_years,
  recent_defaults,
  credit_score,
  risk_tier,
  score_factors,
  status,
  reviewed_at,
  review_note,
  created_at
) on public.applications to authenticated;

create or replace function public.dashboard_stats()
returns table (
  total_applications bigint,
  pending_applications bigint,
  average_credit_score numeric,
  total_loan_value text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*),
    count(*) filter (where status = 'pending'::public.application_status),
    round(avg(credit_score)),
    trunc(coalesce(sum(loan_amount), 0))::text
  from public.applications
$$;

revoke all on function public.dashboard_stats() from public, anon;
grant execute on function public.dashboard_stats() to authenticated;
