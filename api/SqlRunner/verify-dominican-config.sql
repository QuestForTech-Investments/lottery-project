-- ============================================
-- VERIFICAR CONFIGURACIÓN DE LOTERÍAS DOMINICANAS
-- ============================================

PRINT 'Verificando configuración de loterías dominicanas...';
PRINT '';

-- Verificar prize_types
PRINT '1. PRIZE TYPES CONFIGURADOS:';
PRINT '   ============================';
SELECT
  bt.bet_type_code AS 'Tipo',
  pt.field_code AS 'Campo',
  pt.field_name AS 'Nombre',
  pt.default_multiplier AS 'Multiplicador',
  pt.display_order AS 'Orden'
FROM prize_types pt
JOIN bet_types bt ON pt.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_id IN (1, 2, 3)
ORDER BY bt.bet_type_id, pt.display_order;

PRINT '';
PRINT '2. RESUMEN POR TIPO DE APUESTA:';
PRINT '   =============================';
SELECT
  bt.bet_type_name AS 'Tipo de Apuesta',
  COUNT(pt.prize_type_id) AS 'Número de Sub-campos'
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id
WHERE bt.bet_type_id IN (1, 2, 3)
GROUP BY bt.bet_type_name;

PRINT '';
PRINT '3. SORTEOS HABILITADOS POR BANCA (ejemplo):';
PRINT '   ==========================================';
-- Mostrar solo las primeras 2 bancas como ejemplo
SELECT TOP 20
  bp.betting_pool_name AS 'Banca',
  d.draw_name AS 'Sorteo',
  gt.game_type_code AS 'Tipo',
  COUNT(pt.prize_type_id) AS 'Sub-campos'
FROM betting_pool_draw_game_types bpdgt
JOIN betting_pools bp ON bpdgt.betting_pool_id = bp.betting_pool_id
JOIN draws d ON bpdgt.draw_id = d.draw_id
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
LEFT JOIN prize_types pt ON pt.bet_type_id = gt.game_type_id
WHERE d.draw_id IN (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138)
  AND gt.game_type_id IN (1, 2, 3)
GROUP BY bp.betting_pool_name, d.draw_name, gt.game_type_code
ORDER BY bp.betting_pool_name, d.draw_name, gt.game_type_code;

PRINT '';
PRINT '4. TOTALES GENERALES:';
PRINT '   ===================';
SELECT
  (SELECT COUNT(*) FROM betting_pools WHERE is_active = 1) AS 'Bancas Activas',
  (SELECT COUNT(DISTINCT draw_id) FROM betting_pool_draw_game_types
   WHERE draw_id IN (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138)) AS 'Sorteos Configurados',
  (SELECT COUNT(DISTINCT game_type_id) FROM betting_pool_draw_game_types
   WHERE game_type_id IN (1, 2, 3)) AS 'Tipos de Apuesta',
  (SELECT COUNT(*) FROM betting_pool_draw_game_types
   WHERE game_type_id IN (1, 2, 3)
   AND draw_id IN (127, 161, 162, 163, 164, 165, 167, 168, 136, 137, 138)) AS 'Total Relaciones';

PRINT '';
PRINT 'Verificación completada!';
