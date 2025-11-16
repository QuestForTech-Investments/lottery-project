-- Script to make country_id nullable in zones table
-- Date: 2025-10-27
-- Purpose: Allow zones to be created without a country

PRINT 'Starting modification of zones table...';
GO

-- Check if the column exists and is NOT NULL
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'zones'
    AND COLUMN_NAME = 'country_id'
    AND IS_NULLABLE = 'NO'
)
BEGIN
    PRINT 'Making country_id nullable in zones table...';

    -- Alter the column to allow NULL
    ALTER TABLE [dbo].[zones]
    ALTER COLUMN [country_id] int NULL;

    PRINT '✅ Successfully modified country_id to allow NULL values';
END
ELSE
BEGIN
    PRINT '⚠️ Column country_id is already nullable or does not exist';
END
GO

-- Verify the change
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'zones'
AND COLUMN_NAME = 'country_id';
GO

PRINT '';
PRINT '✅ Script completed successfully';
GO
