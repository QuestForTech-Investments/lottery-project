USE [lottery-db];
GO

-- Get column details for lotteries table
SELECT 
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Max_Length',
    IS_NULLABLE AS 'Nullable',
    COLUMN_DEFAULT AS 'Default'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries'
ORDER BY ORDINAL_POSITION;

-- Get primary key
SELECT 
    COLUMN_NAME AS 'Primary_Key_Column'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'lotteries'
AND CONSTRAINT_NAME LIKE 'PK%';

-- Get foreign keys
SELECT 
    fk.name AS 'FK_Name',
    OBJECT_NAME(fkc.parent_object_id) AS 'From_Table',
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS 'From_Column',
    OBJECT_NAME(fkc.referenced_object_id) AS 'To_Table',
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS 'To_Column'
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fkc.parent_object_id) = 'lotteries';

-- Get sample data
SELECT TOP 5 
    lottery_id,
    country_id,
    lottery_name,
    lottery_type,
    is_active
FROM lotteries
ORDER BY lottery_id;
