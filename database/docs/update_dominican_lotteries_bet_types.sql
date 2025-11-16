-- ============================================================================
-- ACTUALIZACIÓN: Asignar solo Directo, Palé y Tripleta a loterías dominicanas
-- ============================================================================
-- Purpose: Configurar las loterías dominicanas para que SOLO tengan los
--          tipos de apuesta tradicionales dominicanos
-- Author: System Generated
-- Date: 2025-11-06
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '========================================================================';
PRINT 'ACTUALIZACIÓN DE TIPOS DE APUESTA PARA LOTERÍAS DOMINICANAS';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';

-- ============================================================================
-- PASO 1: Verificar estado actual
-- ============================================================================
PRINT '1. ESTADO ACTUAL DE LOTERÍAS DOMINICANAS';
PRINT '   ---------------------------------------------------';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TotalTipos,
    STRING_AGG(bt.bet_type_code, ', ') AS TiposActuales
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
LEFT JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id AND bt.is_active = 1
WHERE l.country_id = 1  -- República Dominicana
  AND l.is_active = 1
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 2: Identificar tipos NO dominicanos que se eliminarán
-- ============================================================================
PRINT '2. TIPOS DE APUESTA NO DOMINICANOS QUE SE DESACTIVARÁN';
PRINT '   ---------------------------------------------------';

DECLARE @tipos_a_desactivar INT;

SELECT @tipos_a_desactivar = COUNT(*)
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 1
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

PRINT '   Registros a desactivar: ' + CAST(@tipos_a_desactivar AS VARCHAR);

IF @tipos_a_desactivar > 0
BEGIN
    SELECT
        l.lottery_name AS Loteria,
        bt.bet_type_code AS CodigoTipo,
        bt.bet_type_name AS NombreTipo
    FROM lottery_bet_type_compatibility lbtc
    INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
    INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
    WHERE l.country_id = 1
      AND l.is_active = 1
      AND lbtc.is_active = 1
      AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA')
    ORDER BY l.lottery_name, bt.bet_type_code;
END
ELSE
BEGIN
    PRINT '   ✓ No hay tipos no dominicanos activos';
END

PRINT '';

-- ============================================================================
-- PASO 3: Desactivar tipos NO dominicanos
-- ============================================================================
PRINT '3. DESACTIVANDO TIPOS NO DOMINICANOS...';
PRINT '   ---------------------------------------------------';

DECLARE @desactivados INT = 0;

UPDATE lbtc
SET is_active = 0,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 1
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

SET @desactivados = @@ROWCOUNT;

PRINT '   ✓ Desactivados: ' + CAST(@desactivados AS VARCHAR) + ' registros';
PRINT '';

-- ============================================================================
-- PASO 4: Asegurar que todas las loterías dominicanas tengan Directo, Palé, Tripleta
-- ============================================================================
PRINT '4. VERIFICANDO Y AGREGANDO TIPOS DOMINICANOS FALTANTES...';
PRINT '   ---------------------------------------------------';

DECLARE @agregados INT = 0;

-- Obtener IDs de los tipos de apuesta dominicanos
DECLARE @directo_id INT, @pale_id INT, @tripleta_id INT;

SELECT @directo_id = bet_type_id FROM bet_types WHERE bet_type_code = 'DIRECTO';
SELECT @pale_id = bet_type_id FROM bet_types WHERE bet_type_code = 'PALÉ';
SELECT @tripleta_id = bet_type_id FROM bet_types WHERE bet_type_code = 'TRIPLETA';

PRINT '   Bet Type IDs:';
PRINT '   - DIRECTO: ' + CAST(@directo_id AS VARCHAR);
PRINT '   - PALÉ: ' + CAST(@pale_id AS VARCHAR);
PRINT '   - TRIPLETA: ' + CAST(@tripleta_id AS VARCHAR);
PRINT '';

-- Insertar tipos faltantes para todas las loterías dominicanas
INSERT INTO lottery_bet_type_compatibility (lottery_id, bet_type_id, is_active, created_at, updated_at)
SELECT DISTINCT
    l.lottery_id,
    bt.bet_type_id,
    1 AS is_active,
    GETDATE() AS created_at,
    GETDATE() AS updated_at
FROM lotteries l
CROSS JOIN (
    SELECT @directo_id AS bet_type_id
    UNION SELECT @pale_id
    UNION SELECT @tripleta_id
) bt
WHERE l.country_id = 1
  AND l.is_active = 1
  AND NOT EXISTS (
      SELECT 1
      FROM lottery_bet_type_compatibility lbtc
      WHERE lbtc.lottery_id = l.lottery_id
        AND lbtc.bet_type_id = bt.bet_type_id
  );

SET @agregados = @@ROWCOUNT;

PRINT '   ✓ Agregados: ' + CAST(@agregados AS VARCHAR) + ' registros faltantes';
PRINT '';

-- Reactivar los que estaban desactivados
DECLARE @reactivados INT = 0;

UPDATE lbtc
SET is_active = 1,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 1
  AND l.is_active = 1
  AND lbtc.is_active = 0
  AND bt.bet_type_code IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

SET @reactivados = @@ROWCOUNT;

PRINT '   ✓ Reactivados: ' + CAST(@reactivados AS VARCHAR) + ' registros';
PRINT '';

-- ============================================================================
-- PASO 5: Verificación final
-- ============================================================================
PRINT '5. VERIFICACIÓN FINAL';
PRINT '   ---------------------------------------------------';

-- Contar loterías dominicanas
DECLARE @total_dominicanas INT;
SELECT @total_dominicanas = COUNT(*) FROM lotteries WHERE country_id = 1 AND is_active = 1;

-- Verificar que todas tengan exactamente 3 tipos
PRINT '   Total loterías dominicanas: ' + CAST(@total_dominicanas AS VARCHAR);
PRINT '';
PRINT '   Detalle por lotería:';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TotalTipos,
    STRING_AGG(bt.bet_type_code, ', ') AS TiposActivos
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
LEFT JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id AND bt.is_active = 1
WHERE l.country_id = 1
  AND l.is_active = 1
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_name;

PRINT '';

-- Verificar si hay alguna con tipos incorrectos
DECLARE @con_tipos_incorrectos INT;

SELECT @con_tipos_incorrectos = COUNT(DISTINCT l.lottery_id)
FROM lotteries l
INNER JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 1
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

IF @con_tipos_incorrectos > 0
BEGIN
    PRINT '   ⚠️ WARNING: ' + CAST(@con_tipos_incorrectos AS VARCHAR) + ' loterías aún tienen tipos incorrectos';
END
ELSE
BEGIN
    PRINT '   ✓ Todas las loterías dominicanas tienen solo Directo, Palé y Tripleta';
END

PRINT '';

-- ============================================================================
-- PASO 6: Verificar valores de premios (solo lectura)
-- ============================================================================
PRINT '6. VERIFICACIÓN DE VALORES DE PREMIOS';
PRINT '   ---------------------------------------------------';

-- Mostrar los multiplicadores de Directo
PRINT '   DIRECTO:';
SELECT
    field_code AS Codigo,
    field_name AS Campo,
    default_multiplier AS ValorDefecto
FROM prize_fields
WHERE bet_type_id = @directo_id
  AND is_active = 1
ORDER BY display_order;

-- Mostrar los multiplicadores de Palé
PRINT '';
PRINT '   PALÉ:';
SELECT
    field_code AS Codigo,
    field_name AS Campo,
    default_multiplier AS ValorDefecto
FROM prize_fields
WHERE bet_type_id = @pale_id
  AND is_active = 1
ORDER BY display_order;

-- Mostrar los multiplicadores de Tripleta
PRINT '';
PRINT '   TRIPLETA:';
SELECT
    field_code AS Codigo,
    field_name AS Campo,
    default_multiplier AS ValorDefecto
FROM prize_fields
WHERE bet_type_id = @tripleta_id
  AND is_active = 1
ORDER BY display_order;

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
PRINT '  • Tipos desactivados: ' + CAST(@desactivados AS VARCHAR);
PRINT '  • Tipos agregados: ' + CAST(@agregados AS VARCHAR);
PRINT '  • Tipos reactivados: ' + CAST(@reactivados AS VARCHAR);
PRINT '  • Total loterías dominicanas: ' + CAST(@total_dominicanas AS VARCHAR);
PRINT '';
PRINT 'Las loterías dominicanas ahora tienen SOLO: Directo, Palé y Tripleta';
PRINT '';

GO
