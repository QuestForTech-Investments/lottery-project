-- ============================================================================
-- CORRECCIÓN: Asignar solo Directo, Palé y Tripleta a loterías dominicanas
-- ============================================================================
-- Purpose: Configurar las loterías dominicanas (country_id = 2) para que
--          SOLO tengan los tipos de apuesta tradicionales dominicanos
-- Author: System Generated
-- Date: 2025-11-06
-- ============================================================================

SET NOCOUNT ON;
GO

PRINT '========================================================================';
PRINT 'CORRECCIÓN DE TIPOS DE APUESTA PARA LOTERÍAS DOMINICANAS';
PRINT 'Started at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';

-- ============================================================================
-- PASO 1: Verificar país correcto
-- ============================================================================
PRINT '1. VERIFICANDO PAÍSES EN LA BASE DE DATOS';
PRINT '   ---------------------------------------------------';

SELECT
    c.country_id AS ID,
    c.country_name AS Pais,
    COUNT(l.lottery_id) AS TotalLoterias
FROM countries c
LEFT JOIN lotteries l ON c.country_id = l.country_id AND l.is_active = 1
GROUP BY c.country_id, c.country_name
ORDER BY c.country_id;

PRINT '';

-- ============================================================================
-- PASO 2: Verificar estado actual de República Dominicana
-- ============================================================================
PRINT '2. ESTADO ACTUAL DE LOTERÍAS DOMINICANAS (country_id = 2)';
PRINT '   ---------------------------------------------------';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TotalTipos,
    STRING_AGG(bt.bet_type_code, ', ') WITHIN GROUP (ORDER BY bt.bet_type_code) AS TiposActuales
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
LEFT JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id AND bt.is_active = 1
WHERE l.country_id = 2  -- República Dominicana
  AND l.is_active = 1
GROUP BY l.lottery_id, l.lottery_name
ORDER BY l.lottery_name;

PRINT '';

-- ============================================================================
-- PASO 3: Desactivar SUPER PALÉ de loterías dominicanas
-- ============================================================================
PRINT '3. DESACTIVANDO SUPER PALÉ DE LOTERÍAS DOMINICANAS...';
PRINT '   ---------------------------------------------------';

DECLARE @super_pale_desactivados INT = 0;

UPDATE lbtc
SET is_active = 0,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 2  -- República Dominicana
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code = 'SUPER PALÉ';

SET @super_pale_desactivados = @@ROWCOUNT;

PRINT '   ✓ Desactivados: ' + CAST(@super_pale_desactivados AS VARCHAR) + ' registros de SUPER PALÉ';
PRINT '';

-- ============================================================================
-- PASO 4: Desactivar otros tipos NO dominicanos
-- ============================================================================
PRINT '4. DESACTIVANDO OTROS TIPOS NO DOMINICANOS...';
PRINT '   ---------------------------------------------------';

DECLARE @otros_desactivados INT = 0;

UPDATE lbtc
SET is_active = 0,
    updated_at = GETDATE()
FROM lottery_bet_type_compatibility lbtc
INNER JOIN lotteries l ON lbtc.lottery_id = l.lottery_id
INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
WHERE l.country_id = 2  -- República Dominicana
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

SET @otros_desactivados = @@ROWCOUNT;

PRINT '   ✓ Desactivados: ' + CAST(@otros_desactivados AS VARCHAR) + ' registros de otros tipos';
PRINT '';

-- ============================================================================
-- PASO 5: Asegurar que todas tengan Directo, Palé, Tripleta
-- ============================================================================
PRINT '5. VERIFICANDO Y AGREGANDO TIPOS DOMINICANOS FALTANTES...';
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

-- Insertar tipos faltantes
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
WHERE l.country_id = 2  -- República Dominicana
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
WHERE l.country_id = 2  -- República Dominicana
  AND l.is_active = 1
  AND lbtc.is_active = 0
  AND bt.bet_type_code IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

SET @reactivados = @@ROWCOUNT;

PRINT '   ✓ Reactivados: ' + CAST(@reactivados AS VARCHAR) + ' registros';
PRINT '';

-- ============================================================================
-- PASO 6: Verificación final
-- ============================================================================
PRINT '6. VERIFICACIÓN FINAL';
PRINT '   ---------------------------------------------------';

-- Contar loterías dominicanas
DECLARE @total_dominicanas INT;
SELECT @total_dominicanas = COUNT(*) FROM lotteries WHERE country_id = 2 AND is_active = 1;

PRINT '   Total loterías dominicanas: ' + CAST(@total_dominicanas AS VARCHAR);
PRINT '';
PRINT '   Detalle por lotería:';

SELECT
    l.lottery_id AS ID,
    l.lottery_name AS Loteria,
    COUNT(DISTINCT lbtc.bet_type_id) AS TotalTipos,
    STRING_AGG(bt.bet_type_code, ', ') WITHIN GROUP (ORDER BY bt.bet_type_code) AS TiposActivos
FROM lotteries l
LEFT JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id AND lbtc.is_active = 1
LEFT JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id AND bt.is_active = 1
WHERE l.country_id = 2  -- República Dominicana
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
WHERE l.country_id = 2  -- República Dominicana
  AND l.is_active = 1
  AND lbtc.is_active = 1
  AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA');

IF @con_tipos_incorrectos > 0
BEGIN
    PRINT '   ⚠️ WARNING: ' + CAST(@con_tipos_incorrectos AS VARCHAR) + ' loterías aún tienen tipos incorrectos';

    SELECT
        l.lottery_name AS Loteria,
        bt.bet_type_code AS TipoIncorrecto
    FROM lotteries l
    INNER JOIN lottery_bet_type_compatibility lbtc ON l.lottery_id = lbtc.lottery_id
    INNER JOIN bet_types bt ON lbtc.bet_type_id = bt.bet_type_id
    WHERE l.country_id = 2
      AND l.is_active = 1
      AND lbtc.is_active = 1
      AND bt.bet_type_code NOT IN ('DIRECTO', 'PALÉ', 'TRIPLETA')
    ORDER BY l.lottery_name;
END
ELSE
BEGIN
    PRINT '   ✓ Todas las loterías dominicanas tienen solo Directo, Palé y Tripleta';
END

PRINT '';

-- ============================================================================
-- COMPLETION
-- ============================================================================
PRINT '========================================================================';
PRINT 'CORRECCIÓN COMPLETADA EXITOSAMENTE';
PRINT 'Completed at: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '========================================================================';
PRINT '';
PRINT 'RESUMEN:';
PRINT '  • SUPER PALÉ desactivados: ' + CAST(@super_pale_desactivados AS VARCHAR);
PRINT '  • Otros tipos desactivados: ' + CAST(@otros_desactivados AS VARCHAR);
PRINT '  • Tipos agregados: ' + CAST(@agregados AS VARCHAR);
PRINT '  • Tipos reactivados: ' + CAST(@reactivados AS VARCHAR);
PRINT '  • Total loterías dominicanas: ' + CAST(@total_dominicanas AS VARCHAR);
PRINT '';
PRINT 'Las loterías dominicanas ahora tienen SOLO: Directo, Palé y Tripleta';
PRINT '';

GO
