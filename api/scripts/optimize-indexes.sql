-- ===================================================================
-- Database Index Optimization Script
-- Purpose: Add missing indexes for optimal query performance
-- Date: 2025-11-13
-- ===================================================================

USE [lottery-db];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '=== Starting Index Optimization ===';
PRINT '';

-- ===================================================================
-- 1. DRAWS TABLE INDEXES
-- ===================================================================
PRINT '1. Optimizing DRAWS table indexes...';

-- Check if index exists on lottery_id (FK)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draws_lottery_id' AND object_id = OBJECT_ID('draws'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draws_lottery_id ON draws(lottery_id)
    INCLUDE (draw_name, draw_time, is_active);
    PRINT '  ✓ Created IX_draws_lottery_id';
END
ELSE
    PRINT '  - IX_draws_lottery_id already exists';

-- Check if index exists on is_active
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draws_is_active' AND object_id = OBJECT_ID('draws'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draws_is_active ON draws(is_active)
    INCLUDE (draw_id, lottery_id, draw_name, draw_time)
    WHERE is_active = 1;
    PRINT '  ✓ Created IX_draws_is_active (filtered)';
END
ELSE
    PRINT '  - IX_draws_is_active already exists';

-- Composite index for lottery_id + is_active (common query pattern)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_draws_lottery_active' AND object_id = OBJECT_ID('draws'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_draws_lottery_active ON draws(lottery_id, is_active)
    INCLUDE (draw_name, draw_time);
    PRINT '  ✓ Created IX_draws_lottery_active';
END
ELSE
    PRINT '  - IX_draws_lottery_active already exists';

PRINT '';

-- ===================================================================
-- 2. LOTTERIES TABLE INDEXES
-- ===================================================================
PRINT '2. Optimizing LOTTERIES table indexes...';

-- Check if index exists on country_id (FK)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_lotteries_country_id' AND object_id = OBJECT_ID('lotteries'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_lotteries_country_id ON lotteries(country_id)
    INCLUDE (lottery_name, is_active);
    PRINT '  ✓ Created IX_lotteries_country_id';
END
ELSE
    PRINT '  - IX_lotteries_country_id already exists';

-- Check if index exists on is_active
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_lotteries_is_active' AND object_id = OBJECT_ID('lotteries'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_lotteries_is_active ON lotteries(is_active)
    INCLUDE (lottery_id, lottery_name, country_id)
    WHERE is_active = 1;
    PRINT '  ✓ Created IX_lotteries_is_active (filtered)';
END
ELSE
    PRINT '  - IX_lotteries_is_active already exists';

-- Composite index for country_id + is_active
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_lotteries_country_active' AND object_id = OBJECT_ID('lotteries'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_lotteries_country_active ON lotteries(country_id, is_active)
    INCLUDE (lottery_name);
    PRINT '  ✓ Created IX_lotteries_country_active';
END
ELSE
    PRINT '  - IX_lotteries_country_active already exists';

PRINT '';

-- ===================================================================
-- 3. USERS TABLE INDEXES
-- ===================================================================
PRINT '3. Optimizing USERS table indexes...';

-- Index on username (for login)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_username' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_users_username ON users(username)
    WHERE username IS NOT NULL;
    PRINT '  ✓ Created IX_users_username (unique)';
END
ELSE
    PRINT '  - IX_users_username already exists';

-- Index on email (for lookups)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_email' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_users_email ON users(email)
    WHERE email IS NOT NULL;
    PRINT '  ✓ Created IX_users_email';
END
ELSE
    PRINT '  - IX_users_email already exists';

-- Index on is_active
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_is_active' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_users_is_active ON users(is_active)
    WHERE is_active = 1;
    PRINT '  ✓ Created IX_users_is_active (filtered)';
END
ELSE
    PRINT '  - IX_users_is_active already exists';

PRINT '';

-- ===================================================================
-- 4. PERMISSIONS TABLE INDEXES
-- ===================================================================
PRINT '4. Optimizing PERMISSIONS table indexes...';

-- Index on permission_code (for lookups)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_permissions_code' AND object_id = OBJECT_ID('permissions'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_permissions_code ON permissions(permission_code);
    PRINT '  ✓ Created IX_permissions_code (unique)';
END
ELSE
    PRINT '  - IX_permissions_code already exists';

-- Index on category (for grouping)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_permissions_category' AND object_id = OBJECT_ID('permissions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_permissions_category ON permissions(category)
    INCLUDE (permission_name, is_active);
    PRINT '  ✓ Created IX_permissions_category';
END
ELSE
    PRINT '  - IX_permissions_category already exists';

PRINT '';

-- ===================================================================
-- 5. USER_PERMISSIONS TABLE INDEXES
-- ===================================================================
PRINT '5. Optimizing USER_PERMISSIONS table indexes...';

-- Composite index for user_id + permission_id (prevent duplicates)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_user_permissions_user_permission' AND object_id = OBJECT_ID('user_permissions'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_user_permissions_user_permission
    ON user_permissions(user_id, permission_id);
    PRINT '  ✓ Created IX_user_permissions_user_permission (unique)';
END
ELSE
    PRINT '  - IX_user_permissions_user_permission already exists';

PRINT '';

-- ===================================================================
-- 6. SUMMARY: Show all indexes
-- ===================================================================
PRINT '=== Index Summary ===';
PRINT '';

SELECT
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') AS IndexedColumns
FROM sys.indexes i
WHERE i.object_id IN (
    OBJECT_ID('draws'),
    OBJECT_ID('lotteries'),
    OBJECT_ID('users'),
    OBJECT_ID('permissions'),
    OBJECT_ID('user_permissions')
)
AND i.type > 0  -- Exclude heaps
ORDER BY OBJECT_NAME(i.object_id), i.name;

PRINT '';
PRINT '=== Index Optimization Complete ===';
GO
