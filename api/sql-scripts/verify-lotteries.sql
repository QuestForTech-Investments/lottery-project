-- Consultar todas las loterías en la base de datos
PRINT '=== LOTERÍAS EN LA BASE DE DATOS ==='
PRINT ''

SELECT 
    lottery_id,
    lottery_name,
    lottery_type,
    country_id,
    is_active,
    created_at
FROM lotteries
ORDER BY lottery_id;

PRINT ''
PRINT '=== RESUMEN ==='
SELECT 
    COUNT(*) as total_lotteries,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_lotteries,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_lotteries
FROM lotteries;
