-- Fix users table: Add IDENTITY to user_id column
-- This script recreates the users table with IDENTITY

USE [lottery-db];
GO

PRINT 'Starting users table fix...';
GO

-- Check if there are existing users
DECLARE @UserCount INT;
SELECT @UserCount = COUNT(*) FROM users;
PRINT 'Current users in table: ' + CAST(@UserCount AS VARCHAR(10));
GO

-- Step 1: Drop foreign key constraints that reference users
PRINT 'Dropping foreign key constraints...';
GO

-- Drop FK from user_betting_pools
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_users')
BEGIN
    ALTER TABLE [dbo].[user_betting_pools] DROP CONSTRAINT [FK_user_betting_pools_users];
    PRINT '  Dropped FK_user_betting_pools_users';
END
GO

-- Drop FK from user_zones
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_zones_users')
BEGIN
    ALTER TABLE [dbo].[user_zones] DROP CONSTRAINT [FK_user_zones_users];
    PRINT '  Dropped FK_user_zones_users';
END
GO

-- Drop FK from user_permissions
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_permissions_users')
BEGIN
    ALTER TABLE [dbo].[user_permissions] DROP CONSTRAINT [FK_user_permissions_users];
    PRINT '  Dropped FK_user_permissions_users';
END
GO

-- Drop FK from tickets
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tickets_users')
BEGIN
    ALTER TABLE [dbo].[tickets] DROP CONSTRAINT [FK_tickets_users];
    PRINT '  Dropped FK_tickets_users';
END
GO

-- Drop FK from users (self-reference for created_by, updated_by, deleted_by)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_created_by')
BEGIN
    ALTER TABLE [dbo].[users] DROP CONSTRAINT [FK_users_created_by];
    PRINT '  Dropped FK_users_created_by';
END
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_updated_by')
BEGIN
    ALTER TABLE [dbo].[users] DROP CONSTRAINT [FK_users_updated_by];
    PRINT '  Dropped FK_users_updated_by';
END
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_deleted_by')
BEGIN
    ALTER TABLE [dbo].[users] DROP CONSTRAINT [FK_users_deleted_by];
    PRINT '  Dropped FK_users_deleted_by';
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
    -- Campos de auditoría
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
    PRINT 'Restoring backed up users data...';

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

    DECLARE @RestoredCount INT;
    SELECT @RestoredCount = COUNT(*) FROM [dbo].[users];
    PRINT 'Restored ' + CAST(@RestoredCount AS VARCHAR(10)) + ' users';
END
ELSE
BEGIN
    PRINT 'No users data to restore (table was empty)';
END
GO

-- Step 6: Recreate foreign key constraints
PRINT 'Recreating foreign key constraints...';
GO

-- FK from user_betting_pools to users
ALTER TABLE [dbo].[user_betting_pools]
ADD CONSTRAINT [FK_user_betting_pools_users]
FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_user_betting_pools_users';
GO

-- FK from user_zones to users
ALTER TABLE [dbo].[user_zones]
ADD CONSTRAINT [FK_user_zones_users]
FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_user_zones_users';
GO

-- FK from user_permissions to users
ALTER TABLE [dbo].[user_permissions]
ADD CONSTRAINT [FK_user_permissions_users]
FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_user_permissions_users';
GO

-- FK from tickets to users
ALTER TABLE [dbo].[tickets]
ADD CONSTRAINT [FK_tickets_users]
FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_tickets_users';
GO

-- Self-referencing FKs (created_by, updated_by, deleted_by)
ALTER TABLE [dbo].[users]
ADD CONSTRAINT [FK_users_created_by]
FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_users_created_by';
GO

ALTER TABLE [dbo].[users]
ADD CONSTRAINT [FK_users_updated_by]
FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_users_updated_by';
GO

ALTER TABLE [dbo].[users]
ADD CONSTRAINT [FK_users_deleted_by]
FOREIGN KEY ([deleted_by]) REFERENCES [dbo].[users]([user_id]);
PRINT '  Created FK_users_deleted_by';
GO

-- Step 7: Verify the fix
PRINT 'Verifying the fix...';
GO

-- Check IDENTITY
SELECT
    OBJECT_NAME(object_id) AS TableName,
    name AS ColumnName,
    is_identity,
    IDENT_SEED(OBJECT_NAME(object_id)) AS IdentitySeed,
    IDENT_INCR(OBJECT_NAME(object_id)) AS IdentityIncrement
FROM sys.columns
WHERE object_id = OBJECT_ID('users') AND name = 'user_id';
GO

-- Check constraints
SELECT
    OBJECT_NAME(parent_object_id) AS TableName,
    name AS ConstraintName,
    type_desc AS ConstraintType
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('users') AND type IN ('PK', 'UQ', 'F');
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Users table fix completed!';
PRINT '========================================';
PRINT '';
PRINT 'Summary:';
PRINT '  - user_id now has IDENTITY(1,1)';
PRINT '  - All foreign keys recreated';
PRINT '  - Data preserved (if any existed)';
PRINT '';
PRINT 'You can now register users via the API!';
GO
