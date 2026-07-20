-- =====================================================
-- ENUMS
-- =====================================================

create type interview_status as enum (
    'preparing',
    'in_progress',
    'completed',
    'evaluated',
    'failed'
);

create type question_type as enum (
    'behavioral',
    'technical'
);

create type difficulty_level as enum (
    'easy',
    'medium',
    'hard'
);

-- =====================================================
-- CANDIDATES
-- =====================================================

create table candidates (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null unique
        references auth.users(id)
        on delete cascade,

    profile_jsonb jsonb not null default '{}'::jsonb,

    resume_path text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =====================================================
-- JOBS
-- =====================================================

create table jobs (
    id uuid primary key default gen_random_uuid(),

    company_name text,

    job_role text not null,

    job_description text not null,

    job_skills jsonb,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =====================================================
-- QUESTIONS
-- =====================================================

create table questions (
    id uuid primary key default gen_random_uuid(),

    topics text[],

    question_type question_type not null,

    question_str text not null,

    difficulty difficulty_level not null,

    created_at timestamptz default now()
);

-- =====================================================
-- INTERVIEWS
-- =====================================================

create table interviews (
    id uuid primary key default gen_random_uuid(),

    candidate_id uuid not null
        references candidates(id)
        on delete cascade,

    job_id uuid not null
        references jobs(id)
        on delete cascade,

    status interview_status not null default 'preparing',

    question_sequence uuid[],

    answer_sequence uuid[],

    interview_report jsonb,

    interview_score numeric(4,2),

    interview_feedback text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =====================================================
-- ANSWERS
-- =====================================================

create table answers (
    id uuid primary key default gen_random_uuid(),

    interview_id uuid not null
        references interviews(id)
        on delete cascade,

    candidate_id uuid not null
        references candidates(id)
        on delete cascade,

    question_id uuid not null
        references questions(id)
        on delete cascade,

    answer text not null,

    score numeric(4,2),

    created_at timestamptz default now()
);

-- =====================================================
-- TRIGGERS & REALTIME
-- =====================================================

-- Auto-create candidate row on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.candidates (user_id, profile_jsonb)
  values (new.id, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Realtime feature on interviews
alter publication supabase_realtime add table interviews;

-- Stale interview cleanup function
create or replace function cleanup_stale_interviews()
returns void
language sql
as $$
    delete from interviews 
    where status in ('preparing', 'failed')
      and created_at < now() - interval '24 hours';
$$;