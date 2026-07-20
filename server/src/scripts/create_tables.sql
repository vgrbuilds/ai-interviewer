-- =====================================================
-- ENUMS
-- =====================================================

create type interview_status as enum (
    'preparing',
    'in_progress',
    'completed',
    'evaluated'
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

    profile_jsonb jsonb not null,

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