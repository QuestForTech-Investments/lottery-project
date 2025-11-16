USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'LISTING ALL STORED PROCEDURES';
PRINT '================================================================================';
PRINT '';

-- List all stored procedures with their definitions
SELECT
    SCHEMA_NAME(schema_id) AS [Schema],
    name AS [Procedure Name],
    create_date AS [Created],
    modify_date AS [Last Modified]
FROM sys.procedures
ORDER BY name;

PRINT '';
PRINT '================================================================================';
PRINT 'STORED PROCEDURE DEFINITIONS';
PRINT '================================================================================';
PRINT '';

-- Get the definition of each stored procedure
DECLARE @ProcName NVARCHAR(128);
DECLARE @SchemaName NVARCHAR(128);
DECLARE @Definition NVARCHAR(MAX);

DECLARE proc_cursor CURSOR FOR
SELECT SCHEMA_NAME(schema_id), name
FROM sys.procedures
ORDER BY name;

OPEN proc_cursor;
FETCH NEXT FROM proc_cursor INTO @SchemaName, @ProcName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '--------------------------------------------------------------------------------';
    PRINT 'Procedure: ' + @SchemaName + '.' + @ProcName;
    PRINT '--------------------------------------------------------------------------------';

    SELECT @Definition = OBJECT_DEFINITION(OBJECT_ID(@SchemaName + '.' + @ProcName));
    PRINT @Definition;
    PRINT '';

    FETCH NEXT FROM proc_cursor INTO @SchemaName, @ProcName;
END

CLOSE proc_cursor;
DEALLOCATE proc_cursor;

GO
