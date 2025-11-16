USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING TRIGGERS ON CONFIG TABLES';
PRINT '================================================================================';
PRINT '';

-- Check triggers on betting_pool_general_config
PRINT 'Triggers on betting_pool_general_config:';
SELECT
    '  Trigger: ' + tr.name AS TriggerName,
    '    Type: ' + CASE WHEN tr.is_instead_of_trigger = 1 THEN 'INSTEAD OF' ELSE 'AFTER' END AS TriggerType,
    '    Events: ' +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsInsertTrigger') = 1 THEN 'INSERT ' ELSE '' END +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsUpdateTrigger') = 1 THEN 'UPDATE ' ELSE '' END +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsDeleteTrigger') = 1 THEN 'DELETE' ELSE '' END AS Events
FROM sys.triggers tr
WHERE OBJECT_NAME(tr.parent_id) = 'betting_pool_general_config';
PRINT '';

-- Get trigger definitions for betting_pool_general_config
DECLARE @TriggerName NVARCHAR(128);
DECLARE @Definition NVARCHAR(MAX);

DECLARE trig_cursor CURSOR FOR
SELECT name
FROM sys.triggers
WHERE OBJECT_NAME(parent_id) = 'betting_pool_general_config';

OPEN trig_cursor;
FETCH NEXT FROM trig_cursor INTO @TriggerName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '--------------------------------------------------------------------------------';
    PRINT 'Trigger Definition: ' + @TriggerName;
    PRINT '--------------------------------------------------------------------------------';

    SELECT @Definition = OBJECT_DEFINITION(OBJECT_ID(@TriggerName));
    PRINT @Definition;
    PRINT '';

    FETCH NEXT FROM trig_cursor INTO @TriggerName;
END

CLOSE trig_cursor;
DEALLOCATE trig_cursor;

-- Check triggers on betting_pool_draw_config
PRINT 'Triggers on betting_pool_draw_config:';
SELECT
    '  Trigger: ' + tr.name AS TriggerName,
    '    Type: ' + CASE WHEN tr.is_instead_of_trigger = 1 THEN 'INSTEAD OF' ELSE 'AFTER' END AS TriggerType,
    '    Events: ' +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsInsertTrigger') = 1 THEN 'INSERT ' ELSE '' END +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsUpdateTrigger') = 1 THEN 'UPDATE ' ELSE '' END +
        CASE WHEN OBJECTPROPERTY(tr.object_id, 'ExecIsDeleteTrigger') = 1 THEN 'DELETE' ELSE '' END AS Events
FROM sys.triggers tr
WHERE OBJECT_NAME(tr.parent_id) = 'betting_pool_draw_config';
PRINT '';

-- Get trigger definitions for betting_pool_draw_config
DECLARE trig_cursor2 CURSOR FOR
SELECT name
FROM sys.triggers
WHERE OBJECT_NAME(parent_id) = 'betting_pool_draw_config';

OPEN trig_cursor2;
FETCH NEXT FROM trig_cursor2 INTO @TriggerName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '--------------------------------------------------------------------------------';
    PRINT 'Trigger Definition: ' + @TriggerName;
    PRINT '--------------------------------------------------------------------------------';

    SELECT @Definition = OBJECT_DEFINITION(OBJECT_ID(@TriggerName));
    PRINT @Definition;
    PRINT '';

    FETCH NEXT FROM trig_cursor2 INTO @TriggerName;
END

CLOSE trig_cursor2;
DEALLOCATE trig_cursor2;

PRINT '================================================================================';

GO
