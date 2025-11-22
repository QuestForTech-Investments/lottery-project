-- Verificar tipos de apuesta visibles por sorteo y banca

PRINT 'Verificando tipos de apuesta configurados por sorteo...'
PRINT ''

-- 1. SORTEO DOMINICANO (LOTEKA - draw_id 127)
PRINT '============================================'
PRINT '1. SORTEO DOMINICANO: LOTEKA (draw_id 127)'
PRINT '============================================'
SELECT DISTINCT
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name,
  COUNT(bpdgt.betting_pool_id) AS num_bancas_configuradas
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 127
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

PRINT ''
PRINT '============================================'
PRINT '2. SORTEO USA: FLORIDA AM (draw_id 119)'
PRINT '============================================'
SELECT DISTINCT
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name,
  COUNT(bpdgt.betting_pool_id) AS num_bancas_configuradas
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 119
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

PRINT ''
PRINT '============================================'
PRINT '3. SORTEO CARIBE: ANGUILA 6PM (draw_id 146)'
PRINT '============================================'
SELECT DISTINCT
  gt.game_type_id,
  gt.game_type_code,
  gt.game_name,
  COUNT(bpdgt.betting_pool_id) AS num_bancas_configuradas
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
WHERE bpdgt.draw_id = 146
GROUP BY gt.game_type_id, gt.game_type_code, gt.game_name
ORDER BY gt.game_type_id;

PRINT ''
PRINT '============================================'
PRINT 'RESUMEN GENERAL'
PRINT '============================================'
SELECT
  'Total tipos de apuesta configurados' AS metrica,
  COUNT(DISTINCT game_type_id) AS valor
FROM betting_pool_draw_game_types
UNION ALL
SELECT
  'Total sorteos configurados',
  COUNT(DISTINCT draw_id)
FROM betting_pool_draw_game_types
UNION ALL
SELECT
  'Total bancas configuradas',
  COUNT(DISTINCT betting_pool_id)
FROM betting_pool_draw_game_types
UNION ALL
SELECT
  'Total relaciones creadas',
  COUNT(*)
FROM betting_pool_draw_game_types;

PRINT ''
PRINT '============================================'
PRINT 'Sub-campos de premios por tipo'
PRINT '============================================'
SELECT
  bt.bet_type_id,
  bt.bet_type_code,
  bt.bet_type_name,
  COUNT(pt.prize_type_id) AS num_subcampos
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id
GROUP BY bt.bet_type_id, bt.bet_type_code, bt.bet_type_name
ORDER BY bt.bet_type_id;
