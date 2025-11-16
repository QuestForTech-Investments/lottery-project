USE [lottery-db];
GO

PRINT '================================================================================'
PRINT 'DATABASE SCHEMA: lottery-db'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- 1. All Tables with Record Counts
-- =============================================
PRINT '1. TABLES AND RECORD COUNTS'
PRINT '================================================================================'

SELECT 
    t.name AS Table_Name,
    (SELECT COUNT(*) FROM sys.columns WHERE object_id = t.object_id) AS Column_Count,
    p.rows AS Record_Count
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0,1)
ORDER BY t.name;

PRINT ''
PRINT ''

-- =============================================
-- 2. Foreign Key Relationships
-- =============================================
PRINT '2. FOREIGN KEY RELATIONSHIPS'
PRINT '================================================================================'

SELECT 
    OBJECT_NAME(fkc.parent_object_id) AS From_Table,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS From_Column,
    OBJECT_NAME(fkc.referenced_object_id) AS To_Table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS To_Column,
    fk.name AS FK_Name
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
ORDER BY OBJECT_NAME(fkc.parent_object_id);

PRINT ''
PRINT ''

-- =============================================
-- 3. Main Tables Structure
-- =============================================
PRINT '3. MAIN TABLES STRUCTURE'
PRINT '================================================================================'
PRINT ''

-- Countries
PRINT 'TABLE: countries'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('countries'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'countries'
ORDER BY ORDINAL_POSITION;

PRINT ''

-- Lotteries (original)
PRINT 'TABLE: lotteries (original - 69 sorteos convertidos)'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('lotteries'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries'
ORDER BY ORDINAL_POSITION;

PRINT ''

-- Lotteries_copy
PRINT 'TABLE: lotteries_copy (NEW - 30 loterías)'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('lotteries_copy'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'lotteries_copy'
ORDER BY ORDINAL_POSITION;

PRINT ''

-- Draws
PRINT 'TABLE: draws (NEW - 69 sorteos)'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('draws'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'draws'
ORDER BY ORDINAL_POSITION;

PRINT ''

-- Betting Pools
PRINT 'TABLE: betting_pools (bancas)'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('betting_pools'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'betting_pools'
ORDER BY ORDINAL_POSITION;

PRINT ''

-- Users
PRINT 'TABLE: users'
PRINT '---'
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH AS Max_Length,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('users'), COLUMN_NAME, 'IsIdentity') AS Is_Identity
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

PRINT ''
PRINT '================================================================================'
PRINT 'END OF SCHEMA'
PRINT '================================================================================'
