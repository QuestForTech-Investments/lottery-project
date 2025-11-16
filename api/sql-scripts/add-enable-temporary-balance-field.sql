-- =============================================
-- Migration: Add enable_temporary_balance field to betting_pool_config
-- Date: 2025-10-29
-- Description: Adds a boolean field to control whether temporary balance is enabled
--              This separates the enable/disable flag from the actual balance amount
-- =============================================

USE lottery-db;
GO

-- Add the new column
ALTER TABLE betting_pool_config
ADD enable_temporary_balance BIT NOT NULL DEFAULT 0;
GO

-- Update existing records: Set to 1 (enabled) where temporary_additional_balance has a value > 0
UPDATE betting_pool_config
SET enable_temporary_balance = 1
WHERE temporary_additional_balance IS NOT NULL AND temporary_additional_balance > 0;
GO

-- Add comment/description for documentation
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Indicates if temporary additional balance is enabled for this betting pool',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'betting_pool_config',
    @level2type = N'COLUMN', @level2name = 'enable_temporary_balance';
GO

PRINT 'Migration completed successfully!';
PRINT 'Added enable_temporary_balance column to betting_pool_config table';
GO
