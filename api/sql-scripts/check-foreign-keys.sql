USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING FOREIGN KEY CONSTRAINTS';
PRINT '================================================================================';
PRINT '';

-- Check all foreign keys that reference sorteos or draws
PRINT 'Foreign keys referencing sorteos or draws:';
PRINT '';

DECLARE @FKInfo NVARCHAR(MAX) = '';

SELECT @FKInfo = @FKInfo +
    '  FK: ' + fk.name + CHAR(13) + CHAR(10) +
    '    From Table: ' + OBJECT_NAME(fk.parent_object_id) + CHAR(13) + CHAR(10) +
    '    To Table: ' + OBJECT_NAME(fk.referenced_object_id) + CHAR(13) + CHAR(10) +
    '    Column: ' + COL_NAME(fc.parent_object_id, fc.parent_column_id) + CHAR(13) + CHAR(10) +
    CHAR(13) + CHAR(10)
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc ON fk.OBJECT_ID = fc.constraint_object_id
WHERE OBJECT_NAME(fk.referenced_object_id) IN ('sorteos', 'draws', 'banca_sorteos', 'betting_pool_draws');

IF LEN(@FKInfo) > 0
    PRINT @FKInfo
ELSE
    PRINT '  No foreign keys found';

PRINT '';
PRINT '================================================================================';

-- Check which premio tables actually exist
PRINT 'Checking which tables exist:';
PRINT '';

IF OBJECT_ID('sorteos', 'U') IS NOT NULL
    PRINT '  ❌ sorteos EXISTS (should be draws only)';
ELSE
    PRINT '  ✓ sorteos does NOT exist';

IF OBJECT_ID('draws', 'U') IS NOT NULL
    PRINT '  ✓ draws EXISTS';
ELSE
    PRINT '  ❌ draws does NOT exist';

IF OBJECT_ID('banca_sorteos', 'U') IS NOT NULL
    PRINT '  ❌ banca_sorteos EXISTS (should be betting_pool_draws only)';
ELSE
    PRINT '  ✓ banca_sorteos does NOT exist';

IF OBJECT_ID('betting_pool_draws', 'U') IS NOT NULL
    PRINT '  ✓ betting_pool_draws EXISTS';
ELSE
    PRINT '  ❌ betting_pool_draws does NOT exist';

PRINT '';

-- Check columns in config tables
PRINT 'Checking column names in config tables:';
PRINT '';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
    PRINT '  ❌ betting_pool_general_config.monto_multiplicador EXISTS (should be multiplier_amount)';
ELSE IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'multiplier_amount')
    PRINT '  ✓ betting_pool_general_config.multiplier_amount EXISTS';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
    PRINT '  ❌ betting_pool_draw_config.monto_multiplicador EXISTS (should be multiplier_amount)';
ELSE IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'multiplier_amount')
    PRINT '  ✓ betting_pool_draw_config.multiplier_amount EXISTS';

PRINT '';
PRINT '================================================================================';

GO
