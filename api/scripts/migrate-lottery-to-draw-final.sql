-- ===================================================================
-- Migration: lottery_id → draw_id Architecture Refactor (FINAL)
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

-- ===================================================================
-- STEP 1: Drop unique constraints that include lottery_id
-- ===================================================================
PRINT '1. Dropping unique constraints that reference lottery_id...';

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_hot_numbers' AND type = 'UQ')
BEGIN
    ALTER TABLE hot_numbers DROP CONSTRAINT UQ_hot_numbers;
    PRINT '  ? Dropped UQ_hot_numbers';
END

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_limit_consumption' AND type = 'UQ')
BEGIN
    ALTER TABLE limit_consumption DROP CONSTRAINT UQ_limit_consumption;
    PRINT '  ? Dropped UQ_limit_consumption';
END

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_pool_lottery_game' AND type = 'UQ')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions DROP CONSTRAINT UQ_pool_lottery_game;
    PRINT '  ? Dropped UQ_pool_lottery_game';
END

PRINT '';
GO

-- ===================================================================
-- STEP 2: Drop redundant lottery_id columns
-- ===================================================================
PRINT '2. Dropping redundant lottery_id columns...';

-- hot_numbers: lottery_id is redundant (can get from draws)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hot_numbers') AND name = 'lottery_id')
BEGIN
    ALTER TABLE hot_numbers DROP COLUMN lottery_id;
    PRINT '  ? Dropped lottery_id from hot_numbers';
END

-- limit_consumption: lottery_id is redundant
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('limit_consumption') AND name = 'lottery_id')
BEGIN
    ALTER TABLE limit_consumption DROP COLUMN lottery_id;
    PRINT '  ? Dropped lottery_id from limit_consumption';
END

-- limit_rules: lottery_id is redundant
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('limit_rules') AND name = 'lottery_id')
BEGIN
    ALTER TABLE limit_rules DROP COLUMN lottery_id;
    PRINT '  ? Dropped lottery_id from limit_rules';
END

PRINT '';
GO

-- ===================================================================
-- STEP 3: Recreate unique constraints WITHOUT lottery_id
-- ===================================================================
PRINT '3. Recreating unique constraints without lottery_id...';

-- hot_numbers: (draw_id, draw_date, bet_number) is sufficient
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_hot_numbers' AND type = 'UQ')
BEGIN
    ALTER TABLE hot_numbers
    ADD CONSTRAINT UQ_hot_numbers
    UNIQUE (draw_id, draw_date, bet_number);
    PRINT '  ? Created UQ_hot_numbers (draw_id, draw_date, bet_number)';
END

-- limit_consumption: Remove lottery_id from constraint
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_limit_consumption' AND type = 'UQ')
BEGIN
    ALTER TABLE limit_consumption
    ADD CONSTRAINT UQ_limit_consumption
    UNIQUE (limit_rule_id, draw_id, draw_date, bet_number, betting_pool_id);
    PRINT '  ? Created UQ_limit_consumption (without lottery_id)';
END

PRINT '';
GO

-- ===================================================================
-- STEP 4: Migrate betting_pool_prizes_commissions
-- ===================================================================
PRINT '4. Migrating betting_pool_prizes_commissions from lottery_id to draw_id...';

-- Add draw_id column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'lottery_id')
AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'draw_id')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions ADD draw_id INT NULL;
    PRINT '  ? Added draw_id column';
END
GO

-- Migrate data
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'lottery_id')
AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'draw_id')
BEGIN
    UPDATE bppc
    SET bppc.draw_id = (
        SELECT TOP 1 d.draw_id
        FROM draws d
        WHERE d.lottery_id = bppc.lottery_id
          AND d.is_active = 1
        ORDER BY d.draw_id
    )
    FROM betting_pool_prizes_commissions bppc
    WHERE bppc.draw_id IS NULL;

    DECLARE @migrated INT, @unmigrated INT;
    SELECT @migrated = COUNT(*) FROM betting_pool_prizes_commissions WHERE draw_id IS NOT NULL;
    SELECT @unmigrated = COUNT(*) FROM betting_pool_prizes_commissions WHERE draw_id IS NULL;

    PRINT '  ? Migrated ' + CAST(@migrated AS VARCHAR(10)) + ' rows from lottery_id to draw_id';

    IF @unmigrated > 0
        PRINT '  ! Warning: ' + CAST(@unmigrated AS VARCHAR(10)) + ' rows could not be migrated';
END
GO

-- Drop lottery_id column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'lottery_id')
AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'draw_id')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions DROP COLUMN lottery_id;
    PRINT '  ? Dropped lottery_id column';

    ALTER TABLE betting_pool_prizes_commissions ALTER COLUMN draw_id INT NOT NULL;
    PRINT '  ? Set draw_id to NOT NULL';
END
GO

-- Add FK constraint
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pool_prizes_commissions_draw')
AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'draw_id')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT FK_betting_pool_prizes_commissions_draw
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id);
    PRINT '  ? Added FK constraint to draws';
END
GO

-- Recreate unique constraint with draw_id
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ_pool_draw_game' AND type = 'UQ')
AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_prizes_commissions') AND name = 'draw_id')
BEGIN
    ALTER TABLE betting_pool_prizes_commissions
    ADD CONSTRAINT UQ_pool_draw_game
    UNIQUE (betting_pool_id, draw_id, game_type);
    PRINT '  ? Created UQ_pool_draw_game (betting_pool_id, draw_id, game_type)';
END

PRINT '';
GO

-- ===================================================================
-- STEP 5: Drop incorrect lottery compatibility tables
-- ===================================================================
PRINT '5. Dropping incorrect lottery compatibility tables...';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('lottery_game_compatibility') AND type in (N'U'))
BEGIN
    DROP TABLE lottery_game_compatibility;
    PRINT '  ? Dropped lottery_game_compatibility (use draw_game_compatibility)';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('lottery_bet_type_compatibility') AND type in (N'U'))
BEGIN
    DROP TABLE lottery_bet_type_compatibility;
    PRINT '  ? Dropped lottery_bet_type_compatibility (use draw_bet_type_compatibility)';
END

PRINT '';
GO

-- ===================================================================
-- STEP 6: Verification
-- ===================================================================
PRINT '6. Verification...';

DECLARE @bad_tables INT;
SELECT @bad_tables = COUNT(DISTINCT t.TABLE_NAME)
FROM INFORMATION_SCHEMA.COLUMNS c
JOIN INFORMATION_SCHEMA.TABLES t ON c.TABLE_NAME = t.TABLE_NAME
WHERE c.COLUMN_NAME = 'lottery_id'
  AND t.TABLE_TYPE = 'BASE TABLE'
  AND t.TABLE_NAME NOT IN ('lotteries', 'draws')
  AND t.TABLE_NAME NOT LIKE '%backup%';

IF @bad_tables = 0
    PRINT '  ? SUCCESS: Only lotteries and draws have lottery_id';
ELSE
BEGIN
    PRINT '  X FAILED: ' + CAST(@bad_tables AS VARCHAR(10)) + ' tables still have lottery_id';
    PRINT '';
    PRINT '  Tables with lottery_id:';
    SELECT '    - ' + t.TABLE_NAME as TableName
    FROM INFORMATION_SCHEMA.COLUMNS c
    JOIN INFORMATION_SCHEMA.TABLES t ON c.TABLE_NAME = t.TABLE_NAME
    WHERE c.COLUMN_NAME = 'lottery_id'
      AND t.TABLE_TYPE = 'BASE TABLE'
      AND t.TABLE_NAME NOT LIKE '%backup%'
    ORDER BY t.TABLE_NAME;
END

PRINT '';
PRINT '=== Migration Complete ===';
PRINT 'End time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
GO
