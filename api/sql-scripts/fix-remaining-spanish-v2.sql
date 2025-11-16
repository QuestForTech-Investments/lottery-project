USE [lottery-db];
GO

-- =============================================
-- FIX REMAINING SPANISH NAMES - VERSION 2
-- =============================================

PRINT '================================================================================';
PRINT 'FIXING REMAINING SPANISH TABLE AND COLUMN NAMES (v2)';
PRINT '================================================================================';
PRINT '';

-- =============================================
-- STEP 1: FIX prize_changes_audit FK TO DRAWS
-- =============================================

PRINT 'Step 1: Fixing prize_changes_audit to reference draws instead of sorteos...';
PRINT '';

-- Drop the FK that points to sorteos
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_sorteo')
BEGIN
    PRINT '  Dropping FK_audit_premios_sorteo...';
    ALTER TABLE prize_changes_audit DROP CONSTRAINT FK_audit_premios_sorteo;
    PRINT '  ✓ FK dropped';
END

-- Recreate FK pointing to draws
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_draw')
BEGIN
    PRINT '  Creating FK_audit_premios_draw pointing to draws...';
    ALTER TABLE prize_changes_audit
    ADD CONSTRAINT FK_audit_premios_draw
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '  ✓ FK created';
END

PRINT '';

-- =============================================
-- STEP 2: DROP sorteos TABLE
-- =============================================

PRINT 'Step 2: Dropping sorteos table...';
PRINT '';

IF OBJECT_ID('sorteos', 'U') IS NOT NULL
BEGIN
    DROP TABLE sorteos;
    PRINT '  ✓ sorteos table dropped';
END
ELSE
BEGIN
    PRINT '  sorteos already removed - OK';
END

PRINT '';

-- =============================================
-- STEP 3: RENAME COLUMNS (monto_multiplicador)
-- =============================================

PRINT 'Step 3: Renaming Spanish columns to English...';
PRINT '';

-- Fix betting_pool_general_config
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_general_config'
    AND COLUMN_NAME = 'monto_multiplicador'
)
BEGIN
    PRINT '  Renaming betting_pool_general_config.monto_multiplicador...';

    -- First, add the new column
    ALTER TABLE betting_pool_general_config
    ADD multiplier_amount DECIMAL(10, 2) NULL;

    -- Copy data
    UPDATE betting_pool_general_config
    SET multiplier_amount = monto_multiplicador;

    -- Make it NOT NULL
    ALTER TABLE betting_pool_general_config
    ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;

    -- Drop old column
    ALTER TABLE betting_pool_general_config
    DROP COLUMN monto_multiplicador;

    PRINT '  ✓ Column renamed via add/copy/drop';
END
ELSE
BEGIN
    PRINT '  betting_pool_general_config.multiplier_amount already exists - OK';
END

PRINT '';

-- Fix betting_pool_draw_config
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_draw_config'
    AND COLUMN_NAME = 'monto_multiplicador'
)
BEGIN
    PRINT '  Renaming betting_pool_draw_config.monto_multiplicador...';

    -- First, add the new column
    ALTER TABLE betting_pool_draw_config
    ADD multiplier_amount DECIMAL(10, 2) NULL;

    -- Copy data
    UPDATE betting_pool_draw_config
    SET multiplier_amount = monto_multiplicador;

    -- Make it NOT NULL
    ALTER TABLE betting_pool_draw_config
    ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;

    -- Drop old column
    ALTER TABLE betting_pool_draw_config
    DROP COLUMN monto_multiplicador;

    PRINT '  ✓ Column renamed via add/copy/drop';
END
ELSE
BEGIN
    PRINT '  betting_pool_draw_config.multiplier_amount already exists - OK';
END

PRINT '';

PRINT '================================================================================';
PRINT '✓ ALL SPANISH NAMES FIXED - DATABASE NOW FULLY IN ENGLISH';
PRINT '================================================================================';
PRINT '';

GO
