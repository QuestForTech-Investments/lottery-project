-- =============================================
-- Script: Create draw_prize_configs table
-- Description: Almacena configuración personalizada de premios por sorteo y banca
-- Date: 2025-10-31
-- =============================================

USE [lottery-db];
GO

-- Drop table if exists (for development/testing)
IF OBJECT_ID('dbo.draw_prize_configs', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing draw_prize_configs table...';
    DROP TABLE dbo.draw_prize_configs;
END
GO

-- Create draw_prize_configs table
PRINT 'Creating draw_prize_configs table...';
GO

CREATE TABLE dbo.draw_prize_configs (
    config_id INT IDENTITY(1,1) NOT NULL,
    betting_pool_id INT NOT NULL,
    draw_id INT NOT NULL,
    prize_field_id INT NOT NULL,
    custom_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) NULL,

    CONSTRAINT PK_draw_prize_configs PRIMARY KEY CLUSTERED (config_id),

    -- FK a betting_pools
    CONSTRAINT FK_draw_prize_configs_betting_pool
        FOREIGN KEY (betting_pool_id)
        REFERENCES dbo.betting_pools(betting_pool_id)
        ON DELETE CASCADE,

    -- FK a draws
    CONSTRAINT FK_draw_prize_configs_draw
        FOREIGN KEY (draw_id)
        REFERENCES dbo.draws(draw_id)
        ON DELETE CASCADE,

    -- FK a prize_fields
    CONSTRAINT FK_draw_prize_configs_prize_field
        FOREIGN KEY (prize_field_id)
        REFERENCES dbo.prize_fields(prize_field_id)
        ON DELETE CASCADE,

    -- Evitar duplicados: una banca solo puede tener un valor por sorteo/campo
    CONSTRAINT UQ_banca_draw_prize_field
        UNIQUE (betting_pool_id, draw_id, prize_field_id)
);
GO

-- Create indexes for better query performance
PRINT 'Creating indexes on draw_prize_configs...';
GO

CREATE NONCLUSTERED INDEX IX_draw_prize_configs_betting_pool_id
    ON dbo.draw_prize_configs(betting_pool_id);
GO

CREATE NONCLUSTERED INDEX IX_draw_prize_configs_draw_id
    ON dbo.draw_prize_configs(draw_id);
GO

CREATE NONCLUSTERED INDEX IX_draw_prize_configs_prize_field_id
    ON dbo.draw_prize_configs(prize_field_id);
GO

-- Create composite index for common query pattern (banca + draw)
CREATE NONCLUSTERED INDEX IX_draw_prize_configs_betting_pool_draw
    ON dbo.draw_prize_configs(betting_pool_id, draw_id);
GO

PRINT 'draw_prize_configs table created successfully!';
GO
