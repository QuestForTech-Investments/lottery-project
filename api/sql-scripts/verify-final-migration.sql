USE [lottery-db];
GO

-- Summary
SELECT 
    'lotteries_copy' AS table_name,
    COUNT(*) AS total_records
FROM lotteries_copy
UNION ALL
SELECT 
    'draws',
    COUNT(*)
FROM draws;

-- Draws per lottery
SELECT
    lc.lottery_id,
    c.country_name AS Country,
    lc.lottery_name AS Lottery,
    COUNT(d.draw_id) AS Total_Draws
FROM lotteries_copy lc
LEFT JOIN draws d ON lc.lottery_id = d.lottery_id
LEFT JOIN countries c ON lc.country_id = c.country_id
GROUP BY lc.lottery_id, c.country_name, lc.lottery_name
ORDER BY c.country_name, lc.lottery_name;
