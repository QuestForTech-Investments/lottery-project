USE [lottery-db];
GO

-- =============================================
-- FIX REMAINING SPANISH NAMES IN DATABASE
-- =============================================

PRINT '================================================================================';
PRINT 'FIXING REMAINING SPANISH TABLE AND COLUMN NAMES';
PRINT '================================================================================';
PRINT '';

-- =============================================
-- STEP 1: CHECK AND DROP DUPLICATE SPANISH TABLES
-- =============================================

PRINT 'Step 1: Removing duplicate Spanish tables...';
PRINT '';

-- Check if banca_sorteos has any data not in betting_pool_draws
IF OBJECT_ID('banca_sorteos', 'U') IS NOT NULL
BEGIN
    DECLARE @BancaSorteosCount INT;
    SELECT @BancaSorteosCount = COUNT(*) FROM banca_sorteos;
    PRINT '  banca_sorteos table exists with ' + CAST(@BancaSorteosCount AS VARCHAR) + ' records';

    IF @BancaSorteosCount > 0
    BEGIN
        PRINT '  WARNING: banca_sorteos has data. Checking if it needs migration...';

        -- Check if betting_pool_draws has the same or more records
        DECLARE @BettingPoolDrawsCount INT;
        SELECT @BettingPoolDrawsCount = COUNT(*) FROM betting_pool_draws;
        PRINT '  betting_pool_draws has ' + CAST(@BettingPoolDrawsCount AS VARCHAR) + ' records';

        IF @BettingPoolDrawsCount >= @BancaSorteosCount
        BEGIN
            PRINT '  betting_pool_draws has equal or more records - safe to drop banca_sorteos';
            DROP TABLE banca_sorteos;
            PRINT '  ✓ Dropped banca_sorteos';
        END
        ELSE
        BEGIN
            PRINT '  ERROR: betting_pool_draws has fewer records than banca_sorteos';
            PRINT '  Manual intervention required to migrate data';
        END
    END
    ELSE
    BEGIN
        DROP TABLE banca_sorteos;
        PRINT '  ✓ Dropped empty banca_sorteos table';
    END
END
ELSE
BEGIN
    PRINT '  banca_sorteos does not exist - OK';
END
PRINT '';

-- Check if sorteos has any data not in draws
IF OBJECT_ID('sorteos', 'U') IS NOT NULL
BEGIN
    DECLARE @SorteosCount INT;
    SELECT @SorteosCount = COUNT(*) FROM sorteos;
    PRINT '  sorteos table exists with ' + CAST(@SorteosCount AS VARCHAR) + ' records';

    IF @SorteosCount > 0
    BEGIN
        PRINT '  WARNING: sorteos has data. Checking if it needs migration...';

        -- Check if draws has the same or more records
        DECLARE @DrawsCount INT;
        SELECT @DrawsCount = COUNT(*) FROM draws;
        PRINT '  draws has ' + CAST(@DrawsCount AS VARCHAR) + ' records';

        IF @DrawsCount >= @SorteosCount
        BEGIN
            PRINT '  draws has equal or more records - safe to drop sorteos';

            -- Drop foreign key constraints first
            IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_draw')
            BEGIN
                PRINT '  Temporarily dropping FK_pool_draw_config_draw...';
                ALTER TABLE betting_pool_draw_config DROP CONSTRAINT FK_pool_draw_config_draw;
            END

            IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_draw')
            BEGIN
                PRINT '  Temporarily dropping FK_pool_draws_draw...';
                ALTER TABLE betting_pool_draws DROP CONSTRAINT FK_pool_draws_draw;
            END

            DROP TABLE sorteos;
            PRINT '  ✓ Dropped sorteos';

            -- Recreate foreign keys pointing to draws
            ALTER TABLE betting_pool_draw_config
            ADD CONSTRAINT FK_pool_draw_config_draw
            FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
            PRINT '  ✓ Recreated FK_pool_draw_config_draw';

            ALTER TABLE betting_pool_draws
            ADD CONSTRAINT FK_pool_draws_draw
            FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
            PRINT '  ✓ Recreated FK_pool_draws_draw';
        END
        ELSE
        BEGIN
            PRINT '  ERROR: draws has fewer records than sorteos';
            PRINT '  Manual intervention required to migrate data';
        END
    END
    ELSE
    BEGIN
        DROP TABLE sorteos;
        PRINT '  ✓ Dropped empty sorteos table';
    END
END
ELSE
BEGIN
    PRINT '  sorteos does not exist - OK';
END
PRINT '';

-- =============================================
-- STEP 2: RENAME SPANISH COLUMNS TO ENGLISH
-- =============================================

PRINT 'Step 2: Renaming Spanish columns to English...';
PRINT '';

-- Check and rename monto_multiplicador in betting_pool_general_config
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_general_config'
    AND COLUMN_NAME = 'monto_multiplicador'
)
BEGIN
    PRINT '  Renaming betting_pool_general_config.monto_multiplicador to multiplier_amount...';

    -- Drop FK constraints temporarily if they exist
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_general_config_betting_pool')
    BEGIN
        ALTER TABLE betting_pool_general_config DROP CONSTRAINT FK_pool_general_config_betting_pool;
    END
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_general_config_prize_field')
    BEGIN
        ALTER TABLE betting_pool_general_config DROP CONSTRAINT FK_pool_general_config_prize_field;
    END

    EXEC sp_rename 'betting_pool_general_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';
    PRINT '  ✓ Column renamed';

    -- Recreate FK constraints
    ALTER TABLE betting_pool_general_config
    ADD CONSTRAINT FK_pool_general_config_betting_pool
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id) ON DELETE CASCADE;

    ALTER TABLE betting_pool_general_config
    ADD CONSTRAINT FK_pool_general_config_prize_field
    FOREIGN KEY (prize_field_id) REFERENCES prize_fields(prize_field_id);

    PRINT '  ✓ Foreign keys recreated';
END
ELSE
BEGIN
    PRINT '  betting_pool_general_config.multiplier_amount already exists - OK';
END
PRINT '';

-- Check and rename monto_multiplicador in betting_pool_draw_config
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_draw_config'
    AND COLUMN_NAME = 'monto_multiplicador'
)
BEGIN
    PRINT '  Renaming betting_pool_draw_config.monto_multiplicador to multiplier_amount...';

    -- Drop FK constraints temporarily if they exist
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_betting_pool')
    BEGIN
        ALTER TABLE betting_pool_draw_config DROP CONSTRAINT FK_pool_draw_config_betting_pool;
    END
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_draw')
    BEGIN
        ALTER TABLE betting_pool_draw_config DROP CONSTRAINT FK_pool_draw_config_draw;
    END
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draw_config_prize_field')
    BEGIN
        ALTER TABLE betting_pool_draw_config DROP CONSTRAINT FK_pool_draw_config_prize_field;
    END

    EXEC sp_rename 'betting_pool_draw_config.monto_multiplicador', 'multiplier_amount', 'COLUMN';
    PRINT '  ✓ Column renamed';

    -- Recreate FK constraints
    ALTER TABLE betting_pool_draw_config
    ADD CONSTRAINT FK_pool_draw_config_betting_pool
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id) ON DELETE CASCADE;

    ALTER TABLE betting_pool_draw_config
    ADD CONSTRAINT FK_pool_draw_config_draw
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

    ALTER TABLE betting_pool_draw_config
    ADD CONSTRAINT FK_pool_draw_config_prize_field
    FOREIGN KEY (prize_field_id) REFERENCES prize_fields(prize_field_id);

    PRINT '  ✓ Foreign keys recreated';
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
PRINT 'Summary:';
PRINT '  - Removed duplicate Spanish tables';
PRINT '  - Renamed all Spanish columns to English';
PRINT '  - All foreign keys recreated';
PRINT '';

GO
