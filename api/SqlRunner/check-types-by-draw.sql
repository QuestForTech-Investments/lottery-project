-- Tipos configurados para LOTEKA (draw_id 127)
SELECT TOP 5
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 127
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

GO

-- Tipos configurados para FLORIDA AM (draw_id 119)
SELECT TOP 10
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 119
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

GO

-- Tipos configurados para ANGUILA 6PM (draw_id 146)
SELECT TOP 10
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 146
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

GO

-- Resumen totales
SELECT 'Tipos únicos' AS metrica, COUNT(DISTINCT game_type_id) AS total FROM betting_pool_draw_game_types
UNION ALL
SELECT 'Sorteos únicos', COUNT(DISTINCT draw_id) FROM betting_pool_draw_game_types
UNION ALL
SELECT 'Bancas únicas', COUNT(DISTINCT betting_pool_id) FROM betting_pool_draw_game_types
UNION ALL
SELECT 'Relaciones totales', COUNT(*) FROM betting_pool_draw_game_types;
