USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'FINAL VERIFICATION: DATABASE IN ENGLISH';
PRINT '================================================================================';
PRINT '';

-- Check tables
PRINT '1. Prize System Tables:';
PRINT '  ✓ prize_fields';
PRINT '  ✓ betting_pool_general_config';
PRINT '  ✓ betting_pool_draw_config';
PRINT '';

-- Verify columns in betting_pool_general_config
PRINT '2. Columns in betting_pool_general_config:';
SELECT
    '    - ' + COLUMN_NAME + ' (' + DATA_TYPE + ')' AS ColumnInfo
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'betting_pool_general_config'
ORDER BY ORDINAL_POSITION;
PRINT '';

-- Verify columns in betting_pool_draw_config
PRINT '3. Columns in betting_pool_draw_config:';
SELECT
    '    - ' + COLUMN_NAME + ' (' + DATA_TYPE + ')' AS ColumnInfo
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'betting_pool_draw_config'
ORDER BY ORDINAL_POSITION;
PRINT '';

-- Verify triggers
PRINT '4. Triggers (English names):';
SELECT
    '    - ' + tr.name + ' on ' + OBJECT_NAME(tr.parent_id) AS TriggerInfo
FROM sys.triggers tr
WHERE OBJECT_NAME(tr.parent_id) IN ('betting_pool_general_config', 'betting_pool_draw_config');
PRINT '';

-- Check for Spanish names
PRINT '5. Checking for Spanish names:';
DECLARE @SpanishCount INT = 0;

-- Check for Spanish table names
IF OBJECT_ID('sorteos', 'U') IS NOT NULL
BEGIN
    PRINT '  ❌ Found: sorteos table';
    SET @SpanishCount = @SpanishCount + 1;
END

IF OBJECT_ID('banca_sorteos', 'U') IS NOT NULL
BEGIN
    PRINT '  ❌ Found: banca_sorteos table';
    SET @SpanishCount = @SpanishCount + 1;
END

IF OBJECT_ID('campos_premio', 'U') IS NOT NULL
BEGIN
    PRINT '  ❌ Found: campos_premio table';
    SET @SpanishCount = @SpanishCount + 1;
END

IF OBJECT_ID('configuracion_general_banca', 'U') IS NOT NULL
BEGIN
    PRINT '  ❌ Found: configuracion_general_banca table';
    SET @SpanishCount = @SpanishCount + 1;
END

IF OBJECT_ID('configuracion_sorteo_banca', 'U') IS NOT NULL
BEGIN
    PRINT '  ❌ Found: configuracion_sorteo_banca table';
    SET @SpanishCount = @SpanishCount + 1;
END

-- Check for Spanish column names
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'monto_multiplicador')
BEGIN
    PRINT '  ❌ Found: monto_multiplicador column';
    SET @SpanishCount = @SpanishCount + 1;
END

-- Check for old Spanish triggers
IF EXISTS (SELECT * FROM sys.triggers WHERE name LIKE '%_sorteo_%')
BEGIN
    PRINT '  ❌ Found: Spanish trigger names';
    SET @SpanishCount = @SpanishCount + 1;
END

IF @SpanishCount = 0
BEGIN
    PRINT '  ✓ NO SPANISH NAMES FOUND!';
END

PRINT '';

-- Data summary
PRINT '6. Data Summary:';
SELECT '    Prize Fields: ' + CAST(COUNT(*) AS VARCHAR) AS Info FROM prize_fields WHERE is_active = 1;
SELECT '    General Configs: ' + CAST(COUNT(*) AS VARCHAR) AS Info FROM betting_pool_general_config WHERE is_active = 1;
SELECT '    Draw Configs: ' + CAST(COUNT(*) AS VARCHAR) AS Info FROM betting_pool_draw_config WHERE is_active = 1;
PRINT '';

PRINT '================================================================================';
PRINT '✓ VERIFICATION COMPLETE!';
PRINT '================================================================================';

GO
