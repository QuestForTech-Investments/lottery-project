USE [lottery-db];
GO

-- Step 1: Fix prize_changes_audit FK
PRINT 'Step 1: Fixing prize_changes_audit FK...';

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_sorteo')
BEGIN
    ALTER TABLE prize_changes_audit DROP CONSTRAINT FK_audit_premios_sorteo;
    PRINT '✓ Dropped FK_audit_premios_sorteo';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_audit_premios_draw')
BEGIN
    ALTER TABLE prize_changes_audit
    ADD CONSTRAINT FK_audit_premios_draw
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '✓ Created FK_audit_premios_draw';
END

GO

-- Step 2: Drop sorteos
PRINT 'Step 2: Dropping sorteos...';

IF OBJECT_ID('sorteos', 'U') IS NOT NULL
BEGIN
    DROP TABLE sorteos;
    PRINT '✓ Dropped sorteos';
END
ELSE
BEGIN
    PRINT '  sorteos already removed';
END

GO

-- Step 3: Rename columns one at a time
PRINT 'Step 3: Renaming columns...';

-- betting_pool_general_config
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
BEGIN
    PRINT 'Renaming betting_pool_general_config.monto_multiplicador...';

    ALTER TABLE betting_pool_general_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    UPDATE betting_pool_general_config SET multiplier_amount = monto_multiplicador;
    ALTER TABLE betting_pool_general_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    ALTER TABLE betting_pool_general_config DROP COLUMN monto_multiplicador;

    PRINT '✓ Renamed';
END

GO

-- betting_pool_draw_config
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
BEGIN
    PRINT 'Renaming betting_pool_draw_config.monto_multiplicador...';

    ALTER TABLE betting_pool_draw_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    UPDATE betting_pool_draw_config SET multiplier_amount = monto_multiplicador;
    ALTER TABLE betting_pool_draw_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    ALTER TABLE betting_pool_draw_config DROP COLUMN monto_multiplicador;

    PRINT '✓ Renamed';
END

GO

PRINT '================================================================================';
PRINT '✓ ALL FIXES COMPLETE';
PRINT '================================================================================';

GO
