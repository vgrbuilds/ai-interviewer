-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table candidates enable row level security;
alter table jobs enable row level security;
alter table interviews enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;

-- =====================================================
-- CANDIDATES
-- =====================================================

create policy "Users can view their own candidate profile"
on candidates
for select
using (
    user_id = auth.uid()
);

create policy "Users can create their own candidate profile"
on candidates
for insert
with check (
    user_id = auth.uid()
);

create policy "Users can update their own candidate profile"
on candidates
for update
using (
    user_id = auth.uid()
);

create policy "Users can delete their own candidate profile"
on candidates
for delete
using (
    user_id = auth.uid()
);

-- =====================================================
-- JOBS
-- =====================================================

-- Any authenticated user can read jobs.

create policy "Authenticated users can read jobs"
on jobs
for select
using (
    auth.uid() is not null
);

-- =====================================================
-- INTERVIEWS
-- =====================================================

create policy "Users can view their interviews"
on interviews
for select
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can create their interviews"
on interviews
for insert
with check (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can update their interviews"
on interviews
for update
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can delete their interviews"
on interviews
for delete
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

-- =====================================================
-- QUESTIONS
-- =====================================================

create policy "Users can view interview questions"
on questions
for select
using (
    id in (
        select unnest(question_sequence)
        from interviews
        where candidate_id in (
            select id
            from candidates
            where user_id = auth.uid()
        )
    )
);

-- =====================================================
-- ANSWERS
-- =====================================================

create policy "Users can view their answers"
on answers
for select
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can create their answers"
on answers
for insert
with check (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can update their answers"
on answers
for update
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);

create policy "Users can delete their answers"
on answers
for delete
using (
    candidate_id in (
        select id
        from candidates
        where user_id = auth.uid()
    )
);