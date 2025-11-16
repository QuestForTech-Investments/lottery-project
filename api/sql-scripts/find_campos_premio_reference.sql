USE [lottery-db];
GO

PRINT 'Searching for triggers that reference campos_premio...';
GO

SELECT
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    m.definition AS TriggerDefinition
FROM sys.triggers t
INNER JOIN sys.sql_modules m ON t.object_id = m.object_id
WHERE m.definition LIKE '%campos_premio%'
ORDER BY TableName, TriggerName;
GO

PRINT 'Searching for foreign keys that reference campos_premio...';
GO

SELECT
    fk.name AS FKName,
    OBJECT_NAME(fk.parent_object_id) AS ParentTable,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
FROM sys.foreign_keys fk
WHERE fk.name LIKE '%campo%' OR OBJECT_NAME(fk.referenced_object_id) LIKE '%campo%';
GO
