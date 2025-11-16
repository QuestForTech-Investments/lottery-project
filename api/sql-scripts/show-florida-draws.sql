USE [lottery-db];
GO

-- Show all draws for Florida Lottery
SELECT 
    d.draw_id,
    lc.lottery_name AS Lottery,
    d.draw_name AS Sorteo,
    d.draw_time AS Hora,
    d.abbreviation AS Abreviacion,
    d.is_active AS Activo
FROM draws d
INNER JOIN lotteries_copy lc ON d.lottery_id = lc.lottery_id
WHERE lc.lottery_name = 'Florida Lottery'
ORDER BY d.draw_id;
