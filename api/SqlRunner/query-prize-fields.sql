USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'PRIZE_FIELDS TABLE STRUCTURE AND DATA';
PRINT '================================================================================';
PRINT '';

-- Show table structure
PRINT '1. Table Structure:';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'prize_fields'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '2. Sample Data (First 20 records):';
SELECT TOP 20
    field_id,
    bet_type,
    prize_category,
    field_name,
    field_code,
    default_multiplier,
    is_active
FROM prize_fields
ORDER BY field_id;

PRINT '';
PRINT '3. Total Records:';
SELECT COUNT(*) AS TotalRecords FROM prize_fields;

PRINT '';
PRINT '4. Group by Bet Type:';
SELECT
    bet_type,
    COUNT(*) AS CountPerType
FROM prize_fields
GROUP BY bet_type
ORDER BY bet_type;

GO
