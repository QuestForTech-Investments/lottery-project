USE [lottery-db];
GO

-- Verify deletion
SELECT 'draws' AS table_name, COUNT(*) AS record_count FROM draws
UNION ALL
SELECT 'draw_prize_configs', COUNT(*) FROM draw_prize_configs
UNION ALL
SELECT 'draws_backup_20251111', COUNT(*) FROM draws_backup_20251111;

-- Verify related tables are clean
SELECT 'results (with draw_id)' AS check_name, COUNT(*) AS count FROM results WHERE draw_id IS NOT NULL
UNION ALL
SELECT 'ticket_lines (with draw_id)', COUNT(*) FROM ticket_lines WHERE draw_id IS NOT NULL
UNION ALL
SELECT 'betting_pool_draws', COUNT(*) FROM betting_pool_draws;
