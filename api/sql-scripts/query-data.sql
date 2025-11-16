-- Ver todas las loterías/sorteos disponibles
PRINT '=== LOTERÍAS/SORTEOS DISPONIBLES ==='
SELECT lottery_id, lottery_name, lottery_type, is_active 
FROM lotteries 
WHERE is_active = 1
ORDER BY lottery_name;

PRINT ''
PRINT '=== TIPOS DE JUEGOS DISPONIBLES ==='
SELECT game_type_id, game_type_code, game_name, prize_multiplier, number_length, display_order, is_active
FROM game_types
WHERE is_active = 1
ORDER BY display_order, game_name;

PRINT ''
PRINT '=== CONTEO DE SORTEOS CONFIGURADOS EN BANCAS ==='
SELECT COUNT(*) as total_sortitions FROM betting_pool_sortitions;

PRINT ''
PRINT '=== COMPATIBILIDADES ENTRE LOTERÍAS Y TIPOS DE JUEGOS (primeros 10) ==='
SELECT TOP 10
    lgc.compatibility_id,
    l.lottery_name,
    gt.game_name,
    lgc.is_active as compatibility_active
FROM lottery_game_compatibility lgc
INNER JOIN lotteries l ON lgc.lottery_id = l.lottery_id
INNER JOIN game_types gt ON lgc.game_type_id = gt.game_type_id
WHERE lgc.is_active = 1
ORDER BY l.lottery_name, gt.game_name;
