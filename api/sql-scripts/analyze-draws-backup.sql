USE [lottery-db];
GO

-- Show draws from backup with their original lottery names
SELECT 
    db.draw_id,
    db.lottery_id AS Old_Lottery_ID,
    l.lottery_name AS Original_Lottery_Name,
    db.draw_name,
    db.draw_time,
    db.abbreviation,
    -- Try to find matching lottery in lotteries_copy
    lc.lottery_id AS New_Lottery_ID,
    lc.lottery_name AS New_Lottery_Name
FROM draws_backup_20251111 db
LEFT JOIN lotteries l ON db.lottery_id = l.lottery_id
LEFT JOIN lotteries_copy lc ON l.lottery_name = lc.lottery_name
ORDER BY db.lottery_id, db.draw_time;

-- Summary: how many draws per original lottery
SELECT 
    l.lottery_name AS Original_Lottery,
    COUNT(*) AS Draw_Count,
    lc.lottery_id AS New_Lottery_ID,
    CASE WHEN lc.lottery_id IS NOT NULL THEN 'FOUND' ELSE 'NOT FOUND' END AS Mapping_Status
FROM draws_backup_20251111 db
LEFT JOIN lotteries l ON db.lottery_id = l.lottery_id
LEFT JOIN lotteries_copy lc ON l.lottery_name = lc.lottery_name
GROUP BY l.lottery_name, lc.lottery_id
ORDER BY COUNT(*) DESC;
