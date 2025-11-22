-- ============================================
-- CONFIGURACIÓN LOTERÍAS DOMINICANAS
-- HABILITAR PARA TODAS LAS BANCAS
-- ============================================

-- Paso 3: Habilitar estos tipos para sorteos dominicanos en TODAS las bancas
PRINT 'Habilitando DIRECTO, PALÉ y TRIPLETA para 11 sorteos dominicanos en todas las bancas...';
PRINT '';

INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
SELECT bp.betting_pool_id, draws.draw_id, game_types.game_type_id
FROM betting_pools bp
CROSS JOIN (
  -- 11 sorteos dominicanos
  SELECT 127 AS draw_id UNION ALL  -- LOTEKA
  SELECT 161 UNION ALL             -- LA PRIMERA
  SELECT 162 UNION ALL             -- LA SUERTE
  SELECT 163 UNION ALL             -- GANA MAS
  SELECT 164 UNION ALL             -- LOTEDOM
  SELECT 165 UNION ALL             -- NACIONAL
  SELECT 167 UNION ALL             -- REAL
  SELECT 168 UNION ALL             -- SUPER PALE TARDE
  SELECT 136 UNION ALL             -- SUPER PALE NOCHE
  SELECT 137 UNION ALL             -- SUPER PALE NY-FL AM
  SELECT 138                       -- SUPER PALE NY-FL PM
) draws
CROSS JOIN (
  -- 3 tipos de apuesta
  SELECT 1 AS game_type_id UNION ALL  -- DIRECTO
  SELECT 2 UNION ALL                  -- PALE
  SELECT 3                            -- TRIPLETA
) game_types
WHERE bp.is_active = 1;  -- Solo bancas activas

-- Contar resultados
DECLARE @NumBancas INT;
DECLARE @NumRegistros INT;

SELECT @NumBancas = COUNT(*) FROM betting_pools WHERE is_active = 1;
SELECT @NumRegistros = COUNT(*) FROM betting_pool_draw_game_types
WHERE game_type_id IN (1, 2, 3)
  AND draw_id IN (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138);

PRINT '';
PRINT 'Configuración completada exitosamente!';
PRINT '';
PRINT 'Resumen:';
PRINT '  - Bancas activas: ' + CAST(@NumBancas AS VARCHAR);
PRINT '  - Sorteos dominicanos: 11';
PRINT '  - Tipos de apuesta habilitados: 3 (DIRECTO, PALÉ, TRIPLETA)';
PRINT '  - Total de relaciones insertadas: ' + CAST(@NumRegistros AS VARCHAR) + ' (' + CAST(@NumBancas AS VARCHAR) + ' bancas × 11 sorteos × 3 tipos)';
PRINT '';
PRINT 'Cada tipo de apuesta tiene sus prize_types:';
PRINT '  - DIRECTO: 4 sub-campos (Primer Pago 56x, Segundo Pago 12x, Tercer Pago 4x, Dobles 56x)';
PRINT '  - PALÉ: 4 sub-campos (Todos en secuencia 1100x, Primer Pago 1100x, Segundo Pago 1100x, Tercer Pago 100x)';
PRINT '  - TRIPLETA: 2 sub-campos (Primer Pago 10000x, Segundo Pago 100x)';
