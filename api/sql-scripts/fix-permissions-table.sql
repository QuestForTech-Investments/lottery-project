-- Fix permissions table: Add IDENTITY to permission_id column
-- This script recreates the permissions table with IDENTITY

USE [lottery-db];
GO

PRINT 'Starting permissions table fix...';
GO

-- Step 1: Find and drop ALL foreign keys that reference permissions
PRINT 'Finding all foreign keys that reference permissions...';
GO

DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql +
    'ALTER TABLE [' + SCHEMA_NAME(fk.schema_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] ' +
    'DROP CONSTRAINT [' + fk.name + ']; ' + CHAR(13) +
    'PRINT ''  Dropped ' + fk.name + ''';' + CHAR(13)
FROM sys.foreign_keys fk
WHERE fk.referenced_object_id = OBJECT_ID('dbo.permissions');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Dropping foreign key constraints...';
    EXEC sp_executesql @sql;
END
ELSE
BEGIN
    PRINT 'No foreign keys found referencing permissions table';
END
GO

-- Step 2: Backup existing data
PRINT 'Backing up existing permissions data...';
GO

IF OBJECT_ID('tempdb..#permissions_backup') IS NOT NULL DROP TABLE #permissions_backup;
GO

SELECT *
INTO #permissions_backup
FROM [dbo].[permissions];
GO

DECLARE @BackupCount INT;
SELECT @BackupCount = COUNT(*) FROM #permissions_backup;
PRINT 'Backed up ' + CAST(@BackupCount AS VARCHAR(10)) + ' permissions';
GO

-- Step 3: Drop the original permissions table
PRINT 'Dropping original permissions table...';
GO

DROP TABLE [dbo].[permissions];
GO

PRINT 'Original permissions table dropped';
GO

-- Step 4: Create new permissions table WITH IDENTITY
PRINT 'Creating new permissions table with IDENTITY...';
GO

CREATE TABLE [dbo].[permissions] (
    [permission_id] int NOT NULL IDENTITY(1,1),
    [permission_code] nvarchar(100) NOT NULL,
    [permission_name] nvarchar(200) NOT NULL,
    [category] nvarchar(50) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_permissions] PRIMARY KEY ([permission_id]),
    CONSTRAINT [UQ_permissions_code] UNIQUE ([permission_code])
);
GO

PRINT 'New permissions table created with IDENTITY';
GO

-- Step 5: Restore data (if any existed)
IF EXISTS (SELECT 1 FROM tempdb.sys.objects WHERE object_id = OBJECT_ID('tempdb..#permissions_backup'))
BEGIN
    DECLARE @RestoreCount INT;
    SELECT @RestoreCount = COUNT(*) FROM #permissions_backup;

    IF @RestoreCount > 0
    BEGIN
        PRINT 'Restoring ' + CAST(@RestoreCount AS VARCHAR(10)) + ' permissions...';

        SET IDENTITY_INSERT [dbo].[permissions] ON;

        INSERT INTO [dbo].[permissions] (
            [permission_id], [permission_code], [permission_name], [category],
            [description], [is_active], [created_at], [created_by],
            [updated_at], [updated_by]
        )
        SELECT
            [permission_id], [permission_code], [permission_name], [category],
            [description], [is_active], [created_at], [created_by],
            [updated_at], [updated_by]
        FROM #permissions_backup;

        SET IDENTITY_INSERT [dbo].[permissions] OFF;

        PRINT 'Data restored successfully';
    END
    ELSE
    BEGIN
        PRINT 'No permissions data to restore (table was empty)';
    END
END
GO

-- Step 6: Recreate ALL foreign key constraints dynamically
PRINT 'Recreating foreign key constraints...';
GO

-- FK from role_permissions
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_role_permissions_permissions')
BEGIN
    ALTER TABLE [dbo].[role_permissions]
    ADD CONSTRAINT [FK_role_permissions_permissions]
    FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([permission_id]);
    PRINT '  Created FK_role_permissions_permissions';
END
GO

-- FK from user_permissions
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_permissions_permissions')
BEGIN
    ALTER TABLE [dbo].[user_permissions]
    ADD CONSTRAINT [FK_user_permissions_permissions]
    FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([permission_id]);
    PRINT '  Created FK_user_permissions_permissions';
END
GO

-- Step 7: Verify the fix
PRINT '';
PRINT 'Verifying the fix...';
GO

SELECT
    'permissions' AS TableName,
    'permission_id' AS ColumnName,
    is_identity AS HasIdentity,
    IDENT_SEED('permissions') AS IdentitySeed,
    IDENT_INCR('permissions') AS IdentityIncrement
FROM sys.columns
WHERE object_id = OBJECT_ID('permissions') AND name = 'permission_id';
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Permissions table fix completed!';
PRINT '========================================';
PRINT '';
GO
