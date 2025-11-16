USE [lottery-db];
GO

PRINT 'Checking triggers on prize_fields table:';
GO

SELECT
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    m.definition AS TriggerDefinition
FROM sys.triggers t
INNER JOIN sys.sql_modules m ON t.object_id = m.object_id
WHERE OBJECT_NAME(t.parent_id) LIKE '%prize%' OR OBJECT_NAME(t.parent_id) LIKE '%campo%'
ORDER BY TableName, TriggerName;
GO

PRINT 'Checking all tables with "campo" or "prize" in name:';
GO

SELECT name FROM sys.tables WHERE name LIKE '%campo%' OR name LIKE '%prize%';
GO
