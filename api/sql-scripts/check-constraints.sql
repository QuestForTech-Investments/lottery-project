USE [lottery-db];
GO

PRINT '================================================================================';
PRINT 'CHECKING CONSTRAINTS ON CONFIG TABLES';
PRINT '================================================================================';
PRINT '';

-- Check constraints on betting_pool_general_config
PRINT 'Constraints on betting_pool_general_config:';
SELECT
    '  ' + CONSTRAINT_NAME AS ConstraintName,
    CONSTRAINT_TYPE AS Type
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'betting_pool_general_config';
PRINT '';

-- Check default constraints and check constraints
SELECT
    '  ' + cc.name AS ConstraintName,
    '    Column: ' + COL_NAME(cc.parent_object_id, cc.parent_column_id) AS ColumnName,
    '    Definition: ' + cc.definition AS Definition
FROM sys.check_constraints cc
WHERE OBJECT_NAME(cc.parent_object_id) = 'betting_pool_general_config';
PRINT '';

-- Check constraints on betting_pool_draw_config
PRINT 'Constraints on betting_pool_draw_config:';
SELECT
    '  ' + CONSTRAINT_NAME AS ConstraintName,
    CONSTRAINT_TYPE AS Type
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'betting_pool_draw_config';
PRINT '';

SELECT
    '  ' + cc.name AS ConstraintName,
    '    Column: ' + COL_NAME(cc.parent_object_id, cc.parent_column_id) AS ColumnName,
    '    Definition: ' + cc.definition AS Definition
FROM sys.check_constraints cc
WHERE OBJECT_NAME(cc.parent_object_id) = 'betting_pool_draw_config';
PRINT '';

PRINT '================================================================================';

GO
