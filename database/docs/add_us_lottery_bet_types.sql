-- ============================================================================
-- AGREGAR TIPOS DE APUESTA A LOTERÍAS DE ESTADOS UNIDOS
-- ============================================================================
-- Purpose: Agregar los tipos de apuesta completos a las loterías de EE.UU.
--          (Directo, Palé, Tripleta, Cash3, Play4, Bolita, Singulación, Pick5)
--          EXCLUYENDO Pick Two (Front, Back, Middle)
-- Author: System Generated
-- Date: 2025-11-06
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '========================================================================';
PRINT 'AGREGAR TIPOS DE APUESTA A LOTERÍAS DE ESTADOS UNIDOS';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';

-- ============================================================================
-- PASO 1: Verificar loterías de EE.UU.
-- ============================================================================
PRINT '1. VERIFICANDO LOTERÍAS DE ESTADOS UNIDOS';
PRINT '   ---------------------------------------------------';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TiposActuales
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 2: Listar tipos a agregar
-- ============================================================================
PRINT '2. TIPOS DE APUESTA A AGREGAR';
PRINT '   ---------------------------------------------------';

-- Tipos que se agregarán (excluyendo Pick Two)
SELECT
    bt.bet_type_id AS ID,
    bt.bet_type_code AS Codigo,
    bt.bet_type_name AS Nombre
FROM bet_types bt
WHERE bt.bet_type_code IN (
    'DIRECTO', 'PALÉ', 'TRIPLETA',
    'CASH3 STRAIGHT', 'CASH3 BOX',
    'PLAY4 STRAIGHT', 'PLAY4 BOX',
    'BOLITA 1', 'BOLITA 2',
    'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
    'PICK5 STRAIGHT', 'PICK5 BOX',
    'CASH3 FRONT STRAIGHT', 'CASH3 FRONT BOX',
    'CASH3 BACK STRAIGHT', 'CASH3 BACK BOX'
    -- EXCLUIDO: 'PICK TWO', 'PICK TWO FRONT', 'PICK TWO BACK', 'PICK TWO MIDDLE'
)
  AND bt.is_active = 1
ORDER BY bt.bet_type_code;

PRINT '';

-- ============================================================================
-- PASO 3: Reactivar tipos existentes que fueron desactivados
-- ============================================================================
PRINT '3. REACTIVANDO TIPOS DESACTIVADOS...';
PRINT '   ---------------------------------------------------';

DECLARE @reactivados INT = 0;

UPDATE lbtc
SET is_active = 1,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
  AND lbtc.is_active = 0
  AND bt.bet_type_code IN (
      'DIRECTO', 'PALÉ', 'TRIPLETA',
      'CASH3 STRAIGHT', 'CASH3 BOX',
      'PLAY4 STRAIGHT', 'PLAY4 BOX',
      'BOLITA 1', 'BOLITA 2',
      'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
      'PICK5 STRAIGHT', 'PICK5 BOX',
      'CASH3 FRONT STRAIGHT', 'CASH3 FRONT BOX',
      'CASH3 BACK STRAIGHT', 'CASH3 BACK BOX'
  );

SET @reactivados = @@ROWCOUNT;

PRINT '   ✓ Reactivados: ' + CAST(@reactivados AS VARCHAR) + ' registros';
PRINT '';

-- ============================================================================
-- PASO 4: Agregar tipos faltantes a todas las loterías de EE.UU.
-- ============================================================================
PRINT '4. AGREGANDO TIPOS FALTANTES...';
PRINT '   ---------------------------------------------------';

DECLARE @agregados INT = 0;

-- Insertar relaciones faltantes
INSERT INTO lottery_bet_type_compatibility (lottery_id, bet_type_id, is_active, created_at, updated_at)
SELECT DISTINCT
    l.lottery_id,
    bt.bet_type_id,
    1 AS is_active,
    GETDATE() AS created_at,
    GETDATE() AS updated_at
FROM lotteries l
CROSS JOIN bet_types bt
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
  AND bt.is_active = 1
  AND bt.bet_type_code IN (
      'DIRECTO', 'PALÉ', 'TRIPLETA',
      'CASH3 STRAIGHT', 'CASH3 BOX',
      'PLAY4 STRAIGHT', 'PLAY4 BOX',
      'BOLITA 1', 'BOLITA 2',
      'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
      'PICK5 STRAIGHT', 'PICK5 BOX',
      'CASH3 FRONT STRAIGHT', 'CASH3 FRONT BOX',
      'CASH3 BACK STRAIGHT', 'CASH3 BACK BOX'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_bet_type_compatibility lbtc
      WHERE lbtc.lottery_id = l.lottery_id
        AND lbtc.bet_type_id = bt.bet_type_id
  );

SET @agregados = @@ROWCOUNT;

PRINT '   ✓ Agregados: ' + CAST(@agregados AS VARCHAR) + ' registros nuevos';
PRINT '';

-- ============================================================================
-- PASO 5: Verificación final
-- ============================================================================
PRINT '5. VERIFICACIÓN FINAL';
PRINT '   ---------------------------------------------------';

-- Contar loterías de EE.UU.
DECLARE @total_us_lotteries INT;
SELECT @total_us_lotteries = COUNT(*) FROM lotteries WHERE country_id = 1 AND is_active = 1;

PRINT '   Total loterías de EE.UU.: ' + CAST(@total_us_lotteries AS VARCHAR);
PRINT '';
PRINT '   Detalle por lotería (primeras 10):';

SELECT TOP 10
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TotalTipos
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
WHERE l.country_id = 1  -- Estados Unidos
  AND l.is_active = 1
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_name;

PRINT '';

-- Contar tipos activos por lotería (promedio)
DECLARE @avg_types DECIMAL(5,2);

SELECT @avg_types = AVG(CAST(tipos AS DECIMAL(5,2)))
FROM (
    SELECT COUNT(DISTINCT lbtc.bet_type_id) AS tipos
    FROM lotteries l
    LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
    WHERE l.country_id = 1 AND l.is_active = 1
    GROUP BY l.lottery_id
) AS tipo_counts;

PRINT '   Promedio de tipos por lotería de EE.UU.: ' + CAST(@avg_types AS VARCHAR);
PRINT '';

-- Verificar una lotería específica (FLORIDA AM = ID 1)
IF EXISTS (SELECT 1 FROM lotteries WHERE lottery_id = 1)
BEGIN
    PRINT '   Ejemplo: FLORIDA AM (ID 1) ahora tiene:';

    SELECT '      - ' + bt.bet_type_code AS TipoApuesta
    FROM lottery_bet_type_compatibility lbtc
    INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
    WHERE lbtc.lottery_id = 1
      AND lbtc.is_active = 1
    ORDER BY bt.display_order;
END

PRINT '';

-- ============================================================================
-- COMPLETION
-- ============================================================================
PRINT '========================================================================';
PRINT 'ACTUALIZACIÓN COMPLETADA EXITOSAMENTE';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';
PRINT 'RESUMEN:';
PRINT '  • Tipos reactivados: ' + CAST(@reactivados AS VARCHAR);
PRINT '  • Tipos agregados: ' + CAST(@agregados AS VARCHAR);
PRINT '  • Total loterías de EE.UU.: ' + CAST(@total_us_lotteries AS VARCHAR);
PRINT '  • Promedio tipos por lotería: ' + CAST(@avg_types AS VARCHAR);
PRINT '';
PRINT 'NOTA: Pick Two (Front, Back, Middle) NO fue agregado según lo solicitado';
PRINT '';

GO
