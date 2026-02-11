-- Migration: Add stats panel configuration to betting_pool_config
-- Date: 2026-02-11
-- Description: Adds show_stats_panel (master toggle) and stats_panel_config (JSON with individual stat toggles)

-- Add show_stats_panel column (master ON/OFF toggle, default ON)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_config' AND COLUMN_NAME = 'show_stats_panel'
)
BEGIN
    ALTER TABLE betting_pool_config
    ADD show_stats_panel BIT NOT NULL DEFAULT 1;
    PRINT 'Added show_stats_panel column';
END
ELSE
BEGIN
    PRINT 'show_stats_panel column already exists';
END
GO

-- Add stats_panel_config column (JSON string with individual stat visibility)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'betting_pool_config' AND COLUMN_NAME = 'stats_panel_config'
)
BEGIN
    ALTER TABLE betting_pool_config
    ADD stats_panel_config NVARCHAR(500) DEFAULT NULL;
    PRINT 'Added stats_panel_config column';
END
ELSE
BEGIN
    PRINT 'stats_panel_config column already exists';
END
GO
