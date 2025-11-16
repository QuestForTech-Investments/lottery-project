USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING PRIZE_FIELDS TABLE';
PRINT '================================================================================';
PRINT '';

-- Check if table exists
IF OBJECT_ID('prize_fields', 'U') IS NOT NULL
BEGIN
    PRINT '✓ Table prize_fields EXISTS';
    PRINT '';

    -- Show table structure
    PRINT 'Table Structure:';
    SELECT
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'prize_fields'
    ORDER BY ORDINAL_POSITION;

    PRINT '';
    PRINT 'Sample Data (First 10 records):';
    SELECT TOP 10 * FROM prize_fields;

    PRINT '';
    PRINT 'Total Records:';
    SELECT COUNT(*) AS TotalRecords FROM prize_fields;
END
ELSE
BEGIN
    PRINT '❌ Table prize_fields DOES NOT EXIST';
END

GO
