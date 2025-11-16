-- =============================================
-- Script: Create lotteries_copy table
-- Purpose: Create a copy of lotteries table structure (no data)
-- Date: 2025-11-11
-- =============================================

USE [lottery-db];
GO

SET NOCOUNT ON;
PRINT '================================================================================'
PRINT 'CREATE LOTTERIES_COPY TABLE'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- STEP 1: Check if table exists
-- =============================================
IF OBJECT_ID('lotteries_copy', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: lotteries_copy table already exists!'
    PRINT 'Dropping existing table...'
    DROP TABLE lotteries_copy;
    PRINT '✓ Existing table dropped'
    PRINT ''
END

-- =============================================
-- STEP 2: Create table with same structure
-- =============================================
PRINT 'Creating lotteries_copy table...'
PRINT ''

CREATE TABLE lotteries_copy (
    lottery_id INT IDENTITY(1,1) NOT NULL,
    country_id INT NOT NULL,
    lottery_name NVARCHAR(100) NOT NULL,
    lottery_type NVARCHAR(50) NULL,
    description NVARCHAR(500) NULL,
    display_order INT NULL,
    is_active BIT NULL DEFAULT (1),
    created_at DATETIME2(7) NULL DEFAULT (GETDATE()),
    created_by INT NULL,
    updated_at DATETIME2(7) NULL,
    updated_by INT NULL,

    CONSTRAINT PK_lotteries_copy PRIMARY KEY CLUSTERED (lottery_id)
);
GO

PRINT '✓ Table structure created successfully'
PRINT ''

-- =============================================
-- STEP 3: Create indexes (optional - commented out)
-- =============================================
/*
PRINT 'Creating indexes...'

CREATE NONCLUSTERED INDEX IX_lotteries_copy_country_id
    ON lotteries_copy(country_id)
    WHERE is_active = 1;

CREATE NONCLUSTERED INDEX IX_lotteries_copy_active
    ON lotteries_copy(is_active, display_order);

PRINT '✓ Indexes created'
PRINT ''
*/

-- =============================================
-- STEP 4: Verify table structure
-- =============================================
PRINT 'Verifying table structure...'
PRINT ''

SELECT
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Max_Length',
    IS_NULLABLE AS 'Nullable'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries_copy'
ORDER BY ORDINAL_POSITION;

-- Count records
DECLARE @RecordCount INT;
SELECT @RecordCount = COUNT(*) FROM lotteries_copy;

PRINT ''
PRINT '✓ Table created with ' + CAST(@RecordCount AS VARCHAR(10)) + ' records'
PRINT ''

-- =============================================
-- STEP 5: Show comparison
-- =============================================
PRINT 'Comparison with original table:'
PRINT ''

DECLARE @OriginalCount INT;
SELECT @OriginalCount = COUNT(*) FROM lotteries;

PRINT '  lotteries (original): ' + CAST(@OriginalCount AS VARCHAR(10)) + ' records'
PRINT '  lotteries_copy (new):  ' + CAST(@RecordCount AS VARCHAR(10)) + ' records'
PRINT ''

-- =============================================
-- Summary
-- =============================================
PRINT '================================================================================'
PRINT '✓ LOTTERIES_COPY TABLE CREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Table Details:'
PRINT '  - Name: lotteries_copy'
PRINT '  - Structure: Same as lotteries'
PRINT '  - Records: 0 (empty table)'
PRINT '  - Primary Key: lottery_id (IDENTITY)'
PRINT '  - Foreign Keys: None (independent table)'
PRINT ''
PRINT 'To populate with data from original table:'
PRINT '  SET IDENTITY_INSERT lotteries_copy ON;'
PRINT '  INSERT INTO lotteries_copy SELECT * FROM lotteries;'
PRINT '  SET IDENTITY_INSERT lotteries_copy OFF;'
PRINT ''
PRINT 'To add specific lotteries:'
PRINT '  INSERT INTO lotteries_copy (country_id, lottery_name, lottery_type)'
PRINT '  VALUES (2, ''LA PRIMERA'', ''Dominican'');'
PRINT ''
PRINT '================================================================================'

GO
