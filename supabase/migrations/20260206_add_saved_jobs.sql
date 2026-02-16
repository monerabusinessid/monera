-- Saved jobs for talent users
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid not null,
  created_at timestamp with time zone not null default now()
);

create unique index if not exists saved_jobs_user_job_unique
  on public.saved_jobs (user_id, job_id);

create index if not exists saved_jobs_user_id_idx
  on public.saved_jobs (user_id);

create index if not exists saved_jobs_job_id_idx
  on public.saved_jobs (job_id);
