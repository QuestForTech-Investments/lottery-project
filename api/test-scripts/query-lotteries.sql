USE [lottery-db];
GO

-- Contar loterías activas
SELECT COUNT(*) AS TotalActiveLotteries
FROM lotteries
WHERE is_active = 1;
GO

-- Listar todas las loterías activas ordenadas por ID
SELECT
    lottery_id,
    lottery_name,
    lottery_type,
    is_active
FROM lotteries
WHERE is_active = 1
ORDER BY lottery_id;
GO
