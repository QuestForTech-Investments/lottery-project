-- =============================================
-- Script: Populate lotteries_copy with 30 lotteries
-- Purpose: Insert specified lotteries into lotteries_copy
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

PRINT '================================================================================'
PRINT 'POPULATING LOTTERIES_COPY TABLE'
PRINT '================================================================================'
PRINT ''

BEGIN TRANSACTION;
BEGIN TRY

-- =============================================
-- STEP 1: Add missing countries if needed
-- =============================================
PRINT '1. Checking and adding missing countries...'
PRINT ''

-- Check if Netherlands (Caribbean) exists
IF NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Netherlands (Caribbean)')
BEGIN
    INSERT INTO countries (country_id, country_name, country_code, is_active, created_at)
    VALUES (10, 'Netherlands (Caribbean)', 'NC', 1, GETDATE());
    PRINT '   ✓ Added: Netherlands (Caribbean)'
END

-- Check if Anguilla exists
IF NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Anguilla')
BEGIN
    INSERT INTO countries (country_id, country_name, country_code, is_active, created_at)
    VALUES (11, 'Anguilla', 'AI', 1, GETDATE());
    PRINT '   ✓ Added: Anguilla'
END

-- Check if Nicaragua exists
IF NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Nicaragua')
BEGIN
    INSERT INTO countries (country_id, country_name, country_code, is_active, created_at)
    VALUES (12, 'Nicaragua', 'NI', 1, GETDATE());
    PRINT '   ✓ Added: Nicaragua'
END

PRINT ''

-- =============================================
-- STEP 2: Get country IDs
-- =============================================
PRINT '2. Getting country IDs...'
PRINT ''

DECLARE @DominicanRepublicId INT = (SELECT country_id FROM countries WHERE country_name = 'Dominican Republic');
DECLARE @UnitedStatesId INT = (SELECT country_id FROM countries WHERE country_name = 'United States');
DECLARE @PuertoRicoId INT = (SELECT country_id FROM countries WHERE country_name = 'Puerto Rico');
DECLARE @PanamaId INT = (SELECT country_id FROM countries WHERE country_name = 'Panama');
DECLARE @NetherlandsCaribbeanId INT = (SELECT country_id FROM countries WHERE country_name = 'Netherlands (Caribbean)');
DECLARE @AnguillaId INT = (SELECT country_id FROM countries WHERE country_name = 'Anguilla');
DECLARE @NicaraguaId INT = (SELECT country_id FROM countries WHERE country_name = 'Nicaragua');

PRINT '   Dominican Republic: ' + CAST(@DominicanRepublicId AS VARCHAR(10));
PRINT '   United States: ' + CAST(@UnitedStatesId AS VARCHAR(10));
PRINT '   Puerto Rico: ' + CAST(@PuertoRicoId AS VARCHAR(10));
PRINT '   Panama: ' + CAST(@PanamaId AS VARCHAR(10));
PRINT '   Netherlands (Caribbean): ' + CAST(@NetherlandsCaribbeanId AS VARCHAR(10));
PRINT '   Anguilla: ' + CAST(@AnguillaId AS VARCHAR(10));
PRINT '   Nicaragua: ' + CAST(@NicaraguaId AS VARCHAR(10));
PRINT ''

-- =============================================
-- STEP 3: Insert lotteries into lotteries_copy
-- =============================================
PRINT '3. Inserting lotteries into lotteries_copy...'
PRINT ''

-- Dominican Republic lotteries
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@DominicanRepublicId, 'Lotería Nacional Dominicana', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'Loteka', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'Quiniela Pale', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'Gana Más', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'La Primera', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'La Suerte', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'Lotedom', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'Super Pale', NULL, 1, GETDATE()),
(@DominicanRepublicId, 'La Chica', NULL, 1, GETDATE());

PRINT '   ✓ Inserted 9 Dominican Republic lotteries';

-- United States lotteries (with State as lottery_type)
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@UnitedStatesId, 'New York Lottery', 'New York', 1, GETDATE()),
(@UnitedStatesId, 'Florida Lottery', 'Florida', 1, GETDATE()),
(@UnitedStatesId, 'Georgia Lottery', 'Georgia', 1, GETDATE()),
(@UnitedStatesId, 'New Jersey Lottery', 'New Jersey', 1, GETDATE()),
(@UnitedStatesId, 'Connecticut Lottery', 'Connecticut', 1, GETDATE()),
(@UnitedStatesId, 'California Lottery', 'California', 1, GETDATE()),
(@UnitedStatesId, 'Illinois Lottery', 'Illinois', 1, GETDATE()),
(@UnitedStatesId, 'Pennsylvania Lottery', 'Pennsylvania', 1, GETDATE()),
(@UnitedStatesId, 'Indiana Lottery', 'Indiana', 1, GETDATE()),
(@UnitedStatesId, 'Texas Lottery', 'Texas', 1, GETDATE()),
(@UnitedStatesId, 'Virginia Lottery', 'Virginia', 1, GETDATE()),
(@UnitedStatesId, 'South Carolina Lottery', 'South Carolina', 1, GETDATE()),
(@UnitedStatesId, 'Maryland Lottery', 'Maryland', 1, GETDATE()),
(@UnitedStatesId, 'Massachusetts Lottery', 'Massachusetts', 1, GETDATE()),
(@UnitedStatesId, 'North Carolina Lottery', 'North Carolina', 1, GETDATE()),
(@UnitedStatesId, 'Delaware Lottery', 'Delaware', 1, GETDATE());

PRINT '   ✓ Inserted 16 United States lotteries';

-- Puerto Rico lottery
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@PuertoRicoId, 'Lotería Electrónica de Puerto Rico', NULL, 1, GETDATE());

PRINT '   ✓ Inserted 1 Puerto Rico lottery';

-- Panama lottery
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@PanamaId, 'Lotería Nacional de Panamá', NULL, 1, GETDATE());

PRINT '   ✓ Inserted 1 Panama lottery';

-- Netherlands (Caribbean) lottery
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@NetherlandsCaribbeanId, 'King Lottery', 'Sint Maarten', 1, GETDATE());

PRINT '   ✓ Inserted 1 Netherlands (Caribbean) lottery';

-- Anguilla lottery
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@AnguillaId, 'Anguilla Lottery', NULL, 1, GETDATE());

PRINT '   ✓ Inserted 1 Anguilla lottery';

-- Nicaragua lottery
INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type, is_active, created_at)
VALUES
(@NicaraguaId, 'La Diaria', NULL, 1, GETDATE());

PRINT '   ✓ Inserted 1 Nicaragua lottery';

PRINT ''

-- =============================================
-- STEP 4: Verify insertion
-- =============================================
PRINT '4. Verifying insertion...'
PRINT ''

DECLARE @InsertedCount INT;
SELECT @InsertedCount = COUNT(*) FROM lotteries_copy;

PRINT '   Total lotteries in lotteries_copy: ' + CAST(@InsertedCount AS VARCHAR(10));
PRINT ''

-- Show summary by country
SELECT
    c.country_name AS Country,
    COUNT(*) AS Lottery_Count
FROM lotteries_copy lc
INNER JOIN countries c ON lc.country_id = c.country_id
GROUP BY c.country_name
ORDER BY COUNT(*) DESC;

PRINT ''

-- =============================================
-- STEP 5: Show sample data
-- =============================================
PRINT '5. Sample data (first 10 lotteries)...'
PRINT ''

SELECT TOP 10
    lc.lottery_id,
    c.country_name AS Country,
    lc.lottery_name AS Lottery,
    lc.lottery_type AS State_Type,
    lc.is_active AS Active
FROM lotteries_copy lc
INNER JOIN countries c ON lc.country_id = c.country_id
ORDER BY lc.lottery_id;

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
    PRINT '  - Total lotteries inserted: 30'
    PRINT '  - Dominican Republic: 9 lotteries'
    PRINT '  - United States: 16 lotteries'
    PRINT '  - Puerto Rico: 1 lottery'
    PRINT '  - Panama: 1 lottery'
    PRINT '  - Netherlands (Caribbean): 1 lottery'
    PRINT '  - Anguilla: 1 lottery'
    PRINT '  - Nicaragua: 1 lottery'
    PRINT ''
    PRINT '✓ Table: lotteries_copy'
    PRINT '✓ All records active (is_active = 1)'
    PRINT '================================================================================'
END
ELSE
BEGIN
    ROLLBACK TRANSACTION;
    PRINT '✗ ERROR: Expected 30 lotteries but found ' + CAST(@InsertedCount AS VARCHAR(10));
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
