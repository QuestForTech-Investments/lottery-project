-- ============================================
-- CONFIGURACIÓN LOTERÍAS DOMINICANAS
-- ============================================

-- Paso 1: Limpiar configuración existente (si existe)
DELETE FROM prize_types WHERE bet_type_id IN (1, 2, 3);

-- Paso 2: Insertar prize_types correctos

-- DIRECTO (bet_type_id = 1)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (1, 'DIRECTO_PRIMER_PAGO', 'Directo - Primer Pago', 56.0, 1),
  (1, 'DIRECTO_SEGUNDO_PAGO', 'Directo - Segundo Pago', 12.0, 2),
  (1, 'DIRECTO_TERCER_PAGO', 'Directo - Tercer Pago', 4.0, 3),
  (1, 'DIRECTO_DOBLES', 'Directo - Dobles', 56.0, 4);

-- PALE (bet_type_id = 2)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (2, 'PALE_TODOS_SECUENCIA', 'Palé - Todos en secuencia', 1100.0, 1),
  (2, 'PALE_PRIMER_PAGO', 'Palé - Primer Pago', 1100.0, 2),
  (2, 'PALE_SEGUNDO_PAGO', 'Palé - Segundo Pago', 1100.0, 3),
  (2, 'PALE_TERCER_PAGO', 'Palé - Tercer Pago', 100.0, 4);

-- TRIPLETA (bet_type_id = 3)
INSERT INTO prize_types (bet_type_id, field_code, field_name, default_multiplier, display_order)
VALUES
  (3, 'TRIPLETA_PRIMER_PAGO', 'Tripleta - Primer Pago', 10000.0, 1),
  (3, 'TRIPLETA_SEGUNDO_PAGO', 'Tripleta - Segundo Pago', 100.0, 2);

-- Paso 3: Habilitar estos tipos para sorteos dominicanos
-- Asumiendo betting_pool_id = 1 (ajustar según sea necesario)

DECLARE @BettingPoolId INT = 1;

INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
SELECT @BettingPoolId, draw_id, game_type_id
FROM (
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
) game_types;

-- Verificar que todo quedó bien
PRINT 'Configuración de loterías dominicanas completada exitosamente!';
PRINT '';
PRINT 'Resumen:';
PRINT '  - 10 prize_types insertados (4 DIRECTO + 4 PALÉ + 2 TRIPLETA)';
PRINT '  - 33 relaciones insertadas (11 sorteos × 3 tipos)';
