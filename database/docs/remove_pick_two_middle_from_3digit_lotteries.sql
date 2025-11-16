-- ============================================================================
-- REMOVER PICK TWO MIDDLE de loterías de 3 dígitos (si no aplica)
-- ============================================================================
-- Purpose: Desactivar Pick Two Middle de loterías que solo tienen 3 dígitos
--          Pick Two Middle solo aplica a loterías de 4+ dígitos
-- Author: System Generated
-- Date: 2025-11-07
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '========================================================================';
PRINT 'REMOVER PICK TWO MIDDLE DE LOTERÍAS DE 3 DÍGITOS';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';

-- ============================================================================
-- PASO 1: Identificar loterías con Pick Two Middle activo
-- ============================================================================
PRINT '1. LOTERÍAS CON PICK TWO MIDDLE ACTIVO';
PRINT '   ---------------------------------------------------';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    c.country_name AS Pais,
    bt.bet_type_code AS TipoApuesta,
    lbtc.is_active AS Activo
FROM lotteries l
INNER JOIN countries c ON l.country_id = c.country_id
INNER JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_code = 'PICK TWO MIDDLE'
  AND lbtc.is_active = 1
  AND l.is_active = 1
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 2: Listar loterías de 3 dígitos (según nombre)
-- ============================================================================
PRINT '2. LOTERÍAS QUE PROBABLEMENTE SON DE 3 DÍGITOS';
PRINT '   (NEW YORK, FLORIDA, GEORGIA, etc. - sorteos estándar)';
PRINT '   ---------------------------------------------------';

-- Estas loterías típicamente son de 3 dígitos
-- Excluir: FL PICK2 (son de 2 dígitos), Pick 4 (son de 4 dígitos)
SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    CASE
        WHEN l.lottery_name LIKE '%PICK 4%' THEN '4 dígitos'
        WHEN l.lottery_name LIKE '%PICK2%' THEN '2 dígitos'
        WHEN l.lottery_name LIKE '%6X1%' THEN '6 números'
        ELSE '3 dígitos (probable)'
    END AS FormatoEstimado
FROM lotteries l
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
  AND l.lottery_name NOT LIKE '%PICK 4%'
  AND l.lottery_name NOT LIKE '%6X1%'
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 3: OPCIÓN A - Desactivar Pick Two Middle de loterías específicas
-- ============================================================================
PRINT '3. OPCIÓN A: DESACTIVAR PICK TWO MIDDLE DE LOTERÍAS ESPECÍFICAS';
PRINT '   (Ejecutar solo si el cliente confirma que estas NO deben tenerlo)';
PRINT '   ---------------------------------------------------';

-- Descomenta y modifica esta lista según confirmación del cliente
/*
DECLARE @lotteries_to_remove TABLE (lottery_name VARCHAR(100));

INSERT INTO @lotteries_to_remove VALUES
    ('NEW YORK DAY'),
    ('NEW YORK NIGHT'),
    ('FLORIDA AM'),
    ('FLORIDA PM'),
    ('GEORGIA-MID AM'),
    ('GEORGIA EVENING'),
    ('GEORGIA NIGHT');
    -- Agregar más según necesidad

DECLARE @removed INT = 0;

UPDATE lbtc
SET is_active = 0,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
INNER JOIN @lotteries_to_remove ltr ON l.lottery_name = ltr.lottery_name
WHERE bt.bet_type_code = 'PICK TWO MIDDLE'
  AND lbtc.is_active = 1;

SET @removed = @@ROWCOUNT;

PRINT '   ✓ Desactivados: ' + CAST(@removed AS VARCHAR) + ' registros de Pick Two Middle';
*/

PRINT '   (Sección comentada - descomentar después de confirmar con cliente)';
PRINT '';

-- ============================================================================
-- PASO 4: OPCIÓN B - Desactivar Pick Two Middle de TODAS las loterías US
--         EXCEPTO las que explícitamente deben tenerlo
-- ============================================================================
PRINT '4. OPCIÓN B: DESACTIVAR DE TODAS EXCEPTO PICK 4 Y OTRAS ESPECIALES';
PRINT '   (Más seguro - solo mantiene activo en loterías de 4+ dígitos)';
PRINT '   ---------------------------------------------------';

-- Descomenta para ejecutar
/*
DECLARE @removed_all INT = 0;

UPDATE lbtc
SET is_active = 0,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_code = 'PICK TWO MIDDLE'
  AND l.country_id = 1  -- Solo Estados Unidos
  AND lbtc.is_active = 1
  -- Mantener activo solo en loterías de 4 dígitos
  AND l.lottery_name NOT LIKE '%PICK 4%'
  AND l.lottery_name NOT LIKE '%PLAY 4%'
  AND l.lottery_name NOT LIKE '%PLAY4%';

SET @removed_all = @@ROWCOUNT;

PRINT '   ✓ Desactivados: ' + CAST(@removed_all AS VARCHAR) + ' registros de Pick Two Middle';
PRINT '   ✓ Mantenidos activos: Loterías con PICK 4 / PLAY 4 en el nombre';
*/

PRINT '   (Sección comentada - descomentar después de confirmar con cliente)';
PRINT '';

-- ============================================================================
-- PASO 5: Verificación
-- ============================================================================
PRINT '5. VERIFICACIÓN FINAL';
PRINT '   ---------------------------------------------------';

PRINT '   Loterías que AÚN tienen Pick Two Middle activo:';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    c.country_name AS Pais
FROM lotteries l
INNER JOIN countries c ON l.country_id = c.country_id
INNER JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE bt.bet_type_code = 'PICK TWO MIDDLE'
  AND lbtc.is_active = 1
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
PRINT '  • OPCIÓN A: Desactivar de loterías específicas (lista manual)';
PRINT '  • OPCIÓN B: Desactivar de todas menos PICK 4 (más automático)';
PRINT '';
PRINT 'PRÓXIMOS PASOS:';
PRINT '  1. Confirmar con cliente qué loterías son de 3 vs 4 dígitos';
PRINT '  2. Descomentar la opción apropiada (A o B)';
PRINT '  3. Ejecutar el script nuevamente';
PRINT '  4. Verificar resultado en frontend';
PRINT '';

GO
