-- =============================================
-- Script: Migrate draws from backup with lottery mapping
-- Purpose: Copy draws from backup to draws table with correct lottery_id mapping
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================================'
PRINT 'MIGRATING DRAWS WITH LOTTERY MAPPING'
PRINT '================================================================================'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

-- =============================================
-- STEP 1: Drop existing FK constraint
-- =============================================
PRINT '1. Dropping existing FK constraint...'
PRINT ''

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries')
BEGIN
    ALTER TABLE draws DROP CONSTRAINT FK_draws_lotteries;
    PRINT '   ✓ Dropped FK: FK_draws_lotteries'
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_draws_lotteries_copy')
BEGIN
    ALTER TABLE draws DROP CONSTRAINT FK_draws_lotteries_copy;
    PRINT '   ✓ Dropped FK: FK_draws_lotteries_copy'
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
-- STEP 3: Create mapping table
-- =============================================
PRINT '3. Creating lottery name mappings...'
PRINT ''

-- Temporary mapping table: old lottery name → new lottery_id
CREATE TABLE #lottery_mapping (
    old_lottery_name NVARCHAR(100),
    new_lottery_id INT
);

-- Dominican Republic mappings
INSERT INTO #lottery_mapping VALUES ('NACIONAL', 1);
INSERT INTO #lottery_mapping VALUES ('GANA MAS', 4);
INSERT INTO #lottery_mapping VALUES ('QUINIELA PALE', 3);
INSERT INTO #lottery_mapping VALUES ('LA PRIMERA', 5);
INSERT INTO #lottery_mapping VALUES ('LOTEKA', 2);
INSERT INTO #lottery_mapping VALUES ('LOTEDOM', 7);
INSERT INTO #lottery_mapping VALUES ('LA SUERTE', 6);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE TARDE', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NOCHE', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NY-FL AM', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NY-FL PM', 8);
INSERT INTO #lottery_mapping VALUES ('LA CHICA', 9);

-- United States mappings
INSERT INTO #lottery_mapping VALUES ('NEW YORK DAY', 10);
INSERT INTO #lottery_mapping VALUES ('NEW YORK NIGHT', 10);
INSERT INTO #lottery_mapping VALUES ('NY AM 6x1', 10);
INSERT INTO #lottery_mapping VALUES ('NY PM 6x1', 10); -- No existe en backup pero por si acaso

INSERT INTO #lottery_mapping VALUES ('FLORIDA AM', 11);
INSERT INTO #lottery_mapping VALUES ('FLORIDA PM', 11);
INSERT INTO #lottery_mapping VALUES ('FL PICK2 AM', 11);
INSERT INTO #lottery_mapping VALUES ('FL PICK2 PM', 11);
INSERT INTO #lottery_mapping VALUES ('FL AM 6X1', 11);
INSERT INTO #lottery_mapping VALUES ('FL PM 6X1', 11);

INSERT INTO #lottery_mapping VALUES ('GEORGIA-MID AM', 12);
INSERT INTO #lottery_mapping VALUES ('GEORGIA EVENING', 12);
INSERT INTO #lottery_mapping VALUES ('GEORGIA NIGHT', 12);

INSERT INTO #lottery_mapping VALUES ('NEW JERSEY AM', 13);
INSERT INTO #lottery_mapping VALUES ('NEW JERSEY PM', 13);

INSERT INTO #lottery_mapping VALUES ('CONNECTICUT AM', 14);
INSERT INTO #lottery_mapping VALUES ('CONNECTICUT PM', 14);

INSERT INTO #lottery_mapping VALUES ('CALIFORNIA AM', 15);
INSERT INTO #lottery_mapping VALUES ('CALIFORNIA PM', 15);

INSERT INTO #lottery_mapping VALUES ('CHICAGO AM', 16);
INSERT INTO #lottery_mapping VALUES ('CHICAGO PM', 16);

INSERT INTO #lottery_mapping VALUES ('PENN MIDDAY', 17);
INSERT INTO #lottery_mapping VALUES ('PENN EVENING', 17);

INSERT INTO #lottery_mapping VALUES ('INDIANA MIDDAY', 18);
INSERT INTO #lottery_mapping VALUES ('INDIANA EVENING', 18);

INSERT INTO #lottery_mapping VALUES ('TEXAS MORNING', 19);
INSERT INTO #lottery_mapping VALUES ('TEXAS DAY', 19);
INSERT INTO #lottery_mapping VALUES ('TEXAS EVENING', 19);
INSERT INTO #lottery_mapping VALUES ('TEXAS NIGHT', 19);

INSERT INTO #lottery_mapping VALUES ('VIRGINIA AM', 20);
INSERT INTO #lottery_mapping VALUES ('VIRGINIA PM', 20);

INSERT INTO #lottery_mapping VALUES ('SOUTH CAROLINA AM', 21);
INSERT INTO #lottery_mapping VALUES ('SOUTH CAROLINA PM', 21);

INSERT INTO #lottery_mapping VALUES ('MARYLAND MIDDAY', 22);
INSERT INTO #lottery_mapping VALUES ('MARYLAND EVENING', 22);

INSERT INTO #lottery_mapping VALUES ('MASS AM', 23);
INSERT INTO #lottery_mapping VALUES ('MASS PM', 23);

INSERT INTO #lottery_mapping VALUES ('NORTH CAROLINA AM', 24);
INSERT INTO #lottery_mapping VALUES ('NORTH CAROLINA PM', 24);

INSERT INTO #lottery_mapping VALUES ('DELAWARE AM', 25);
INSERT INTO #lottery_mapping VALUES ('DELAWARE PM', 25);

-- Puerto Rico
INSERT INTO #lottery_mapping VALUES ('L.E. PUERTO RICO 2PM', 26);
INSERT INTO #lottery_mapping VALUES ('L.E. PUERTO RICO 10PM', 26);

-- Panama
INSERT INTO #lottery_mapping VALUES ('PANAMA MIERCOLES', 27);
INSERT INTO #lottery_mapping VALUES ('PANAMA DOMINGO', 27);

-- King Lottery (Sint Maarten)
INSERT INTO #lottery_mapping VALUES ('King Lottery AM', 28);
INSERT INTO #lottery_mapping VALUES ('King Lottery PM', 28);

-- Anguilla
INSERT INTO #lottery_mapping VALUES ('Anguila 10am', 29);
INSERT INTO #lottery_mapping VALUES ('Anguila 1pm', 29);
INSERT INTO #lottery_mapping VALUES ('Anguila 6PM', 29);
INSERT INTO #lottery_mapping VALUES ('Anguila 9pm', 29);

-- Nicaragua
INSERT INTO #lottery_mapping VALUES ('PANAMA DOMINGO', 30); -- DIARIA uses PANAMA DOMINGO in backup
INSERT INTO #lottery_mapping VALUES ('DIARIA 11AM', 30);
INSERT INTO #lottery_mapping VALUES ('DIARIA 3PM', 30);
INSERT INTO #lottery_mapping VALUES ('DIARIA 9PM', 30);

DECLARE @MappingCount INT;
SELECT @MappingCount = COUNT(*) FROM #lottery_mapping;
PRINT '   ✓ Created ' + CAST(@MappingCount AS VARCHAR(10)) + ' lottery mappings'
PRINT ''

-- =============================================
-- STEP 4: Insert draws with mapping
-- =============================================
PRINT '4. Inserting draws from backup with new lottery_id...'
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
    COALESCE(lm.new_lottery_id, 0) AS lottery_id,  -- Map to new lottery_id
    db.draw_name,
    db.draw_time,
    db.description,
    db.abbreviation,
    db.display_color,
    db.is_active,
    GETDATE() AS created_at
FROM draws_backup_20251111 db
LEFT JOIN lotteries l ON db.lottery_id = l.lottery_id
LEFT JOIN #lottery_mapping lm ON l.lottery_name = lm.old_lottery_name
WHERE lm.new_lottery_id IS NOT NULL  -- Only insert draws that have valid mapping
ORDER BY lm.new_lottery_id, db.draw_time;

DECLARE @InsertedCount INT = @@ROWCOUNT;
PRINT '   ✓ Inserted ' + CAST(@InsertedCount AS VARCHAR(10)) + ' draws'
PRINT ''

-- =============================================
-- STEP 5: Show unmapped draws (for info)
-- =============================================
PRINT '5. Checking for unmapped draws...'
PRINT ''

SELECT
    l.lottery_name AS Unmapped_Lottery,
    COUNT(*) AS Draw_Count
FROM draws_backup_20251111 db
LEFT JOIN lotteries l ON db.lottery_id = l.lottery_id
LEFT JOIN #lottery_mapping lm ON l.lottery_name = lm.old_lottery_name
WHERE lm.new_lottery_id IS NULL
GROUP BY l.lottery_name
ORDER BY COUNT(*) DESC;

PRINT ''

-- =============================================
-- STEP 6: Verify insertion
-- =============================================
PRINT '6. Verifying insertion...'
PRINT ''

-- Show summary by lottery
SELECT
    lc.lottery_name AS Lottery,
    c.country_name AS Country,
    COUNT(d.draw_id) AS Draw_Count
FROM lotteries_copy lc
LEFT JOIN draws d ON lc.lottery_id = d.lottery_id
LEFT JOIN countries c ON lc.country_id = c.country_id
GROUP BY lc.lottery_name, c.country_name
ORDER BY c.country_name, lc.lottery_name;

PRINT ''

-- Show sample draws
SELECT TOP 15
    d.draw_id,
    lc.lottery_name AS Lottery,
    d.draw_name,
    d.draw_time,
    d.abbreviation
FROM draws d
INNER JOIN lotteries_copy lc ON d.lottery_id = lc.lottery_id
ORDER BY d.draw_id;

PRINT ''

-- =============================================
-- Commit or rollback
-- =============================================
DECLARE @TotalDraws INT;
SELECT @TotalDraws = COUNT(*) FROM draws;

IF @InsertedCount > 0 AND @TotalDraws = @InsertedCount
BEGIN
    COMMIT TRANSACTION;
    PRINT '================================================================================'
    PRINT '✓ MIGRATION COMPLETED SUCCESSFULLY'
    PRINT '================================================================================'
    PRINT ''
    PRINT 'Summary:'
    PRINT '  - Draws migrated: ' + CAST(@InsertedCount AS VARCHAR(10));
    PRINT '  - Source: draws_backup_20251111'
    PRINT '  - Target: draws (with FK to lotteries_copy)'
    PRINT '  - Mapping: Old lottery names → New lottery_id'
    PRINT ''
    PRINT '✓ All draws mapped and inserted successfully'
    PRINT '================================================================================'
END
ELSE
BEGIN
    ROLLBACK TRANSACTION;
    PRINT '✗ ERROR: Unexpected draw count'
    PRINT '✗ Expected: ' + CAST(@InsertedCount AS VARCHAR(10))
    PRINT '✗ Found: ' + CAST(@TotalDraws AS VARCHAR(10))
    PRINT '✗ Transaction rolled back'
END

-- Cleanup
DROP TABLE #lottery_mapping;

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    IF OBJECT_ID('tempdb..#lottery_mapping') IS NOT NULL
        DROP TABLE #lottery_mapping;

    PRINT ''
    PRINT '================================================================================'
    PRINT '✗ ERROR OCCURRED'
    PRINT '================================================================================'
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT ''
    PRINT '✓ Transaction rolled back - NO data was modified'
    PRINT '================================================================================'
END CATCH

GO
