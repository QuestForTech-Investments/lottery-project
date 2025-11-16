-- =============================================
-- Script: Create banca_prize_configs table
-- Description: Almacena configuración personalizada de premios por banca
-- Date: 2025-10-31
-- =============================================

USE [lottery-db];
GO

-- Drop table if exists (for development/testing)
IF OBJECT_ID('dbo.banca_prize_configs', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing banca_prize_configs table...';
    DROP TABLE dbo.banca_prize_configs;
END
GO

-- Create banca_prize_configs table
PRINT 'Creating banca_prize_configs table...';
GO

CREATE TABLE dbo.banca_prize_configs (
    config_id INT IDENTITY(1,1) NOT NULL,
    betting_pool_id INT NOT NULL,
    prize_field_id INT NOT NULL,
    custom_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) NULL,

    CONSTRAINT PK_banca_prize_configs PRIMARY KEY CLUSTERED (config_id),

    -- FK a betting_pools
    CONSTRAINT FK_banca_prize_configs_betting_pool
        FOREIGN KEY (betting_pool_id)
        REFERENCES dbo.betting_pools(betting_pool_id)
        ON DELETE CASCADE,

    -- FK a prize_fields
    CONSTRAINT FK_banca_prize_configs_prize_field
        FOREIGN KEY (prize_field_id)
        REFERENCES dbo.prize_fields(prize_field_id)
        ON DELETE CASCADE,

    -- Evitar duplicados: una banca solo puede tener un valor por campo
    CONSTRAINT UQ_banca_prize_field
        UNIQUE (betting_pool_id, prize_field_id)
);
GO

-- Create indexes for better query performance
PRINT 'Creating indexes on banca_prize_configs...';
GO

CREATE NONCLUSTERED INDEX IX_banca_prize_configs_betting_pool_id
    ON dbo.banca_prize_configs(betting_pool_id);
GO

CREATE NONCLUSTERED INDEX IX_banca_prize_configs_prize_field_id
    ON dbo.banca_prize_configs(prize_field_id);
GO

PRINT 'banca_prize_configs table created successfully!';
PRINT 'Total records: 0 (empty table, will be populated when bancas configure custom premio values)';
GO

-- Verify table structure
SELECT
    'banca_prize_configs' AS TableName,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'banca_prize_configs'
ORDER BY ORDINAL_POSITION;
GO
