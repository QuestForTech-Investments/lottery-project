USE [lottery-db];
GO

-- Verify table exists
SELECT 
    'lotteries_copy' AS table_name,
    COUNT(*) AS record_count
FROM lotteries_copy;

-- Show table structure comparison
SELECT 'Original: lotteries' AS comparison;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries'
ORDER BY ORDINAL_POSITION;

SELECT 'Copy: lotteries_copy' AS comparison;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries_copy'
ORDER BY ORDINAL_POSITION;
