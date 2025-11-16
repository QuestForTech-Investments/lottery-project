-- Verify betting_pools table IDENTITY status
USE [lottery-db];
GO

PRINT 'Checking betting_pools table identity configuration...';
GO

-- Check if column has IDENTITY
SELECT
    t.name AS TableName,
    c.name AS ColumnName,
    c.is_identity AS HasIdentity,
    IDENT_SEED(t.name) AS IdentitySeed,
    IDENT_INCR(t.name) AS IdentityIncrement,
    IDENT_CURRENT(t.name) AS CurrentIdentityValue
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
WHERE t.name = 'betting_pools' AND c.name = 'betting_pool_id';
GO

-- Check table structure
PRINT '';
PRINT 'Full column structure:';
GO

SELECT
    c.name AS ColumnName,
    TYPE_NAME(c.user_type_id) AS DataType,
    c.max_length,
    c.is_nullable,
    c.is_identity,
    ic.seed_value,
    ic.increment_value
FROM sys.columns c
LEFT JOIN sys.identity_columns ic ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE c.object_id = OBJECT_ID('betting_pools')
ORDER BY c.column_id;
GO
