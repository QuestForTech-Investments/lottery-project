-- ===================================================================
-- Migration: betting_pool_sortitions → betting_pool_draws
-- Purpose: Rename table and fix architecture (lottery_id → draw_id)
-- Date: 2025-11-14
-- ===================================================================

USE [lottery-db];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;
GO

PRINT '=== Sortitions → Draws Migration ===';
PRINT 'Start time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '';

-- ===================================================================
-- STEP 1: Add anticipated_closing_minutes column to betting_pool_draws
-- ===================================================================
PRINT '1. Extending betting_pool_draws table...';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('betting_pool_draws') AND name = 'anticipated_closing_minutes')
BEGIN
    ALTER TABLE betting_pool_draws ADD anticipated_closing_minutes INT NULL;
    PRINT '  ✓ Added anticipated_closing_minutes column';
END
ELSE
    PRINT '  - anticipated_closing_minutes already exists';

PRINT '';
GO

-- ===================================================================
-- STEP 2: Create betting_pool_draw_game_types (N:M) table
-- ===================================================================
PRINT '2. Creating betting_pool_draw_game_types table...';

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('betting_pool_draw_game_types') AND type in (N'U'))
BEGIN
    CREATE TABLE betting_pool_draw_game_types (
        betting_pool_draw_game_type_id INT IDENTITY(1,1) NOT NULL,
        betting_pool_id INT NOT NULL,
        draw_id INT NOT NULL,
        game_type_id INT NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_betting_pool_draw_game_types PRIMARY KEY (betting_pool_draw_game_type_id),
        CONSTRAINT FK_betting_pool_draw_game_types_betting_pool
            FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id),
        CONSTRAINT FK_betting_pool_draw_game_types_draw
            FOREIGN KEY (draw_id) REFERENCES draws(draw_id),
        CONSTRAINT FK_betting_pool_draw_game_types_game_type
            FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
    );

    CREATE UNIQUE NONCLUSTERED INDEX UX_betting_pool_draw_game_type
    ON betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id);

    PRINT '  ✓ Created betting_pool_draw_game_types table';
END
ELSE
    PRINT '  - betting_pool_draw_game_types already exists';

PRINT '';
GO

-- ===================================================================
-- STEP 3: Migrate data from sortitions to draws
-- ===================================================================
PRINT '3. Migrating data from sortitions to draws...';

-- First, map lottery_id to first draw_id for each lottery
IF EXISTS (SELECT * FROM betting_pool_sortitions)
BEGIN
    -- Use a temp table to filter out NULLs
    SELECT
        bps.betting_pool_id,
        (SELECT TOP 1 d.draw_id
         FROM draws d
         WHERE d.lottery_id = CAST(JSON_VALUE(bps.specific_config, '$.lotteryId') AS INT)
           AND d.is_active = 1
         ORDER BY d.draw_id) as draw_id,
        bps.is_enabled as is_active,
        CAST(JSON_VALUE(bps.specific_config, '$.anticipatedClosing') AS INT) as anticipated_closing_minutes,
        bps.created_at,
        bps.sortition_id
    INTO #temp_sortitions
    FROM betting_pool_sortitions bps;

    -- Insert only rows where we found a matching draw_id
    INSERT INTO betting_pool_draws (betting_pool_id, draw_id, is_active, anticipated_closing_minutes, created_at)
    SELECT
        betting_pool_id,
        draw_id,
        is_active,
        anticipated_closing_minutes,
        created_at
    FROM #temp_sortitions
    WHERE draw_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM betting_pool_draws bpd
        WHERE bpd.betting_pool_id = #temp_sortitions.betting_pool_id
          AND bpd.draw_id = #temp_sortitions.draw_id
    );

    DECLARE @migrated INT;
    SELECT @migrated = @@ROWCOUNT;
    PRINT '  ✓ Migrated ' + CAST(@migrated AS VARCHAR(10)) + ' sortitions to draws';

    -- Show unmigrated sortitions (where lottery_id couldn't be mapped to a draw)
    SELECT @migrated = COUNT(*)
    FROM #temp_sortitions
    WHERE draw_id IS NULL;

    IF @migrated > 0
        PRINT '  ⚠ Warning: ' + CAST(@migrated AS VARCHAR(10)) + ' sortitions could not be mapped to draws';

    -- Migrate enabled game types (if any in specific_config)
    INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id, is_active)
    SELECT DISTINCT
        ts.betting_pool_id,
        ts.draw_id,
        CAST(gt.value AS INT) as game_type_id,
        1 as is_active
    FROM #temp_sortitions ts
    CROSS APPLY OPENJSON(JSON_QUERY((
        SELECT specific_config
        FROM betting_pool_sortitions bps
        WHERE bps.sortition_id = ts.sortition_id
    ), '$.enabledGameTypeIds')) gt
    WHERE ts.draw_id IS NOT NULL
      AND JSON_QUERY((
          SELECT specific_config
          FROM betting_pool_sortitions bps
          WHERE bps.sortition_id = ts.sortition_id
      ), '$.enabledGameTypeIds') IS NOT NULL
      AND JSON_QUERY((
          SELECT specific_config
          FROM betting_pool_sortitions bps
          WHERE bps.sortition_id = ts.sortition_id
      ), '$.enabledGameTypeIds') != '[]';

    DECLARE @game_types_migrated INT;
    SELECT @game_types_migrated = @@ROWCOUNT;
    PRINT '  ✓ Migrated ' + CAST(@game_types_migrated AS VARCHAR(10)) + ' game type associations';

    DROP TABLE #temp_sortitions;
END
ELSE
    PRINT '  - No sortitions to migrate';

PRINT '';
GO

-- ===================================================================
-- STEP 4: Verify migration
-- ===================================================================
PRINT '4. Verification...';

DECLARE @sortitions_count INT, @draws_count INT;
SELECT @sortitions_count = COUNT(*) FROM betting_pool_sortitions;
SELECT @draws_count = COUNT(*) FROM betting_pool_draws;

PRINT '  Sortitions (old): ' + CAST(@sortitions_count AS VARCHAR(10));
PRINT '  Draws (new): ' + CAST(@draws_count AS VARCHAR(10));

IF @draws_count >= @sortitions_count
    PRINT '  ✓ Migration successful';
ELSE
    PRINT '  ⚠ Warning: Some sortitions may not have been migrated';

PRINT '';
GO

-- ===================================================================
-- STEP 5: Rename/Drop old table (commented for safety)
-- ===================================================================
PRINT '5. Handling old sortitions table...';
PRINT '  ⚠ NOT dropping betting_pool_sortitions yet (manual verification needed)';
PRINT '  → After verifying data, manually run:';
PRINT '     DROP TABLE betting_pool_sortitions;';

PRINT '';
PRINT '=== Migration Complete ===';
PRINT 'End time: ' + CONVERT(VARCHAR(20), GETDATE(), 120);
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '1. Verify betting_pool_draws has correct data';
PRINT '2. Update API models and controllers';
PRINT '3. Test thoroughly';
PRINT '4. Drop betting_pool_sortitions table manually';
GO
