USE [lottery-db];
GO

-- List all lotteries in lotteries_copy with country info
SELECT 
    lc.lottery_id AS ID,
    c.country_name AS Country,
    lc.lottery_name AS Lottery_Name,
    lc.lottery_type AS Type_State,
    lc.is_active AS Active,
    lc.created_at AS Created
FROM lotteries_copy lc
INNER JOIN countries c ON lc.country_id = c.country_id
ORDER BY c.country_name, lc.lottery_name;

-- Summary by country
SELECT 
    c.country_name AS Country,
    COUNT(*) AS Total_Lotteries
FROM lotteries_copy lc
INNER JOIN countries c ON lc.country_id = c.country_id
GROUP BY c.country_name
ORDER BY COUNT(*) DESC;
