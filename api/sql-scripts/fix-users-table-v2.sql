-- Fix users table: Add IDENTITY to user_id column (Version 2)
-- This version dynamically finds ALL foreign keys

USE [lottery-db];
GO

PRINT 'Starting users table fix (v2)...';
GO

-- Step 1: Find and drop ALL foreign keys that reference users
PRINT 'Finding all foreign keys that reference users...';
GO

DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql +
    'ALTER TABLE [' + SCHEMA_NAME(fk.schema_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] ' +
    'DROP CONSTRAINT [' + fk.name + ']; ' + CHAR(13) +
    'PRINT ''  Dropped ' + fk.name + ''';' + CHAR(13)
FROM sys.foreign_keys fk
WHERE fk.referenced_object_id = OBJECT_ID('dbo.users');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Dropping foreign key constraints...';
    EXEC sp_executesql @sql;
END
ELSE
BEGIN
    PRINT 'No foreign keys found referencing users table';
END
GO

-- Step 2: Backup existing data
PRINT 'Backing up existing users data...';
GO

IF OBJECT_ID('tempdb..#users_backup') IS NOT NULL DROP TABLE #users_backup;
GO

SELECT *
INTO #users_backup
FROM [dbo].[users];
GO

DECLARE @BackupCount INT;
SELECT @BackupCount = COUNT(*) FROM #users_backup;
PRINT 'Backed up ' + CAST(@BackupCount AS VARCHAR(10)) + ' users';
GO

-- Step 3: Drop the original users table
PRINT 'Dropping original users table...';
GO

DROP TABLE [dbo].[users];
GO

PRINT 'Original users table dropped';
GO

-- Step 4: Create new users table WITH IDENTITY
PRINT 'Creating new users table with IDENTITY...';
GO

CREATE TABLE [dbo].[users] (
    [user_id] int NOT NULL IDENTITY(1,1),
    [username] nvarchar(50) NOT NULL,
    [password_hash] nvarchar(255) NOT NULL,
    [email] nvarchar(100) NULL,
    [full_name] nvarchar(200) NULL,
    [phone] nvarchar(20) NULL,
    [role_id] int NULL,
    [commission_rate] decimal(5,2) NULL DEFAULT 0.00,
    [is_active] bit NULL DEFAULT 1,
    [last_login_at] datetime2 NULL,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    [last_modified_ip] varchar(45) NULL,
    CONSTRAINT [PK_users] PRIMARY KEY ([user_id]),
    CONSTRAINT [UQ_users_username] UNIQUE ([username]),
    CONSTRAINT [UQ_users_email] UNIQUE ([email]),
    CONSTRAINT [FK_users_roles] FOREIGN KEY ([role_id]) REFERENCES [dbo].[roles]([role_id])
);
GO

PRINT 'New users table created with IDENTITY';
GO

-- Step 5: Restore data (if any existed)
IF EXISTS (SELECT 1 FROM tempdb.sys.objects WHERE object_id = OBJECT_ID('tempdb..#users_backup'))
BEGIN
    DECLARE @RestoreCount INT;
    SELECT @RestoreCount = COUNT(*) FROM #users_backup;

    IF @RestoreCount > 0
    BEGIN
        PRINT 'Restoring ' + CAST(@RestoreCount AS VARCHAR(10)) + ' users...';

        SET IDENTITY_INSERT [dbo].[users] ON;

        INSERT INTO [dbo].[users] (
            [user_id], [username], [password_hash], [email], [full_name], [phone],
            [role_id], [commission_rate], [is_active], [last_login_at],
            [created_at], [updated_at], [created_by], [updated_by],
            [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]
        )
        SELECT
            [user_id], [username], [password_hash], [email], [full_name], [phone],
            [role_id], [commission_rate], [is_active], [last_login_at],
            [created_at], [updated_at], [created_by], [updated_by],
            [deleted_at], [deleted_by], [deletion_reason], [last_modified_ip]
        FROM #users_backup;

        SET IDENTITY_INSERT [dbo].[users] OFF;

        PRINT 'Data restored successfully';
    END
    ELSE
    BEGIN
        PRINT 'No users data to restore (table was empty)';
    END
END
GO

-- Step 6: Recreate ALL foreign key constraints dynamically
PRINT 'Recreating foreign key constraints...';
GO

-- FK from user_betting_pools
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_users')
BEGIN
    ALTER TABLE [dbo].[user_betting_pools]
    ADD CONSTRAINT [FK_user_betting_pools_users]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_user_betting_pools_users';
END
GO

-- FK from user_zones
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_zones_users')
BEGIN
    ALTER TABLE [dbo].[user_zones]
    ADD CONSTRAINT [FK_user_zones_users]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_user_zones_users';
END
GO

-- FK from user_permissions
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_permissions_users')
BEGIN
    ALTER TABLE [dbo].[user_permissions]
    ADD CONSTRAINT [FK_user_permissions_users]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_user_permissions_users';
END
GO

-- FK from tickets
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tickets_users')
BEGIN
    ALTER TABLE [dbo].[tickets]
    ADD CONSTRAINT [FK_tickets_users]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_tickets_users';
END
GO

-- Self-referencing FKs
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_created_by')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD CONSTRAINT [FK_users_created_by]
    FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_users_created_by';
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_updated_by')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD CONSTRAINT [FK_users_updated_by]
    FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_users_updated_by';
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_deleted_by')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD CONSTRAINT [FK_users_deleted_by]
    FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([user_id]);
    PRINT '  Created FK_users_deleted_by';
END
GO

-- Step 7: Verify the fix
PRINT '';
PRINT 'Verifying the fix...';
GO

SELECT
    'users' AS TableName,
    'user_id' AS ColumnName,
    is_identity AS HasIdentity,
    IDENT_SEED('users') AS IdentitySeed,
    IDENT_INCR('users') AS IdentityIncrement
FROM sys.columns
WHERE object_id = OBJECT_ID('users') AND name = 'user_id';
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Users table fix completed!';
PRINT '========================================';
PRINT '';
GO
