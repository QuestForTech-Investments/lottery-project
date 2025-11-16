USE [lottery-db];
GO

-- Get column details for draws table
SELECT 
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Max_Length',
    IS_NULLABLE AS 'Nullable',
    COLUMN_DEFAULT AS 'Default'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'draws'
ORDER BY ORDINAL_POSITION;

-- Get primary key
SELECT 
    COLUMN_NAME AS 'Primary_Key_Column'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'draws'
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
WHERE OBJECT_NAME(fkc.parent_object_id) = 'draws';

-- Get indexes
SELECT 
    i.name AS 'Index_Name',
    i.type_desc AS 'Index_Type',
    COL_NAME(ic.object_id, ic.column_id) AS 'Column_Name',
    i.is_unique AS 'Is_Unique'
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE i.object_id = OBJECT_ID('draws')
AND i.name IS NOT NULL
ORDER BY i.name, ic.key_ordinal;
