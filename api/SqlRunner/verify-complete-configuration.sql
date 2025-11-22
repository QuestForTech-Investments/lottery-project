-- ============================================
-- VERIFICACIÓN COMPLETA DE CONFIGURACIÓN
-- ============================================

PRINT '========================================';
PRINT 'VERIFICACIÓN DE CONFIGURACIÓN COMPLETA';
PRINT '========================================';
PRINT '';

-- 1. Verificar bet_types
PRINT '1. TIPOS DE APUESTA (bet_types):';
SELECT COUNT(*) AS total_bet_types FROM bet_types;
SELECT
  bet_type_id,
  bet_type_code,
  bet_type_name
FROM bet_types
ORDER BY bet_type_id;
PRINT '';

-- 2. Verificar prize_types por bet_type
PRINT '2. SUB-CAMPOS POR TIPO DE APUESTA (prize_types):';
SELECT
  bt.bet_type_id,
  bt.bet_type_code,
  bt.bet_type_name,
  COUNT(pt.prize_type_id) AS total_subcampos
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id
GROUP BY bt.bet_type_id, bt.bet_type_code, bt.bet_type_name
ORDER BY bt.bet_type_id;
PRINT '';

-- 3. Total general
PRINT '3. RESUMEN GENERAL:';
SELECT
  COUNT(DISTINCT bt.bet_type_id) AS total_tipos,
  COUNT(pt.prize_type_id) AS total_subcampos
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id;
PRINT '';

-- 4. Desglose Dominicanas vs USA
PRINT '4. DESGLOSE DOM vs USA:';
SELECT
  CASE
    WHEN bt.bet_type_id <= 3 THEN 'Dominicanas'
    ELSE 'USA'
  END AS origen,
  COUNT(DISTINCT bt.bet_type_id) AS total_tipos,
  COUNT(pt.prize_type_id) AS total_subcampos
FROM bet_types bt
LEFT JOIN prize_types pt ON bt.bet_type_id = pt.bet_type_id
GROUP BY
  CASE
    WHEN bt.bet_type_id <= 3 THEN 'Dominicanas'
    ELSE 'USA'
  END;
PRINT '';

PRINT '========================================';
PRINT 'VERIFICACIÓN COMPLETADA';
PRINT '========================================';
