USE [lottery-db];
GO

-- Check if draws table has data
SELECT 
    d.draw_id AS ID,
    d.lottery_id AS Lottery_ID,
    d.draw_name AS Draw_Name,
    d.draw_time AS Draw_Time,
    d.abbreviation AS Abbrev,
    d.display_color AS Color,
    d.is_active AS Active,
    d.description AS Description
FROM draws d
ORDER BY d.draw_id;

-- Count
SELECT 
    'draws' AS table_name,
    COUNT(*) AS total_records
FROM draws;

-- Check FK relationship
SELECT 
    fk.name AS FK_Name,
    OBJECT_NAME(fkc.parent_object_id) AS From_Table,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS From_Column,
    OBJECT_NAME(fkc.referenced_object_id) AS To_Table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS To_Column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fkc.parent_object_id) = 'draws';
