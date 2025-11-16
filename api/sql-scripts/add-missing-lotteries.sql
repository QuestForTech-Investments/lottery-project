-- =============================================
-- Agregar 9 Loterías Faltantes
-- Fecha: 2025-10-29
-- Descripción: Agrega las 9 loterías identificadas como faltantes del formulario original
-- =============================================

PRINT '========================================';
PRINT '  Agregando Loterías Faltantes';
PRINT '========================================';
PRINT '';

-- Verificar cuántas loterías hay actualmente
DECLARE @CurrentCount INT;
SELECT @CurrentCount = COUNT(*) FROM lotteries;
PRINT 'Loterías actuales en BD: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT '';

-- =============================================
-- 1. QUINIELA PALE (ID original: 8)
-- =============================================
PRINT 'Agregando: QUINIELA PALE...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (61, 'Quiniela Pale', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ QUINIELA PALE agregada (ID: 61)';
PRINT '';

-- =============================================
-- 2. LA PRIMERA 8PM (ID original: 1168)
-- =============================================
PRINT 'Agregando: LA PRIMERA 8PM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (62, 'La Primera 8PM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ LA PRIMERA 8PM agregada (ID: 62)';
PRINT '';

-- =============================================
-- 3. LA SUERTE 6:00PM (ID original: 1432)
-- =============================================
PRINT 'Agregando: LA SUERTE 6:00PM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (63, 'La Suerte 6:00PM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ LA SUERTE 6:00PM agregada (ID: 63)';
PRINT '';

-- =============================================
-- 4. DIARIA 11AM (ID original: 38)
-- =============================================
PRINT 'Agregando: DIARIA 11AM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (64, 'Diaria 11AM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ DIARIA 11AM agregada (ID: 64)';
PRINT '';

-- =============================================
-- 5. DIARIA 3PM (ID original: 39)
-- =============================================
PRINT 'Agregando: DIARIA 3PM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (65, 'Diaria 3PM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ DIARIA 3PM agregada (ID: 65)';
PRINT '';

-- =============================================
-- 6. DIARIA 9PM (ID original: 40)
-- =============================================
PRINT 'Agregando: DIARIA 9PM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (66, 'Diaria 9PM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ DIARIA 9PM agregada (ID: 66)';
PRINT '';

-- =============================================
-- 7. NY PM 6x1 (ID original: 377)
-- =============================================
PRINT 'Agregando: NY PM 6x1...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (67, 'NY PM 6x1', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ NY PM 6x1 agregada (ID: 67)';
PRINT '';

-- =============================================
-- 8. FL PM 6X1 (ID original: 412)
-- =============================================
PRINT 'Agregando: FL PM 6X1...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (68, 'FL PM 6x1', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ FL PM 6X1 agregada (ID: 68)';
PRINT '';

-- =============================================
-- 9. KING LOTTERY PM (ID original: 542)
-- =============================================
PRINT 'Agregando: KING LOTTERY PM...';
INSERT INTO lotteries (lottery_id, lottery_name, lottery_type, country_id, is_active, created_at, updated_at)
VALUES (69, 'King Lottery PM', 'Local', 2, 1, GETDATE(), GETDATE());
PRINT '✓ KING LOTTERY PM agregada (ID: 69)';
PRINT '';

-- =============================================
-- Verificación Final
-- =============================================
PRINT '';
PRINT '========================================';
PRINT '  Verificación Final';
PRINT '========================================';

DECLARE @NewCount INT;
SELECT @NewCount = COUNT(*) FROM lotteries;
PRINT 'Loterías antes: ' + CAST(@CurrentCount AS VARCHAR(10));
PRINT 'Loterías después: ' + CAST(@NewCount AS VARCHAR(10));
PRINT 'Loterías agregadas: ' + CAST((@NewCount - @CurrentCount) AS VARCHAR(10));
PRINT '';

IF @NewCount >= 69
BEGIN
    PRINT '✅ ÉXITO: Base de datos tiene todas las loterías esperadas (69)';
END
ELSE
BEGIN
    PRINT '⚠️  Base de datos tiene ' + CAST(@NewCount AS VARCHAR(10)) + ' loterías';
    PRINT '   Se esperan 69 loterías del formulario original';
END

PRINT '';
PRINT '========================================';
PRINT '  Migración Completada';
PRINT '========================================';
PRINT '';

-- Mostrar las últimas 9 loterías agregadas
PRINT 'Últimas loterías agregadas:';
PRINT '';
SELECT TOP 9
    lottery_id,
    lottery_name,
    lottery_type,
    country_id,
    is_active,
    created_at
FROM lotteries
ORDER BY lottery_id DESC;
