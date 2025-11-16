-- ============================================
-- Script to extract complete database schema
-- ============================================

-- Get all table definitions with columns, data types, nullability
SELECT
    t.name AS TableName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length AS MaxLength,
    c.precision AS Precision,
    c.scale AS Scale,
    c.is_nullable AS IsNullable,
    c.is_identity AS IsIdentity,
    ISNULL(dc.definition, '') AS DefaultValue,
    c.column_id AS ColumnOrder
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE t.type = 'U'
ORDER BY t.name, c.column_id;
