USE [lottery-db];
GO

PRINT 'Checking for ALL triggers on prize_fields table:';
GO

SELECT
    tr.name AS TriggerName,
    tr.type_desc AS TriggerType,
    OBJECT_NAME(tr.parent_id) AS TableName,
    tr.is_instead_of_trigger AS IsInsteadOf,
    sm.definition AS TriggerBody
FROM sys.triggers tr
LEFT JOIN sys.sql_modules sm ON tr.object_id = sm.object_id
WHERE OBJECT_NAME(tr.parent_id) = 'prize_fields'
ORDER BY tr.name;
GO
