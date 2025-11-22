-- ============================================
-- HABILITAR TIPOS DE APUESTA USA EN TODOS LOS SORTEOS USA
-- ============================================

PRINT 'Habilitando tipos USA en sorteos USA para TODAS las bancas activas...';
PRINT '';

-- IDs de sorteos USA (countryName = "United States")
-- Florida: 119, 120
-- Georgia: 121, 122, 147
-- New York: 123, 124
-- California: 125, 132
-- Massachusetts: 128
-- Delaware: 129, 152
-- New Jersey: 130, 149
-- Connecticut: 131, 156
-- Illinois/Chicago: 133, 155
-- Pennsylvania: 134, 150
-- Indiana: 135, 148
-- Texas: 139, 140, 141, 145
-- Virginia: 142, 151
-- South Carolina: 143, 158
-- Maryland: 144, 157
-- North Carolina: 153, 166

-- Game types USA (bet_type_id 4-21)
-- 4: Cash3 Straight
-- 5: Cash3 Box
-- 6: Cash3 Front Straight
-- 7: Cash3 Front Box
-- 8: Cash3 Back Straight
-- 9: Cash3 Back Box
-- 10: Play4 Straight
-- 11: Play4 Box
-- 12: Pick5 Straight
-- 13: Pick5 Box
-- 14: Super Pale (ya existe, skip)
-- 15: Pick2
-- 16: Pick2 Front
-- 17: Pick2 Back
-- 18: Pick2 Middle
-- 19: Bolita
-- 20: Singulación
-- 21: Panamá

INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
SELECT bp.betting_pool_id, draws.draw_id, game_types.game_type_id
FROM betting_pools bp
CROSS JOIN (
  -- Todos los sorteos USA
  SELECT 119 AS draw_id UNION ALL
  SELECT 120 UNION ALL
  SELECT 121 UNION ALL
  SELECT 122 UNION ALL
  SELECT 123 UNION ALL
  SELECT 124 UNION ALL
  SELECT 125 UNION ALL
  SELECT 128 UNION ALL
  SELECT 129 UNION ALL
  SELECT 130 UNION ALL
  SELECT 131 UNION ALL
  SELECT 132 UNION ALL
  SELECT 133 UNION ALL
  SELECT 134 UNION ALL
  SELECT 135 UNION ALL
  SELECT 139 UNION ALL
  SELECT 140 UNION ALL
  SELECT 141 UNION ALL
  SELECT 142 UNION ALL
  SELECT 143 UNION ALL
  SELECT 144 UNION ALL
  SELECT 145 UNION ALL
  SELECT 147 UNION ALL
  SELECT 148 UNION ALL
  SELECT 149 UNION ALL
  SELECT 150 UNION ALL
  SELECT 151 UNION ALL
  SELECT 152 UNION ALL
  SELECT 153 UNION ALL
  SELECT 155 UNION ALL
  SELECT 156 UNION ALL
  SELECT 157 UNION ALL
  SELECT 158 UNION ALL
  SELECT 166
) draws
CROSS JOIN (
  -- Todos los tipos de apuesta USA (4-21, skip 14 que es Super Pale DOM)
  SELECT 4 AS game_type_id UNION ALL   -- Cash3 Straight
  SELECT 5 UNION ALL                   -- Cash3 Box
  SELECT 6 UNION ALL                   -- Cash3 Front Straight
  SELECT 7 UNION ALL                   -- Cash3 Front Box
  SELECT 8 UNION ALL                   -- Cash3 Back Straight
  SELECT 9 UNION ALL                   -- Cash3 Back Box
  SELECT 10 UNION ALL                  -- Play4 Straight
  SELECT 11 UNION ALL                  -- Play4 Box
  SELECT 12 UNION ALL                  -- Pick5 Straight
  SELECT 13 UNION ALL                  -- Pick5 Box
  SELECT 15 UNION ALL                  -- Pick2
  SELECT 16 UNION ALL                  -- Pick2 Front
  SELECT 17 UNION ALL                  -- Pick2 Back
  SELECT 18 UNION ALL                  -- Pick2 Middle
  SELECT 19 UNION ALL                  -- Bolita
  SELECT 20 UNION ALL                  -- Singulación
  SELECT 21                            -- Panamá
) game_types
WHERE bp.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM betting_pool_draw_game_types existing
    WHERE existing.betting_pool_id = bp.betting_pool_id
      AND existing.draw_id = draws.draw_id
      AND existing.game_type_id = game_types.game_type_id
  );

PRINT '';
PRINT 'Relaciones creadas:';
SELECT COUNT(*) AS total_relaciones_usa
FROM betting_pool_draw_game_types bpdgt
JOIN betting_pools bp ON bpdgt.betting_pool_id = bp.betting_pool_id
WHERE bpdgt.draw_id IN (
  119, 120, 121, 122, 123, 124, 125, 128, 129, 130,
  131, 132, 133, 134, 135, 139, 140, 141, 142, 143,
  144, 145, 147, 148, 149, 150, 151, 152, 153, 155,
  156, 157, 158, 166
);

PRINT '';
PRINT '✅ Tipos USA habilitados exitosamente en sorteos USA!';
PRINT '';
PRINT 'Configuración:';
PRINT '  - Sorteos USA: 34 sorteos';
PRINT '  - Tipos de apuesta USA: 17 tipos (4-21, skip 14)';
PRINT '  - Bancas activas: consultar total arriba';
PRINT '';
PRINT 'Fórmula: bancas_activas × 34 sorteos × 17 tipos';
PRINT '         (ej: 10 bancas = 5,780 relaciones)';
