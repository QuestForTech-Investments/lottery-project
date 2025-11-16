USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING CURRENT TABLE AND COLUMN NAMES';
PRINT '================================================================================';
PRINT '';

-- Check which premio tables exist
PRINT 'Tables that currently exist:';
PRINT '';

DECLARE @Tables TABLE (TableName NVARCHAR(128));

INSERT INTO @Tables
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN (
    'campos_premio', 'prize_fields',
    'tipos_apuesta', 'bet_types',
    'sorteos', 'draws',
    'configuracion_general_banca', 'betting_pool_general_config',
    'configuracion_sorteo_banca', 'betting_pool_draw_config',
    'banca_sorteos', 'betting_pool_draws',
    'auditoria_cambios_premios', 'prize_changes_audit'
)
ORDER BY TABLE_NAME;

DECLARE @TableName NVARCHAR(128);
DECLARE table_cursor CURSOR FOR SELECT TableName FROM @Tables;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '  - ' + @TableName;
    FETCH NEXT FROM table_cursor INTO @TableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

PRINT '';

-- Check column names for each table that exists
IF OBJECT_ID('campos_premio', 'U') IS NOT NULL
BEGIN
    PRINT 'Table: campos_premio (SPANISH)';
    SELECT '  Column: ' + COLUMN_NAME AS ColumnInfo
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'campos_premio'
    ORDER BY ORDINAL_POSITION;
    PRINT '';
END

IF OBJECT_ID('prize_fields', 'U') IS NOT NULL
BEGIN
    PRINT 'Table: prize_fields (ENGLISH)';
    DECLARE @Columns NVARCHAR(MAX) = '';
    SELECT @Columns = @Columns + '  - ' + COLUMN_NAME + CHAR(13) + CHAR(10)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'prize_fields'
    ORDER BY ORDINAL_POSITION;
    PRINT @Columns;
END

IF OBJECT_ID('configuracion_general_banca', 'U') IS NOT NULL
BEGIN
    PRINT 'Table: configuracion_general_banca (SPANISH)';
    SET @Columns = '';
    SELECT @Columns = @Columns + '  - ' + COLUMN_NAME + CHAR(13) + CHAR(10)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'configuracion_general_banca'
    ORDER BY ORDINAL_POSITION;
    PRINT @Columns;
END

IF OBJECT_ID('betting_pool_general_config', 'U') IS NOT NULL
BEGIN
    PRINT 'Table: betting_pool_general_config (ENGLISH)';
    SET @Columns = '';
    SELECT @Columns = @Columns + '  - ' + COLUMN_NAME + CHAR(13) + CHAR(10)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_general_config'
    ORDER BY ORDINAL_POSITION;
    PRINT @Columns;
END

PRINT '================================================================================';
PRINT 'DIAGNOSTIC COMPLETE';
PRINT '================================================================================';

GO
