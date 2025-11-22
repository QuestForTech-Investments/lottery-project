-- Verificar si existen las tablas tickets y ticket_lines
SELECT 
    t.name AS TableName,
    COUNT(c.column_id) AS ColumnCount
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name IN ('tickets', 'ticket_lines')
GROUP BY t.name;

-- Verificar columnas IDENTITY
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    c.is_identity AS IsIdentity
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name IN ('tickets', 'ticket_lines') AND c.is_identity = 1;
