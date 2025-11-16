USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'FINAL COLUMN RENAME USING ADD/COPY/DROP METHOD';
PRINT '================================================================================';
PRINT '';

-- betting_pool_general_config
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'monto_multiplicador')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_general_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    PRINT 'Processing betting_pool_general_config...';

    ALTER TABLE betting_pool_general_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    PRINT '  ✓ Added multiplier_amount column';

    UPDATE betting_pool_general_config SET multiplier_amount = monto_multiplicador;
    PRINT '  ✓ Copied data';

    ALTER TABLE betting_pool_general_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    PRINT '  ✓ Set NOT NULL';

    ALTER TABLE betting_pool_general_config DROP COLUMN monto_multiplicador;
    PRINT '  ✓ Dropped monto_multiplicador';
    PRINT '';
END
ELSE
BEGIN
    PRINT 'betting_pool_general_config already has multiplier_amount or missing monto_mult';
    PRINT '';
END

GO

-- betting_pool_draw_config
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'monto_multiplicador')
AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'betting_pool_draw_config' AND COLUMN_NAME = 'multiplier_amount')
BEGIN
    PRINT 'Processing betting_pool_draw_config...';

    ALTER TABLE betting_pool_draw_config ADD multiplier_amount DECIMAL(10, 2) NULL;
    PRINT '  ✓ Added multiplier_amount column';

    UPDATE betting_pool_draw_config SET multiplier_amount = monto_multiplicador;
    PRINT '  ✓ Copied data';

    ALTER TABLE betting_pool_draw_config ALTER COLUMN multiplier_amount DECIMAL(10, 2) NOT NULL;
    PRINT '  ✓ Set NOT NULL';

    ALTER TABLE betting_pool_draw_config DROP COLUMN monto_multiplicador;
    PRINT '  ✓ Dropped monto_multiplicador';
    PRINT '';
END
ELSE
BEGIN
    PRINT 'betting_pool_draw_config already has multiplier_amount or missing monto_mult';
    PRINT '';
END

GO

PRINT '================================================================================';
PRINT '✓ COLUMN RENAME COMPLETE';
PRINT '================================================================================';

GO
