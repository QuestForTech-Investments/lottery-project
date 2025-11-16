-- =============================================
-- Script: Migrate lotteries table to draws table
-- Purpose: Convert 69 lotteries (sorteos) to draws mapped to lotteries_copy
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================================'
PRINT 'MIGRATING LOTTERIES TO DRAWS'
PRINT '================================================================================'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

-- =============================================
-- STEP 1: Clear existing draws
-- =============================================
PRINT '1. Clearing existing draws...'
PRINT ''

DELETE FROM draws;
PRINT '   ✓ Cleared draws table'
PRINT ''

-- =============================================
-- STEP 2: Create mapping table (sorteo name → lottery_id in lotteries_copy)
-- =============================================
PRINT '2. Creating lottery mappings...'
PRINT ''

CREATE TABLE #lottery_mapping (
    sorteo_name NVARCHAR(100),
    new_lottery_id INT
);

-- Dominican Republic sorteos → lotteries
INSERT INTO #lottery_mapping VALUES ('NACIONAL', 1);
INSERT INTO #lottery_mapping VALUES ('LOTEKA', 2);
INSERT INTO #lottery_mapping VALUES ('QUINIELA PALE', 3);
INSERT INTO #lottery_mapping VALUES ('GANA MAS', 4);
INSERT INTO #lottery_mapping VALUES ('LA PRIMERA', 5);
INSERT INTO #lottery_mapping VALUES ('LA PRIMERA 8PM', 5);
INSERT INTO #lottery_mapping VALUES ('LA SUERTE', 6);
INSERT INTO #lottery_mapping VALUES ('LA SUERTE 6:00pm', 6);
INSERT INTO #lottery_mapping VALUES ('LOTEDOM', 7);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE TARDE', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NOCHE', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NY-FL AM', 8);
INSERT INTO #lottery_mapping VALUES ('SUPER PALE NY-FL PM', 8);
INSERT INTO #lottery_mapping VALUES ('LA CHICA', 9);
INSERT INTO #lottery_mapping VALUES ('REAL', 9); -- Map to La Chica for now

-- United States sorteos → lotteries
INSERT INTO #lottery_mapping VALUES ('NEW YORK DAY', 10);
INSERT INTO #lottery_mapping VALUES ('NEW YORK NIGHT', 10);
INSERT INTO #lottery_mapping VALUES ('NY AM 6x1', 10);
INSERT INTO #lottery_mapping VALUES ('NY PM 6x1', 10);

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

-- Nicaragua (La Diaria)
INSERT INTO #lottery_mapping VALUES ('DIARIA 11AM', 30);
INSERT INTO #lottery_mapping VALUES ('DIARIA 3PM', 30);
INSERT INTO #lottery_mapping VALUES ('DIARIA 9PM', 30);

DECLARE @MappingCount INT;
SELECT @MappingCount = COUNT(*) FROM #lottery_mapping;
PRINT '   ✓ Created ' + CAST(@MappingCount AS VARCHAR(10)) + ' sorteo mappings'
PRINT ''

-- =============================================
-- STEP 3: Insert draws from lotteries table
-- =============================================
PRINT '3. Inserting draws from lotteries table...'
PRINT ''

INSERT INTO draws (
    lottery_id,
    draw_name,
    draw_time,
    description,
    abbreviation,
    is_active,
    created_at
)
SELECT
    COALESCE(lm.new_lottery_id, 1) AS lottery_id,  -- Default to lottery 1 if no mapping
    l.lottery_name AS draw_name,
    '12:00:00' AS draw_time,  -- Default time (can be updated later)
    l.description,
    LEFT(l.lottery_name, 10) AS abbreviation,
    l.is_active,
    GETDATE() AS created_at
FROM lotteries l
LEFT JOIN #lottery_mapping lm ON l.lottery_name = lm.sorteo_name
ORDER BY l.lottery_id;

DECLARE @InsertedCount INT = @@ROWCOUNT;
PRINT '   ✓ Inserted ' + CAST(@InsertedCount AS VARCHAR(10)) + ' draws'
PRINT ''

-- =============================================
-- STEP 4: Show unmapped sorteos
-- =============================================
PRINT '4. Checking for unmapped sorteos...'
PRINT ''

SELECT
    l.lottery_name AS Unmapped_Sorteo,
    l.lottery_id AS Old_ID
FROM lotteries l
LEFT JOIN #lottery_mapping lm ON l.lottery_name = lm.sorteo_name
WHERE lm.new_lottery_id IS NULL
ORDER BY l.lottery_name;

PRINT ''

-- =============================================
-- STEP 5: Verify insertion
-- =============================================
PRINT '5. Verifying insertion...'
PRINT ''

-- Summary by lottery
SELECT
    lc.lottery_id,
    lc.lottery_name AS Lottery,
    c.country_name AS Country,
    COUNT(d.draw_id) AS Draw_Count
FROM lotteries_copy lc
LEFT JOIN draws d ON lc.lottery_id = d.lottery_id
LEFT JOIN countries c ON lc.country_id = c.country_id
GROUP BY lc.lottery_id, lc.lottery_name, c.country_name
ORDER BY c.country_name, lc.lottery_name;

PRINT ''

-- Total counts
SELECT
    'lotteries_copy' AS table_name,
    COUNT(*) AS total
FROM lotteries_copy
UNION ALL
SELECT
    'draws',
    COUNT(*)
FROM draws;

PRINT ''

-- =============================================
-- Commit
-- =============================================
IF @InsertedCount = 69
BEGIN
    COMMIT TRANSACTION;
    PRINT '================================================================================'
    PRINT '✓ MIGRATION COMPLETED SUCCESSFULLY'
    PRINT '================================================================================'
    PRINT ''
    PRINT 'Summary:'
    PRINT '  - Lotteries in lotteries_copy: 30'
    PRINT '  - Draws migrated: 69'
    PRINT '  - Source: lotteries table (original)'
    PRINT '  - Target: draws (with FK to lotteries_copy)'
    PRINT ''
    PRINT '✓ All 69 sorteos from lotteries converted to draws'
    PRINT '================================================================================'
END
ELSE
BEGIN
    ROLLBACK TRANSACTION;
    PRINT '✗ ERROR: Expected 69 draws but got ' + CAST(@InsertedCount AS VARCHAR(10))
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
    PRINT '✓ Transaction rolled back - NO changes made'
    PRINT '================================================================================'
END CATCH

GO
