-- Fix betting_pools table: Add IDENTITY to betting_pool_id column
-- This script dynamically finds ALL foreign keys and recreates the table with IDENTITY
-- Based on fix-users-table-v2.sql pattern

USE [lottery-db];
GO

PRINT 'Starting betting_pools table fix...';
GO

-- Step 1: Find and drop ALL foreign keys that reference betting_pools
PRINT 'Finding all foreign keys that reference betting_pools...';
GO

DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql +
    'ALTER TABLE [' + SCHEMA_NAME(fk.schema_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] ' +
    'DROP CONSTRAINT [' + fk.name + ']; ' + CHAR(13) +
    'PRINT ''  Dropped ' + fk.name + ''';' + CHAR(13)
FROM sys.foreign_keys fk
WHERE fk.referenced_object_id = OBJECT_ID('dbo.betting_pools');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Dropping foreign key constraints...';
    EXEC sp_executesql @sql;
END
ELSE
BEGIN
    PRINT 'No foreign keys found referencing betting_pools table';
END
GO

-- Step 2: Backup existing data
PRINT 'Backing up existing betting_pools data...';
GO

IF OBJECT_ID('tempdb..#betting_pools_backup') IS NOT NULL DROP TABLE #betting_pools_backup;
GO

SELECT *
INTO #betting_pools_backup
FROM [dbo].[betting_pools];
GO

DECLARE @BackupCount INT;
SELECT @BackupCount = COUNT(*) FROM #betting_pools_backup;
PRINT 'Backed up ' + CAST(@BackupCount AS VARCHAR(10)) + ' betting pools';
GO

-- Step 3: Drop the original betting_pools table
PRINT 'Dropping original betting_pools table...';
GO

DROP TABLE [dbo].[betting_pools];
GO

PRINT 'Original betting_pools table dropped';
GO

-- Step 4: Create new betting_pools table WITH IDENTITY
PRINT 'Creating new betting_pools table with IDENTITY...';
GO

CREATE TABLE [dbo].[betting_pools] (
    [betting_pool_id] int NOT NULL IDENTITY(1,1),
    [betting_pool_code] nvarchar(20) NOT NULL,
    [betting_pool_name] nvarchar(100) NOT NULL,
    [zone_id] int NOT NULL,
    [bank_id] int NULL,
    [address] nvarchar(255) NULL,
    [phone] nvarchar(20) NULL,
    [location] varchar(255) NULL,
    [reference] varchar(255) NULL,
    [comment] text NULL,
    [username] nvarchar(100) NULL,
    [password_hash] varchar(255) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    [deleted_at] datetime2 NULL,
    [deleted_by] int NULL,
    [deletion_reason] nvarchar(500) NULL,
    CONSTRAINT [PK_betting_pools] PRIMARY KEY ([betting_pool_id]),
    CONSTRAINT [UQ_betting_pool_code] UNIQUE ([betting_pool_code])
);
GO

PRINT 'New betting_pools table created with IDENTITY';
GO

-- Step 5: Restore data (if any existed)
IF EXISTS (SELECT 1 FROM tempdb.sys.objects WHERE object_id = OBJECT_ID('tempdb..#betting_pools_backup'))
BEGIN
    DECLARE @RestoreCount INT;
    SELECT @RestoreCount = COUNT(*) FROM #betting_pools_backup;

    IF @RestoreCount > 0
    BEGIN
        PRINT 'Restoring ' + CAST(@RestoreCount AS VARCHAR(10)) + ' betting pools...';

        SET IDENTITY_INSERT [dbo].[betting_pools] ON;

        INSERT INTO [dbo].[betting_pools] (
            [betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id],
            [address], [phone], [location], [reference], [comment],
            [username], [password_hash], [is_active], [created_at], [created_by],
            [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]
        )
        SELECT
            [betting_pool_id], [betting_pool_code], [betting_pool_name], [zone_id], [bank_id],
            [address], [phone], [location], [reference], [comment],
            [username], [password_hash], [is_active], [created_at], [created_by],
            [updated_at], [updated_by], [deleted_at], [deleted_by], [deletion_reason]
        FROM #betting_pools_backup;

        SET IDENTITY_INSERT [dbo].[betting_pools] OFF;

        PRINT 'Data restored successfully';
    END
    ELSE
    BEGIN
        PRINT 'No betting_pools data to restore (table was empty)';
    END
END
GO

-- Step 6: Recreate ALL foreign key constraints

PRINT 'Recreating foreign key constraints...';
GO

-- FK from betting_pools to zones
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pools_zones')
BEGIN
    ALTER TABLE [dbo].[betting_pools]
    ADD CONSTRAINT [FK_betting_pools_zones]
    FOREIGN KEY ([zone_id]) REFERENCES [dbo].[zones]([zone_id]);
    PRINT '  Created FK_betting_pools_zones';
END
GO

-- FK from betting_pools to banks (nullable, SET NULL on delete)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_betting_pools_banks')
BEGIN
    ALTER TABLE [dbo].[betting_pools]
    ADD CONSTRAINT [FK_betting_pools_banks]
    FOREIGN KEY ([bank_id]) REFERENCES [dbo].[banks]([bank_id])
    ON DELETE SET NULL;
    PRINT '  Created FK_betting_pools_banks';
END
GO

-- FK from balances to betting_pools (CASCADE)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_balances_betting_pools')
BEGIN
    ALTER TABLE [dbo].[balances]
    ADD CONSTRAINT [FK_balances_betting_pools]
    FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
    ON DELETE CASCADE;
    PRINT '  Created FK_balances_betting_pools';
END
GO

-- FK from betting_pool_config to betting_pools (CASCADE)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_config_betting_pools')
BEGIN
    ALTER TABLE [dbo].[betting_pool_config]
    ADD CONSTRAINT [FK_config_betting_pools]
    FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
    ON DELETE CASCADE;
    PRINT '  Created FK_config_betting_pools';
END
GO

-- FK from betting_pool_print_config to betting_pools (CASCADE)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_print_config_betting_pools')
BEGIN
    ALTER TABLE [dbo].[betting_pool_print_config]
    ADD CONSTRAINT [FK_print_config_betting_pools]
    FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
    ON DELETE CASCADE;
    PRINT '  Created FK_print_config_betting_pools';
END
GO

-- FK from betting_pool_discount_config to betting_pools (CASCADE)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_discount_betting_pools')
BEGIN
    ALTER TABLE [dbo].[betting_pool_discount_config]
    ADD CONSTRAINT [FK_pool_discount_betting_pools]
    FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
    ON DELETE CASCADE;
    PRINT '  Created FK_pool_discount_betting_pools';
END
GO

-- FK from betting_pool_prizes_commissions to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_prizes_commissions')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_prizes_comm_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_prizes_commissions]
        ADD CONSTRAINT [FK_prizes_comm_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id]);
        PRINT '  Created FK_prizes_comm_betting_pools';
    END
END
GO

-- FK from betting_pool_schedules to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_schedules')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_schedules_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_schedules]
        ADD CONSTRAINT [FK_schedules_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id]);
        PRINT '  Created FK_schedules_betting_pools';
    END
END
GO

-- FK from betting_pool_sortitions to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_sortitions')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_sortitions_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_sortitions]
        ADD CONSTRAINT [FK_sortitions_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id]);
        PRINT '  Created FK_sortitions_betting_pools';
    END
END
GO

-- FK from betting_pool_styles to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_styles')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_styles_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_styles]
        ADD CONSTRAINT [FK_styles_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
        ON DELETE CASCADE;
        PRINT '  Created FK_styles_betting_pools';
    END
END
GO

-- FK from betting_pool_draws to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_draws')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_pool_draws_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_draws]
        ADD CONSTRAINT [FK_pool_draws_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id]);
        PRINT '  Created FK_pool_draws_betting_pools';
    END
END
GO

-- FK from betting_pool_automatic_expenses to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_automatic_expenses')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_expenses_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_automatic_expenses]
        ADD CONSTRAINT [FK_expenses_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id]);
        PRINT '  Created FK_expenses_betting_pools';
    END
END
GO

-- FK from betting_pool_footers to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_footers')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_footers_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[betting_pool_footers]
        ADD CONSTRAINT [FK_footers_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
        ON DELETE CASCADE;
        PRINT '  Created FK_footers_betting_pools';
    END
END
GO

-- FK from user_betting_pools to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'user_betting_pools')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_betting_pools_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[user_betting_pools]
        ADD CONSTRAINT [FK_user_betting_pools_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
        ON DELETE CASCADE;
        PRINT '  Created FK_user_betting_pools_betting_pools';
    END
END
GO

-- FK from tickets to betting_pools (if table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tickets')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tickets_betting_pools')
    BEGIN
        ALTER TABLE [dbo].[tickets]
        ADD CONSTRAINT [FK_tickets_betting_pools]
        FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools]([betting_pool_id])
        ON DELETE NO ACTION;
        PRINT '  Created FK_tickets_betting_pools';
    END
END
GO

-- Step 7: Verify the fix
PRINT '';
PRINT 'Verifying the fix...';
GO

SELECT
    'betting_pools' AS TableName,
    'betting_pool_id' AS ColumnName,
    is_identity AS HasIdentity,
    IDENT_SEED('betting_pools') AS IdentitySeed,
    IDENT_INCR('betting_pools') AS IdentityIncrement
FROM sys.columns
WHERE object_id = OBJECT_ID('betting_pools') AND name = 'betting_pool_id';
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Betting_pools table fix completed!';
PRINT '========================================';
PRINT '';
GO
