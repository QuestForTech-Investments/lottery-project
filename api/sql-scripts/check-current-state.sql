USE [lottery-db];
GO

-- Check current counts
SELECT 'lotteries_copy' AS table_name, COUNT(*) AS total FROM lotteries_copy
UNION ALL
SELECT 'draws', COUNT(*) FROM draws
UNION ALL
SELECT 'lotteries (original)', COUNT(*) FROM lotteries
UNION ALL
SELECT 'draws_backup_20251111', COUNT(*) FROM draws_backup_20251111;

-- Check which lotteries are in backup but not in lotteries_copy
SELECT DISTINCT
    l.lottery_name AS Missing_Lottery
FROM draws_backup_20251111 db
INNER JOIN lotteries l ON db.lottery_id = l.lottery_id
WHERE l.lottery_name NOT IN (SELECT lottery_name FROM lotteries_copy)
ORDER BY l.lottery_name;
