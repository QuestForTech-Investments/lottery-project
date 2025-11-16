-- ===================================================================
-- Migration: lottery_id → draw_id Architecture Refactor
-- Purpose: Remove incorrect lottery_id usage, use draw_id instead
-- Date: 2025-11-14
-- ===================================================================

USE [lottery-db];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

PRINT '=== Lottery → Draw Architecture Refactor ===';
PRINT 'Start time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '';

BEGIN TRANSACTION;

BEGIN TRY

    -- ===================================================================
    -- STEP 1: Drop redundant lottery_id columns
    -- These tables already have draw_id, lottery_id is redundant
    -- ===================================================================
    PRINT '1. Dropping redundant lottery_id columns...';

    -- hot_numbers: Keep only draw_id
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hot_numbers') AND name = 'lottery_id')
    BEGIN
        ALTER TABLE hot_numbers DROP COLUMN lottery_id;
        PRINT '  ✓ Dropped lottery_id from hot_numbers';
    END
    ELSE
        PRINT '  - lottery_id already removed from hot_numbers';

    -- limit_consumption: Keep only draw_id
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('limit_consumption') AND name = 'lottery_id')
    BEGIN
        ALTER TABLE limit_consumption DROP COLUMN lottery_id;
        PRINT '  ✓ Dropped lottery_id from limit_consumption';
    END
    ELSE
        PRINT '  - lottery_id already removed from limit_consumption';

    -- limit_rules: Keep only draw_id
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'lottery_id')
    BEGIN
        ALTER TABLE limit_rules DROP COLUMN lottery_id;
        PRINT '  ✓ Dropped lottery_id from limit_rules';
    END
    ELSE
        PRINT '  - lottery_id already removed from limit_rules';

    PRINT '';

    -- ===================================================================
    -- STEP 2: Migrate betting_pool_prizes_commissions
    -- Change lottery_id → draw_id with data migration
    -- ===================================================================
    PRINT '2. Migrating betting_pool_prizes_commissions...';

    -- Check if lottery_id exists in betting_pool_prizes_commissions
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'lottery_id')
    BEGIN
        -- Add draw_id column
        ALTER TABLE betting_pool_prizes_commissions ADD draw_id INT NULL;
        PRINT '  ✓ Added draw_id column';

        -- Migrate data: Map lottery_id to first active draw of that lottery
        UPDATE bppc
        SET bppc.draw_id = (
            SELECT TOP 1 d.draw_id
            FROM draws d
            WHERE d.lottery_id = bppc.lottery_id
              AND d.is_active = 1
            ORDER BY d.draw_id
        )
        FROM betting_pool_prizes_commissions bppc;

        PRINT '  ✓ Migrated data from lottery_id to draw_id';

        -- Check for unmigrated rows
        DECLARE @unmigrated INT;
        SELECT @unmigrated = COUNT(*) FROM betting_pool_prizes_commissions WHERE draw_id IS NULL;

        IF @unmigrated > 0
        BEGIN
            PRINT '  ⚠ Warning: ' + CAST(@unmigrated AS VARCHAR(10)) + ' rows could not be migrated (no active draws found)';
        END

        -- Drop old lottery_id column
        ALTER TABLE betting_pool_prizes_commissions DROP COLUMN lottery_id;
        PRINT '  ✓ Dropped lottery_id column';

        -- Make draw_id NOT NULL
        ALTER TABLE betting_pool_prizes_commissions ALTER COLUMN draw_id INT NOT NULL;
        PRINT '  ✓ Set draw_id to NOT NULL';

        -- Add FK constraint
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pool_prizes_commissions_draw')
        BEGIN
            ALTER TABLE betting_pool_prizes_commissions
            ADD CONSTRAINT FK_betting_pool_prizes_commissions_draw
            FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
            PRINT '  ✓ Added FK constraint to draws';
        END
    END
    ELSE
        PRINT '  - betting_pool_prizes_commissions already migrated';

    PRINT '';

    -- ===================================================================
    -- STEP 3: Drop incorrect lottery compatibility tables
    -- Use draw_game_compatibility and draw_bet_type_compatibility instead
    -- ===================================================================
    PRINT '3. Dropping incorrect lottery compatibility tables...';

    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('lottery_game_compatibility') AND type in (N'U'))
    BEGIN
        DROP TABLE lottery_game_compatibility;
        PRINT '  ✓ Dropped lottery_game_compatibility (use draw_game_compatibility)';
    END
    ELSE
        PRINT '  - lottery_game_compatibility already dropped';

    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('lottery_bet_type_compatibility') AND type in (N'U'))
    BEGIN
        DROP TABLE lottery_bet_type_compatibility;
        PRINT '  ✓ Dropped lottery_bet_type_compatibility (use draw_bet_type_compatibility)';
    END
    ELSE
        PRINT '  - lottery_bet_type_compatibility already dropped';

    PRINT '';

    -- ===================================================================
    -- STEP 4: Verification
    -- ===================================================================
    PRINT '4. Verifying migration...';

    -- Check that only lotteries and draws have lottery_id
    DECLARE @bad_tables INT;
    SELECT @bad_tables = COUNT(DISTINCT t.TABLE_NAME)
    FROM INFORMATION_SCHEMA.COLUMNS c
    JOIN INFORMATION_SCHEMA.TABLES t ON c.TABLE_NAME = t.TABLE_NAME
    WHERE c.COLUMN_NAME = 'lottery_id'
      AND t.TABLE_TYPE = 'BASE TABLE'
      AND t.TABLE_NAME NOT IN ('lotteries', 'draws')
      AND t.TABLE_NAME NOT LIKE '%backup%';

    IF @bad_tables = 0
        PRINT '  ✓ Verification passed: only lotteries and draws have lottery_id';
    ELSE
        PRINT '  ❌ Verification failed: ' + CAST(@bad_tables AS VARCHAR(10)) + ' tables still have lottery_id';

    -- List tables with lottery_id (should only be lotteries and draws)
    PRINT '';
    PRINT '  Tables with lottery_id:';
    SELECT '    - ' + t.TABLE_NAME as [Tables]
    FROM INFORMATION_SCHEMA.COLUMNS c
    JOIN INFORMATION_SCHEMA.TABLES t ON c.TABLE_NAME = t.TABLE_NAME
    WHERE c.COLUMN_NAME = 'lottery_id'
      AND t.TABLE_TYPE = 'BASE TABLE'
      AND t.TABLE_NAME NOT LIKE '%backup%'
    ORDER BY t.TABLE_NAME;

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '=== Migration Complete ===';
    PRINT 'End time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
    PRINT '✓ All changes committed successfully';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '❌ ERROR: Migration failed and was rolled back';
    PRINT 'Error: ' + ERROR_MESSAGE();
    PRINT 'Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));

    THROW;
END CATCH

GO
