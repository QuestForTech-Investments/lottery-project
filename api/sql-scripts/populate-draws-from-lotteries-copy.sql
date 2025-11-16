-- =============================================
-- Script: Populate draws from lotteries_copy
-- Purpose: Create one draw per lottery (1:1 relationship)
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================================'
PRINT 'POPULATING DRAWS FROM LOTTERIES_COPY'
PRINT '================================================================================'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

-- =============================================
-- STEP 1: Drop existing FK constraint (if exists)
-- =============================================
PRINT '1. Checking FK constraint on draws...'
PRINT ''

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries')
BEGIN
    ALTER TABLE draws DROP CONSTRAINT FK_draws_lotteries;
    PRINT '   ✓ Dropped existing FK: FK_draws_lotteries'
END
ELSE
BEGIN
    PRINT '   ℹ No FK constraint to drop'
END
PRINT ''

-- =============================================
-- STEP 2: Create new FK pointing to lotteries_copy
-- =============================================
PRINT '2. Creating FK to lotteries_copy...'
PRINT ''

ALTER TABLE draws
ADD CONSTRAINT FK_draws_lotteries_copy
FOREIGN KEY (lottery_id)
REFERENCES lotteries_copy(lottery_id);

PRINT '   ✓ Created FK: draws.lottery_id → lotteries_copy.lottery_id'
PRINT ''

-- =============================================
-- STEP 3: Insert draws from lotteries_copy
-- =============================================
PRINT '3. Inserting draws from lotteries_copy...'
PRINT ''

INSERT INTO draws (
    lottery_id,
    draw_name,
    draw_time,
    description,
    abbreviation,
    display_color,
    is_active,
    created_at
)
SELECT
    lottery_id,                                    -- FK to lotteries_copy
    lottery_name,                                  -- lottery_name → draw_name
    '12:00:00',                                    -- Default draw time (noon)
    'Draw for ' + lottery_name,                    -- Auto-generated description
    CASE
        WHEN lottery_type IS NOT NULL
        THEN LEFT(lottery_type, 10)                -- Use state as abbreviation
        ELSE LEFT(lottery_name, 10)                -- Use first 10 chars of name
    END,
    NULL,                                          -- No color assigned yet
    is_active,                                     -- Preserve active status
    GETDATE()                                      -- Current timestamp
FROM lotteries_copy
ORDER BY lottery_id;

DECLARE @InsertedCount INT = @@ROWCOUNT;
PRINT '   ✓ Inserted ' + CAST(@InsertedCount AS VARCHAR(10)) + ' draws'
PRINT ''

-- =============================================
-- STEP 4: Verify insertion
-- =============================================
PRINT '4. Verifying insertion...'
PRINT ''

DECLARE @DrawCount INT;
SELECT @DrawCount = COUNT(*) FROM draws;

PRINT '   Total draws in table: ' + CAST(@DrawCount AS VARCHAR(10));
PRINT ''

-- Show sample data
SELECT TOP 10
    d.draw_id,
    d.lottery_id,
    lc.lottery_name AS Lottery,
    d.draw_name,
    d.draw_time,
    d.abbreviation,
    d.is_active
FROM draws d
INNER JOIN lotteries_copy lc ON d.lottery_id = lc.lottery_id
ORDER BY d.draw_id;

PRINT ''

-- =============================================
-- STEP 5: Show summary by country
-- =============================================
PRINT '5. Summary by country...'
PRINT ''

SELECT
    c.country_name AS Country,
    COUNT(*) AS Draw_Count
FROM draws d
INNER JOIN lotteries_copy lc ON d.lottery_id = lc.lottery_id
INNER JOIN countries c ON lc.country_id = c.country_id
GROUP BY c.country_name
ORDER BY COUNT(*) DESC;

PRINT ''

-- =============================================
-- Commit transaction
-- =============================================
IF @InsertedCount = 30
BEGIN
    COMMIT TRANSACTION;
    PRINT '================================================================================'
    PRINT '✓ MIGRATION COMPLETED SUCCESSFULLY'
    PRINT '================================================================================'
    PRINT ''
    PRINT 'Summary:'
    PRINT '  - Draws inserted: 30'
    PRINT '  - Source: lotteries_copy'
    PRINT '  - Relationship: 1 draw per lottery (1:1)'
    PRINT '  - FK updated: draws.lottery_id → lotteries_copy.lottery_id'
    PRINT '  - Default draw_time: 12:00:00'
    PRINT ''
    PRINT 'Field Mapping:'
    PRINT '  - lottery_name → draw_name'
    PRINT '  - lottery_type → abbreviation'
    PRINT '  - is_active → is_active (preserved)'
    PRINT ''
    PRINT '✓ Table: draws'
    PRINT '✓ All draws active and ready'
    PRINT '================================================================================'
END
ELSE
BEGIN
    ROLLBACK TRANSACTION;
    PRINT '✗ ERROR: Expected 30 draws but inserted ' + CAST(@InsertedCount AS VARCHAR(10));
    PRINT '✗ Transaction rolled back';
END

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT ''
    PRINT '================================================================================'
    PRINT '✗ ERROR OCCURRED'
    PRINT '================================================================================'
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT ''
    PRINT '✓ Transaction rolled back - NO data was inserted';
    PRINT '================================================================================'
END CATCH

GO
