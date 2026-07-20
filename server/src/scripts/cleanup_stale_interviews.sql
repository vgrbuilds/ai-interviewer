-- =====================================================
-- STALE INTERVIEW CLEANUP FUNCTION (Solution A)
-- =====================================================

-- 1. Create SQL Function to purge interviews stuck in 'preparing' or 'failed' for > 24 hours
create or replace function cleanup_stale_interviews()
returns void
language sql
as $$
    delete from interviews 
    where status in ('preparing', 'failed')
      and created_at < now() - interval '24 hours';
$$;

-- 2. Optional: Schedule via pg_cron (if pg_cron extension is enabled on Supabase)
-- select cron.schedule('0 0 * * *', $$ select cleanup_stale_interviews(); $$);
