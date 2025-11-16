-- Consultar todos los tipos de juegos (game_types) en la base de datos
PRINT '=== TIPOS DE JUEGOS (GAME TYPES) EN LA BASE DE DATOS ==='
PRINT ''

SELECT
    game_type_id,
    game_type_code,
    game_name,
    prize_multiplier,
    number_length,
    requires_additional_number,
    display_order,
    is_active,
    created_at
FROM game_types
ORDER BY display_order, game_type_id;

PRINT ''
PRINT '=== RESUMEN ==='
SELECT
    COUNT(*) as total_game_types,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_game_types,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_game_types
FROM game_types;
