USE [lottery-db];
GO

-- Show all lotteries grouped by country
SELECT
    c.country_name AS Country,
    lc.lottery_name AS Lottery,
    lc.lottery_type AS State_Type,
    lc.lottery_id AS ID
FROM lotteries_copy lc
INNER JOIN countries c ON lc.country_id = c.country_id
ORDER BY c.country_name, lc.lottery_name;

-- Summary
SELECT 
    'lotteries_copy' AS table_name,
    COUNT(*) AS total_records
FROM lotteries_copy;
