USE [lottery-db];
GO

-- Check all FKs that reference draws
SELECT 
    fk.name AS FK_Name,
    OBJECT_NAME(fkc.parent_object_id) AS From_Table,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS From_Column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fkc.referenced_object_id) = 'draws';
