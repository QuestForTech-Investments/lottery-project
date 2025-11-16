USE [lottery-db];
GO

-- Show all records from original lotteries table
SELECT 
    lottery_id,
    lottery_name,
    lottery_type,
    country_id
FROM lotteries
ORDER BY lottery_id;

-- Count
SELECT COUNT(*) AS total_lotteries FROM lotteries;
