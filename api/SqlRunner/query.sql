-- Quick check of draws table dependencies
USE [lottery-db];
GO

SELECT 'draws' AS table_name, COUNT(*) AS record_count FROM draws
UNION ALL
SELECT 'results (with draw_id)', COUNT(*) FROM results WHERE draw_id IS NOT NULL
UNION ALL
SELECT 'betting_pool_draws', COUNT(*) FROM betting_pool_draws
UNION ALL
SELECT 'ticket_lines (with draw_id)', COUNT(*) FROM ticket_lines WHERE draw_id IS NOT NULL
UNION ALL
SELECT 'draw_prize_configs', COUNT(*) FROM draw_prize_configs WHERE draw_id IS NOT NULL;

-- Show sample draws
SELECT TOP 5 draw_id, lottery_id, draw_name, draw_time, is_active 
FROM draws 
ORDER BY draw_id;
