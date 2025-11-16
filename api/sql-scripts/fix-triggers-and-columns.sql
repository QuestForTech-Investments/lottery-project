USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'FIXING TRIGGERS AND RENAMING COLUMNS TO ENGLISH';
PRINT '================================================================================';
PRINT '';

-- STEP 1: Drop triggers
PRINT 'Step 1: Dropping triggers...';

IF OBJECT_ID('trg_config_general_updated_at', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_config_general_updated_at;
    PRINT '  ✓ Dropped trg_config_general_updated_at';
END

IF OBJECT_ID('trg_config_sorteo_updated_at', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER trg_config_sorteo_updated_at;
    PRINT '  ✓ Dropped trg_config_sorteo_updated_at';
END

PRINT '';

GO

-- STEP 2: Rename columns (betting_pool_general_config)
PRINT 'Step 2: Renaming columns...';
PRINT '';
PRINT '  Processing betting_pool_general_config...';

-- Step 2a: Add new column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    ALTER TABLE betting_pool_general_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    PRINT '    ✓ Added multiplier_amount column';
END

GO

-- Step 2b: Copy data
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    UPDATE betting_pool_general_config SET multiplier_amount = monto_multiplicador;
    PRINT '    ✓ Copied data from monto_multiplicador';
END

GO

-- Step 2c: Set NOT NULL
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    ALTER TABLE betting_pool_general_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    PRINT '    ✓ Set NOT NULL constraint';
END

GO

-- Step 2d: Drop CHECK constraint if exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_config_general_multiplier')
BEGIN
    ALTER TABLE betting_pool_general_config DROP CONSTRAINT CK_config_general_multiplier;
    PRINT '    ✓ Dropped CK_config_general_multiplier constraint';
END

GO

-- Step 2e: Drop old column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
BEGIN
    ALTER TABLE betting_pool_general_config DROP COLUMN monto_multiplicador;
    PRINT '    ✓ Dropped monto_multiplicador';
    PRINT '';
END

GO

-- STEP 3: Rename columns (betting_pool_draw_config)
PRINT '  Processing betting_pool_draw_config...';

-- Step 3a: Add new column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    ALTER TABLE betting_pool_draw_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    PRINT '    ✓ Added multiplier_amount column';
END

GO

-- Step 3b: Copy data
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    UPDATE betting_pool_draw_config SET multiplier_amount = monto_multiplicador;
    PRINT '    ✓ Copied data from monto_multiplicador';
END

GO

-- Step 3c: Set NOT NULL
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    ALTER TABLE betting_pool_draw_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    PRINT '    ✓ Set NOT NULL constraint';
END

GO

-- Step 3d: Drop CHECK constraint if exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_config_sorteo_multiplier')
BEGIN
    ALTER TABLE betting_pool_draw_config DROP CONSTRAINT CK_config_sorteo_multiplier;
    PRINT '    ✓ Dropped CK_config_sorteo_multiplier constraint';
END

GO

-- Step 3e: Drop old column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
BEGIN
    ALTER TABLE betting_pool_draw_config DROP COLUMN monto_multiplicador;
    PRINT '    ✓ Dropped monto_multiplicador';
    PRINT '';
END

GO

-- STEP 4: Recreate triggers with English names
PRINT 'Step 3: Recreating triggers with English names...';
PRINT '';

GO

CREATE TRIGGER trg_betting_pool_general_config_updated_at
ON betting_pool_general_config
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE betting_pool_general_config
    SET updated_at = GETDATE()
    FROM betting_pool_general_config c
    INNER JOIN inserted i ON c.config_id = i.config_id;
END;

GO

PRINT '  ✓ Created trg_betting_pool_general_config_updated_at';

GO

CREATE TRIGGER trg_betting_pool_draw_config_updated_at
ON betting_pool_draw_config
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE betting_pool_draw_config
    SET updated_at = GETDATE()
    FROM betting_pool_draw_config c
    INNER JOIN inserted i ON c.config_sorteo_id = i.config_sorteo_id;
END;

GO

PRINT '  ✓ Created trg_betting_pool_draw_config_updated_at';
PRINT '';

GO

PRINT '================================================================================';
PRINT '✓ ALL FIXES COMPLETE!';
PRINT '================================================================================';
PRINT '';
PRINT 'Summary:';
PRINT '  - Dropped 2 old triggers with Spanish names';
PRINT '  - Renamed monto_multiplicador → multiplier_amount (2 tables)';
PRINT '  - Created 2 new triggers with English names';
PRINT '';
PRINT 'Database is now 100% in English!';
PRINT '';

GO
