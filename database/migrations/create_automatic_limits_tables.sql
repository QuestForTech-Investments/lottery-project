-- Migration: Create Automatic Limits Tables
-- Date: 2026-02-06
-- Description: Creates tables for automatic limit configuration and random block configuration

-- =============================================
-- Table: automatic_limit_configs
-- Stores general and line number control settings
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[automatic_limit_configs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[automatic_limit_configs] (
        [config_id] INT IDENTITY(1,1) NOT NULL,
        [config_type] NVARCHAR(50) NOT NULL,
        [enable_directo] BIT NOT NULL DEFAULT 0,
        [monto_directo] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [enable_pale] BIT NOT NULL DEFAULT 0,
        [monto_pale] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [enable_super_pale] BIT NOT NULL DEFAULT 0,
        [monto_super_pale] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NULL,
        CONSTRAINT [PK_automatic_limit_configs] PRIMARY KEY CLUSTERED ([config_id] ASC)
    );

    -- Create unique index on config_type to ensure only one config per type
    CREATE UNIQUE INDEX [IX_automatic_limit_configs_type] ON [dbo].[automatic_limit_configs] ([config_type]);

    PRINT 'Table automatic_limit_configs created successfully.';
END
ELSE
BEGIN
    PRINT 'Table automatic_limit_configs already exists.';
END
GO

-- =============================================
-- Table: random_block_configs
-- Stores random block configuration
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[random_block_configs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[random_block_configs] (
        [config_id] INT IDENTITY(1,1) NOT NULL,
        [draw_ids] NVARCHAR(500) NULL,
        [betting_pool_id] INT NULL,
        [pales_to_block] INT NOT NULL DEFAULT 0,
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NULL,
        CONSTRAINT [PK_random_block_configs] PRIMARY KEY CLUSTERED ([config_id] ASC),
        CONSTRAINT [FK_random_block_configs_betting_pool] FOREIGN KEY ([betting_pool_id]) REFERENCES [dbo].[betting_pools] ([betting_pool_id])
    );

    PRINT 'Table random_block_configs created successfully.';
END
ELSE
BEGIN
    PRINT 'Table random_block_configs already exists.';
END
GO

-- =============================================
-- Insert default configuration if not exists
-- =============================================
IF NOT EXISTS (SELECT 1 FROM [dbo].[automatic_limit_configs] WHERE [config_type] = 'general')
BEGIN
    INSERT INTO [dbo].[automatic_limit_configs]
        ([config_type], [enable_directo], [monto_directo], [enable_pale], [monto_pale], [enable_super_pale], [monto_super_pale])
    VALUES
        ('general', 0, 0, 0, 0, 0, 0);
    PRINT 'Default general config inserted.';
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[automatic_limit_configs] WHERE [config_type] = 'line')
BEGIN
    INSERT INTO [dbo].[automatic_limit_configs]
        ([config_type], [enable_directo], [monto_directo], [enable_pale], [monto_pale], [enable_super_pale], [monto_super_pale])
    VALUES
        ('line', 0, 0, 0, 0, 0, 0);
    PRINT 'Default line config inserted.';
END
GO

PRINT 'Automatic limits tables migration completed.';
GO
