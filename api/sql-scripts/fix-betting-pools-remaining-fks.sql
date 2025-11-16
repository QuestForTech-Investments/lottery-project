-- Complete the betting_pools foreign key recreation
-- This script only creates FKs for tables that exist and don't already have the FK

USE [lottery-db];
GO

PRINT 'Completing betting_pools foreign key recreation...';
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
    ELSE
    BEGIN
        PRINT '  FK_prizes_comm_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_prizes_commissions does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_schedules_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_schedules does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_sortitions_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_sortitions does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_styles_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_styles does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_pool_draws_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_draws does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_expenses_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_automatic_expenses does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_footers_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table betting_pool_footers does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_user_betting_pools_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table user_betting_pools does not exist - skipping';
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
    ELSE
    BEGIN
        PRINT '  FK_tickets_betting_pools already exists';
    END
END
ELSE
BEGIN
    PRINT '  Table tickets does not exist - skipping';
END
GO

-- Verify the betting_pools table has IDENTITY
PRINT '';
PRINT 'Verifying betting_pools table configuration...';
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
PRINT '✅ Betting_pools foreign keys completed!';
PRINT '========================================';
PRINT '';
GO
