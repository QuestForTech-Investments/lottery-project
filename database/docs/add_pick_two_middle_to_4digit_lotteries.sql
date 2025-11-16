-- ============================================================================
-- AGREGAR PICK TWO MIDDLE a loterías de 4 dígitos (si falta)
-- ============================================================================
-- Purpose: Agregar Pick Two Middle a loterías que tienen 4+ dígitos pero
--          no tienen este tipo de apuesta configurado
-- Author: System Generated
-- Date: 2025-11-07
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '========================================================================';
PRINT 'AGREGAR PICK TWO MIDDLE A LOTERÍAS DE 4+ DÍGITOS';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';

-- ============================================================================
-- PASO 1: Verificar loterías que NO tienen Pick Two Middle
-- ============================================================================
PRINT '1. LOTERÍAS SIN PICK TWO MIDDLE';
PRINT '   ---------------------------------------------------';

-- Obtener bet_type_id de Pick Two Middle
DECLARE @pick_two_middle_id INT;
SELECT @pick_two_middle_id = bet_type_id
FROM bet_types
WHERE bet_type_code = 'PICK TWO MIDDLE';

PRINT '   Pick Two Middle bet_type_id: ' + CAST(@pick_two_middle_id AS VARCHAR);
PRINT '';

-- Loterías que NO tienen Pick Two Middle configurado
SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    c.country_name AS Pais,
    CASE
        WHEN l.lottery_name LIKE '%PICK 4%' THEN '4 dígitos (seguro)'
        WHEN l.lottery_name LIKE '%PLAY 4%' THEN '4 dígitos (seguro)'
        WHEN l.lottery_name LIKE '%PICK2%' THEN '2 dígitos (NO aplica)'
        WHEN l.lottery_name LIKE '%6X1%' THEN '6 números (NO aplica)'
        ELSE 'Confirmar con cliente'
    END AS Formato
FROM lotteries l
INNER JOIN countries c ON l.country_id = c.country_id
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_bet_type_compatibility lbtc
      WHERE lbtc.lottery_id = l.lottery_id
        AND lbtc.bet_type_id = @pick_two_middle_id
  )
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 2: OPCIÓN A - Agregar a loterías específicas
-- ============================================================================
PRINT '2. OPCIÓN A: AGREGAR A LOTERÍAS ESPECÍFICAS';
PRINT '   (Ejecutar solo si el cliente confirma que estas SÍ deben tenerlo)';
PRINT '   ---------------------------------------------------';

-- Descomenta y modifica esta lista según confirmación del cliente
/*
DECLARE @lotteries_to_add TABLE (lottery_name VARCHAR(100));

INSERT INTO @lotteries_to_add VALUES
    ('NEW YORK DAY'),
    ('NEW YORK NIGHT');
    -- Agregar más según necesidad

DECLARE @added INT = 0;

INSERT INTO lottery_bet_type_compatibility (lottery_id, bet_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    @pick_two_middle_id,
    1 AS is_active,
    GETDATE() AS created_at,
    GETDATE() AS updated_at
FROM lotteries l
INNER JOIN @lotteries_to_add lta ON l.lottery_name = lta.lottery_name
WHERE l.is_active = 1
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_bet_type_compatibility lbtc
      WHERE lbtc.lottery_id = l.lottery_id
        AND lbtc.bet_type_id = @pick_two_middle_id
  );

SET @added = @@ROWCOUNT;

PRINT '   ✓ Agregados: ' + CAST(@added AS VARCHAR) + ' registros de Pick Two Middle';
*/

PRINT '   (Sección comentada - descomentar después de confirmar con cliente)';
PRINT '';

-- ============================================================================
-- PASO 3: OPCIÓN B - Agregar automáticamente a todas las PICK 4/PLAY 4
-- ============================================================================
PRINT '3. OPCIÓN B: AGREGAR AUTOMÁTICAMENTE A PICK 4 / PLAY 4';
PRINT '   (Más seguro - solo agrega a loterías claramente de 4 dígitos)';
PRINT '   ---------------------------------------------------';

-- Descomenta para ejecutar
/*
DECLARE @added_auto INT = 0;

INSERT INTO lottery_bet_type_compatibility (lottery_id, bet_type_id, is_active, created_at, updated_at)
SELECT
    l.lottery_id,
    @pick_two_middle_id,
    1 AS is_active,
    GETDATE() AS created_at,
    GETDATE() AS updated_at
FROM lotteries l
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
  AND (l.lottery_name LIKE '%PICK 4%'
       OR l.lottery_name LIKE '%PLAY 4%'
       OR l.lottery_name LIKE '%PLAY4%')
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_bet_type_compatibility lbtc
      WHERE lbtc.lottery_id = l.lottery_id
        AND lbtc.bet_type_id = @pick_two_middle_id
  );

SET @added_auto = @@ROWCOUNT;

PRINT '   ✓ Agregados: ' + CAST(@added_auto AS VARCHAR) + ' registros de Pick Two Middle';
PRINT '   ✓ Criterio: Loterías con PICK 4 / PLAY 4 en el nombre';
*/

PRINT '   (Sección comentada - descomentar después de confirmar con cliente)';
PRINT '';

-- ============================================================================
-- PASO 4: Reactivar registros desactivados (si aplica)
-- ============================================================================
PRINT '4. REACTIVAR REGISTROS PREVIAMENTE DESACTIVADOS';
PRINT '   (Si Pick Two Middle fue desactivado por error)';
PRINT '   ---------------------------------------------------';

-- Descomenta para ejecutar
/*
DECLARE @reactivated INT = 0;

UPDATE lbtc
SET is_active = 1,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
WHERE lbtc.bet_type_id = @pick_two_middle_id
  AND lbtc.is_active = 0
  AND l.country_id = 1
  AND (l.lottery_name LIKE '%PICK 4%'
       OR l.lottery_name LIKE '%PLAY 4%'
       OR l.lottery_name LIKE '%PLAY4%');

SET @reactivated = @@ROWCOUNT;

PRINT '   ✓ Reactivados: ' + CAST(@reactivated AS VARCHAR) + ' registros';
*/

PRINT '   (Sección comentada - descomentar si es necesario)';
PRINT '';

-- ============================================================================
-- PASO 5: Verificación final
-- ============================================================================
PRINT '5. VERIFICACIÓN FINAL';
PRINT '   ---------------------------------------------------';

PRINT '   Loterías con Pick Two Middle activo:';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    c.country_name AS Pais,
    lbtc.is_active AS Activo
FROM lotteries l
INNER JOIN countries c ON l.country_id = c.country_id
INNER JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_code = 'PICK TWO MIDDLE'
  AND l.is_active = 1
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- COMPLETION
-- ============================================================================
PRINT '========================================================================';
PRINT 'SCRIPT COMPLETADO';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';
PRINT 'IMPORTANTE:';
PRINT '  • Este script tiene secciones comentadas';
PRINT '  • Descomentar OPCIÓN A o OPCIÓN B según confirmación del cliente';
PRINT '  • OPCIÓN A: Agregar a loterías específicas (lista manual)';
PRINT '  • OPCIÓN B: Agregar solo a PICK 4 (más seguro)';
PRINT '';
PRINT 'PRÓXIMOS PASOS:';
PRINT '  1. Confirmar con cliente qué loterías son de 4+ dígitos';
PRINT '  2. Descomentar la opción apropiada (A o B)';
PRINT '  3. Ejecutar el script';
PRINT '  4. Verificar resultado en frontend';
PRINT '';

GO
