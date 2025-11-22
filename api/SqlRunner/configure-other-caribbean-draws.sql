-- ============================================
-- HABILITAR TIPOS USA EN SORTEOS DEL CARIBE (NO-DOM, NO-USA)
-- Anguilla + King Lottery (Netherlands Caribbean)
-- ============================================

PRINT 'Habilitando tipos USA en sorteos del Caribe...';
PRINT '';

-- IDs de sorteos del Caribe:
-- Anguilla: 126, 146, 154, 159, 160
-- King Lottery (Netherlands Caribbean): 126

INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
SELECT bp.betting_pool_id, draws.draw_id, game_types.game_type_id
FROM betting_pools bp
CROSS JOIN (
  -- Sorteos de Anguilla y King Lottery
  SELECT 126 AS draw_id UNION ALL  -- King Lottery AM
  SELECT 146 UNION ALL             -- Anguila 6PM
  SELECT 154 UNION ALL             -- Anguila 9pm
  SELECT 159 UNION ALL             -- Anguila 10am
  SELECT 160                       -- Anguila 1pm
) draws
CROSS JOIN (
  -- Todos los tipos de apuesta USA (4-21, skip 14)
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
SELECT COUNT(*) AS total_relaciones_caribe
FROM betting_pool_draw_game_types bpdgt
WHERE bpdgt.draw_id IN (126, 146, 154, 159, 160);

PRINT '';
PRINT '✅ Tipos USA habilitados en sorteos del Caribe!';
PRINT '';
PRINT 'Configuración:';
PRINT '  - Sorteos: 5 (Anguilla: 4, King Lottery: 1)';
PRINT '  - Tipos de apuesta USA: 17 tipos (4-21, skip 14)';
PRINT '  - Bancas activas: consultar total arriba';
PRINT '';
PRINT 'Fórmula: bancas_activas × 5 sorteos × 17 tipos';
PRINT '         (ej: 10 bancas = 850 relaciones adicionales)';
